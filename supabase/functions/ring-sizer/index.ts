const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/responses";
const MODEL = "openai/gpt-6-astra";
const SAMPLES = 5;
// Seen from above, a finger looks wider than it is deep, so the visible width overstates
// the round inner diameter a ring needs. This brings the width back to a ring diameter.
const WIDTH_TO_DIAMETER = 0.95;

const SIZE_CHART = [
  { size: "5", diameter: 15.7 },
  { size: "6", diameter: 16.5 },
  { size: "7", diameter: 17.3 },
  { size: "8", diameter: 18.2 },
  { size: "9", diameter: 19.0 },
  { size: "10", diameter: 19.8 },
  { size: "11", diameter: 20.6 },
  { size: "12", diameter: 21.4 },
  { size: "13", diameter: 22.2 },
];

const PROMPT = [
  "You locate points in a photo for ring sizing. The photo shows a hand with a standard bank card (85.60 x 53.98 mm) resting on the palm or near the fingers.",
  "Use normalized coordinates: x from 0 (left edge) to 1000 (right edge), y from 0 (top edge) to 1000 (bottom edge) of the full image.",
  "1) card_corners: the four corners of the card, in order around the card (clockwise), placed exactly on the card's outer corners.",
  "2) finger_edges: two points on opposite skin edges of the chosen finger, across its LOWER segment (between the palm and the first knuckle, where a ring sits), on a line perpendicular to the finger. If the card covers the finger base, use the visible part of the lower segment just beyond the card edge. Put each point exactly on the skin edge, not inside the finger and not on the background.",
  "Be as precise as possible; small errors change the ring size.",
  "Set ok to false only if the card or the finger's lower segment is not visible; then use empty arrays.",
  "Confidence: 'high' when sharp and flat-on, 'medium' when angled or soft, 'low' otherwise. Note: one short sentence, no dashes. Answer in json.",
].join(" ");

const POINT = { type: "array", items: { type: "number" } };
const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["ok", "card_corners", "finger_edges", "confidence", "note"],
  properties: {
    ok: { type: "boolean" },
    card_corners: { type: "array", items: POINT },
    finger_edges: { type: "array", items: POINT },
    confidence: { type: ["string", "null"], enum: ["high", "medium", "low", null] },
    note: { type: "string" },
  },
};

type Pt = [number, number];
type Sample = { ok: boolean; card_corners: Pt[]; finger_edges: Pt[]; confidence: string | null; note: string };

async function readStream(res: Response) {
  const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();
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

const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const median = (v: number[]) => {
  const s = [...v].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

// mm per pixel from 4 card corners in pixel space
function cardScale(pts: Pt[]) {
  const s = [dist(pts[0], pts[1]), dist(pts[1], pts[2]), dist(pts[2], pts[3]), dist(pts[3], pts[0])];
  const a = (s[0] + s[2]) / 2, b = (s[1] + s[3]) / 2;
  const longPx = Math.max(a, b), shortPx = Math.min(a, b);
  if (longPx < 10 || shortPx < 10) return null;
  const ratio = longPx / shortPx;
  if (ratio < 1.2 || ratio > 2.2) return null; // not a card shape
  return (85.6 / longPx + 53.98 / shortPx) / 2;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI service is not configured." }, 500);

    const form = await req.formData();
    const image = form.get("image");
    const finger = String(form.get("finger") ?? "index").replace(/[^a-z]/gi, "").slice(0, 10) || "index";
    let W = Number(form.get("img_width")) || 0;
    let H = Number(form.get("img_height")) || 0;

    // Optional user-marked corners (normalized 0..1) give an exact scale.
    let userScale: number | null = null;
    try {
      const raw = form.get("card_corners");
      if (typeof raw === "string" && raw) {
        const c = JSON.parse(raw);
        const cw = Number(c.width), ch = Number(c.height);
        if (cw > 0 && ch > 0) { W = W || cw; H = H || ch; }
        const pts = (c.corners as number[][]).map(([x, y]) => [Number(x) * cw, Number(y) * ch] as Pt);
        if (pts.length === 4 && pts.every((p) => p.every(Number.isFinite))) userScale = cardScale(pts);
      }
    } catch {
      userScale = null;
    }

    if (!(image instanceof File) || image.size === 0) {
      return json({ error: "Please upload a photo of your hand with a bank card." }, 400);
    }
    if (image.size > 12 * 1024 * 1024) {
      return json({ error: "Photo is too large. Please use an image under 12 MB." }, 400);
    }
    if (!(W > 0 && H > 0)) { W = 1000; H = 1000; }

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
          reasoning: { effort: "low" },
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
        return JSON.parse(await readStream(upstream)) as Sample;
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

    const toPx = (p: number[]): Pt => [(Number(p[0]) / 1000) * W, (Number(p[1]) / 1000) * H];
    const widths: number[] = [];
    for (const s of samples) {
      if (!s.ok || s.card_corners?.length !== 4 || s.finger_edges?.length !== 2) continue;
      const corners = s.card_corners.map(toPx);
      const edges = s.finger_edges.map(toPx);
      if (![...corners, ...edges].every((p) => p.every(Number.isFinite))) continue;
      const scale = userScale ?? cardScale(corners);
      if (!scale) continue;
      const mm = dist(edges[0], edges[1]) * scale;
      if (mm > 10 && mm < 30) widths.push(mm);
    }

    if (!widths.length) {
      return json({
        ok: false, us_size: null, inner_diameter_mm: null, confidence: null,
        note: samples[0]?.note || "We could not see the card and finger clearly. Please retake the photo with the card flat on your palm.",
      });
    }

    const mm = median(widths) * WIDTH_TO_DIAMETER;
    const spread = (Math.max(...widths) - Math.min(...widths)) * WIDTH_TO_DIAMETER;
    const match = SIZE_CHART.reduce((best, r) => (Math.abs(r.diameter - mm) < Math.abs(best.diameter - mm) ? r : best));
    let confidence = widths.length < 2 || spread > 1.6 ? "low" : spread > 0.8 ? "medium" : "high";
    const modelConf = samples.find((s) => s.confidence)?.confidence;
    if (modelConf === "low" || (modelConf === "medium" && confidence === "high")) confidence = modelConf;

    let note = "Measured several times from your photo and averaged.";
    const idx = SIZE_CHART.indexOf(match);
    const neighbour = mm > match.diameter ? SIZE_CHART[idx + 1] : SIZE_CHART[idx - 1];
    if (neighbour && Math.abs(mm - match.diameter) > 0.3) {
      note += ` You are between US ${match.size} and US ${neighbour.size}; the free sizing kit will confirm.`;
    }
    if (mm > 22.6 || mm < 16.1) {
      note += " This is outside our US 6 to 13 range, so please retake the photo or use the free sizing kit.";
      confidence = "low";
    }

    return json({ ok: true, us_size: match.size, inner_diameter_mm: Math.round(mm * 10) / 10, confidence, note });
  } catch (error) {
    console.error("ring-sizer failed", error);
    return json({ error: "Could not estimate your size. Please try again." }, 500);
  }
});
