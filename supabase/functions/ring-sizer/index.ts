import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { createClient } from "npm:@supabase/supabase-js@2";
import { summarizeWithReference, qualityFlags, estimateSize, type Point, type ChartRow } from "./measurement.ts";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/responses";
const MODEL = "openai/gpt-6-astra";
const SAMPLES = 6;
const PROMPT = [
  "You locate visible finger edges for an experimental projected-width measurement, not a ring size. The photo shows a hand with a standard bank card (85.60 x 53.98 mm) resting on the palm or near the fingers.",
  "Use normalized coordinates: x from 0 (left edge) to 1000 (right edge), y from 0 (top edge) to 1000 (bottom edge) of the full image.",
  "1) card_corners: the four OUTER corners of the card, clockwise. Include the full card including rounded corners; do not place them on printed designs inside the card.",
  "2) finger_edges: two points on opposite skin edges of the chosen finger, across its LOWER segment (between the palm crease and the first knuckle, where a ring sits), on a line perpendicular to the finger's direction. Reject if adjacent fingers overlap either edge or the ring-wearing segment is obscured. Put each point exactly where skin meets background, at the outermost edge of the finger silhouette. Do not measure at the fingertip or at a knuckle.",
  "Locate edges only; do not guess a ring size or an anatomical correction.",
  "Reference: use a bank card (85.60 x 53.98 mm) if present, else a US quarter (24.26 mm). Set reference to 'card', 'quarter' or 'none'. For a quarter, coin_edges are two points on opposite edges across its full diameter; otherwise empty.",
  "Quality: blurry true if edges are soft; too_dark true if underexposed; hand_tilted true if the palm or reference is not flat-on to the camera.",
  "Set ok to false only if the card or the finger's lower segment is not visible; then use empty arrays.",
  "Confidence: 'high' when sharp and flat-on, 'medium' when angled or soft, 'low' otherwise. Note: one short sentence, no dashes. Answer in json.",
].join(" ");

const POINT = { type: "array", items: { type: "number" } };
const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["ok", "reference", "card_corners", "coin_edges", "finger_edges", "confidence", "blurry", "too_dark", "hand_tilted", "note"],
  properties: {
    ok: { type: "boolean" },
    card_corners: { type: "array", items: POINT },
    finger_edges: { type: "array", items: POINT },
    reference: { type: "string", enum: ["card", "quarter", "none"] },
    coin_edges: { type: "array", items: POINT },
    blurry: { type: "boolean" },
    too_dark: { type: "boolean" },
    hand_tilted: { type: "boolean" },
    confidence: { type: ["string", "null"], enum: ["high", "medium", "low", null] },
    note: { type: "string" },
  },
};

type Pt = Point;
type Sample = z.infer<typeof SampleSchema>;

async function readStream(res: Response) {
  if (!res.body) throw new Error("Missing response body");
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += value;
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const block of parts) {
      for (const line of block.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const raw = line.slice(5).trim();
        if (!raw || raw === "[DONE]") continue;
        try {
          const evt = JSON.parse(raw);
          if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") text += evt.delta;
          if (evt.type === "response.completed" && typeof evt.response?.output_text === "string" && !text) {
            text = evt.response.output_text;
          }
        } catch {
          // ignore partial frames
        }
      }
    }
  }
  return text;
}

const PointSchema = z.tuple([z.number().finite().min(0).max(1000), z.number().finite().min(0).max(1000)]);
const SampleSchema = z.object({ ok: z.boolean(), card_corners: z.array(PointSchema).max(4), finger_edges: z.array(PointSchema).max(2), reference: z.enum(["card", "quarter", "none"]), coin_edges: z.array(PointSchema).max(2), blurry: z.boolean(), too_dark: z.boolean(), hand_tilted: z.boolean(), confidence: z.enum(["high", "medium", "low"]).nullable(), note: z.string().max(1000) });
const Dimensions = z.object({ width: z.coerce.number().int().min(100).max(20000), height: z.coerce.number().int().min(100).max(20000), finger: z.enum(["index", "middle", "ring"]) });
const MarkedCard = z.object({ width: z.number().int().positive(), height: z.number().int().positive(), corners: z.array(z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)])).length(4) });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI service is not configured." }, 500);

    const form = await req.formData();
    const image = form.get("image");
    const parsed = Dimensions.safeParse({ width: form.get("img_width"), height: form.get("img_height"), finger: form.get("finger") ?? "index" });
    if (!parsed.success) return json({ error: "Please upload a photo with valid dimensions and choose a finger." }, 400);
    const { width: W, height: H, finger } = parsed.data;
    let markedCorners: Pt[] | undefined;
    const raw = form.get("card_corners");
    if (raw) {
      try {
        const marked = MarkedCard.parse(JSON.parse(String(raw)));
        if (marked.width !== W || marked.height !== H) return json({ error: "Card markers do not match the photo dimensions." }, 400);
        markedCorners = marked.corners.map(([x, y]) => [x * 1000, y * 1000]);
      } catch { return json({ error: "Please mark all four card corners within the photo." }, 400); }
    }

    if (!(image instanceof File) || image.size === 0) {
      return json({ error: "Please upload a photo of your hand with a bank card." }, 400);
    }
    if (image.size > 12 * 1024 * 1024) {
      return json({ error: "Photo is too large. Please use an image under 12 MB." }, 400);
    }
    if (!image.type.startsWith("image/")) return json({ error: "Please upload an image file." }, 400);

    const bytes = new Uint8Array(await image.arrayBuffer());
    let binary = "";
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    const dataUrl = `data:${image.type || "image/jpeg"};base64,${btoa(binary)}`;

    const callOnce = async (): Promise<Sample | { status: number } | null> => {
      const upstream = await fetch(GATEWAY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "fetch" },
        body: JSON.stringify({
          model: MODEL,
          stream: true,
          store: false,
          reasoning: { effort: "medium", summary: "auto" },
          include: ["reasoning.encrypted_content"],
          text: { format: { type: "json_schema", name: "ring_points", strict: true, schema: SCHEMA } },
          input: [{
            role: "user",
            content: [
              { type: "input_text", text: `${PROMPT} The ring will be worn on the ${finger} finger. The image is ${W}x${H} pixels.` },
              { type: "input_image", image_url: dataUrl },
            ],
          }],
        }),
      });
      if (!upstream.ok || !upstream.body) {
        const detail = await upstream.text().catch(() => "");
        console.error("ring-sizer upstream error", upstream.status, detail.slice(0, 300));
        return { status: upstream.status };
      }
      try {
        const parsed = SampleSchema.safeParse(JSON.parse(await readStream(upstream)));
        return parsed.success ? parsed.data : null;
      } catch {
        return null;
      }
    };

    const results = await Promise.all(Array.from({ length: SAMPLES }, callOnce));
    const failed = results.find((r) => r && "status" in r) as { status: number } | undefined;
    const samples = results.filter((r): r is Sample => !!r && "ok" in r);

    if (!samples.length) {
      if (failed?.status === 429) return json({ error: "Too many requests right now. Please try again shortly." }, 429);
      if (failed?.status === 402) return json({ error: "AI credits are exhausted. Please try again later." }, 402);
      return json({ error: "Could not read a measurement from that photo. Please try another." }, 422);
    }

    // Card corners marked by hand still override the model's corners.
    const readings = markedCorners ? samples.map((r) => ({ ...r, card_corners: markedCorners! })) : samples;
    const width = summarizeWithReference(readings, W, H);
    const flags = qualityFlags(readings, W, H);
    if (width === null && !flags.length) flags.push("inconsistent");

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: settings } = await admin.from("sizing_settings").select("show_sizes, size_chart, chart_version").eq("id", true).maybeSingle();
    let benchCaller = false;
    if (form.get("bench") === "1") {
      const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
      const { data: u } = await admin.auth.getUser(token);
      if (u?.user) {
        const { data: isAdmin } = await admin.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
        benchCaller = isAdmin === true;
      }
      if (!benchCaller) return json({ error: "Admin sign-in required for the test bench." }, 403);
    }
    const estimate = width === null ? null : estimateSize(width, (settings?.size_chart ?? []) as ChartRow[]);
    const reveal = benchCaller || settings?.show_sizes === true;
    return json({
      ok: width !== null && flags.length === 0,
      projected_width_mm: width,
      quality_flags: flags,
      sizes_enabled: settings?.show_sizes === true,
      chart_version: settings?.chart_version ?? null,
      estimate: reveal && flags.length === 0 ? estimate : null,
      us_size: null,
      requires_physical_confirmation: !reveal,
    });
  } catch (error) {
    console.error("ring-sizer failed", error);
    return json({ error: "Could not estimate your size. Please try again." }, 500);
  }
});
