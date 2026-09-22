const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/responses";
const MODEL = "openai/gpt-6-astra";

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
  "You are a ring-sizing assistant. The photo shows a hand photographed together with a standard bank/credit card (ISO/IEC 7810 ID-1, exactly 85.60 mm wide and 53.98 mm tall) used as a scale reference. The card may lie flat beside the hand, rest on the open palm, or rest against the fingers, any of these is fine as long as the card is flat and in roughly the same plane as the fingers, and the finger base is visible.",
  "Step 1: locate the card and measure its long edge in pixels to get a millimetres-per-pixel scale. If the card is angled, correct for perspective using both edges.",
  "Step 2: measure the width of the finger the ring will be worn on across its LOWER segment (the proximal phalanx, between the palm and the first knuckle), where a ring sits. Unless told otherwise, use the index finger, the finger next to the thumb. The recommended pose has the card resting on the palm, so the card often covers the very base where the finger joins the palm. That is expected and fine: measure the finger width on the visible part of the lower segment just above the card's top edge, perpendicular to the finger's direction, edge of skin to edge of skin. Do not measure at the middle knuckle or fingertip.",
  "Step 3: that finger width is the ring's inner diameter in millimetres. Convert to a US ring size using: 5=15.7mm, 6=16.5, 7=17.3, 8=18.2, 9=19.0, 10=19.8, 11=20.6, 12=21.4, 13=22.2. Round to the nearest whole size, and when the measurement falls between sizes, round UP (the knuckle must pass through the ring).",
  "Only set ok to false if the card is missing or unreadable, or none of the chosen finger's lower segment is visible. A card covering the finger base is NOT a reason to reject. Otherwise give your best measurement and lower the confidence instead. In the note, state the card edge and finger width you measured in pixels, in one or two short sentences, without dashes.",
  "Confidence: 'high' when the card and finger base are both sharp and flat-on, 'medium' when angled or slightly soft, 'low' otherwise.",
  "Never invent a measurement you cannot see. Answer in json.",
].join(" ");

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["ok", "us_size", "inner_diameter_mm", "confidence", "note"],
  properties: {
    ok: { type: "boolean" },
    us_size: { type: ["string", "null"] },
    inner_diameter_mm: { type: ["number", "null"] },
    confidence: { type: ["string", "null"], enum: ["high", "medium", "low", null] },
    note: { type: "string" },
  },
};

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
          // ignore partial/non-JSON frames
        }
      }
    }
  }
  return text;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI service is not configured." }, 500);

    const form = await req.formData();
    const image = form.get("image");
    const finger = String(form.get("finger") ?? "index").replace(/[^a-z]/gi, "").slice(0, 10) || "index";

    let cardHint = "";
    try {
      const raw = form.get("card_corners");
      if (typeof raw === "string" && raw) {
        const c = JSON.parse(raw);
        const W = Number(c.width), H = Number(c.height);
        const pts = (c.corners as number[][]).map(([x, y]) => [Number(x) * W, Number(y) * H]);
        if (W > 0 && H > 0 && pts.length === 4 && pts.every((p) => p.every(Number.isFinite))) {
          const d = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1]);
          const s = [d(pts[0], pts[1]), d(pts[1], pts[2]), d(pts[2], pts[3]), d(pts[3], pts[0])];
          const pairA = (s[0] + s[2]) / 2, pairB = (s[1] + s[3]) / 2;
          const longPx = Math.max(pairA, pairB), shortPx = Math.min(pairA, pairB);
          const mmPerPx = (85.6 / longPx + 53.98 / shortPx) / 2;
          const fmt = (p: number[]) => `(${(p[0] / W * 100).toFixed(1)}% , ${(p[1] / H * 100).toFixed(1)}%)`;
          cardHint = ` The user has manually marked the four card corners at ${pts.map(fmt).join(", ")} of the image width/height (image is ${W}x${H} px). From these marks the card's long edge is ${longPx.toFixed(0)} px and short edge ${shortPx.toFixed(0)} px in the original image, giving a scale of about ${mmPerPx.toFixed(4)} mm per original-image pixel, i.e. the card long edge spans ${(longPx / W * 100).toFixed(1)}% of the image width. Treat these user marks as the authoritative card location and scale; measure the finger width relative to the card's marked long edge (85.60 mm). Only ignore the marks if they clearly do not surround a card.`;
        }
      }
    } catch {
      cardHint = "";
    }

    if (!(image instanceof File) || image.size === 0) {
      return json({ error: "Please upload a photo of your hand with a bank card." }, 400);
    }
    if (image.size > 12 * 1024 * 1024) {
      return json({ error: "Photo is too large. Please use an image under 12 MB." }, 400);
    }

    const bytes = new Uint8Array(await image.arrayBuffer());
    let binary = "";
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    const dataUrl = `data:${image.type || "image/jpeg"};base64,${btoa(binary)}`;

    const upstream = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        reasoning: { effort: "low" },
        text: { format: { type: "json_schema", name: "ring_size", strict: true, schema: SCHEMA } },
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: `${PROMPT} The ring will be worn on the ${finger} finger.${cardHint}` },
              { type: "input_image", image_url: dataUrl },
            ],
          },
        ],
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => "");
      console.error("ring-sizer upstream error", upstream.status, detail.slice(0, 500));
      if (upstream.status === 429) return json({ error: "Too many requests right now. Please try again shortly." }, 429);
      if (upstream.status === 402) return json({ error: "AI credits are exhausted. Please try again later." }, 402);
      return json({ error: "Could not estimate your size. Please try again." }, 502);
    }

    const text = await readStream(upstream);
    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
    if (!parsed) return json({ error: "Could not read a measurement from that photo. Please try another." }, 422);

    if (parsed.ok && typeof parsed.inner_diameter_mm === "number" && !parsed.us_size) {
      const mm = parsed.inner_diameter_mm;
      const match = SIZE_CHART.find((r) => r.diameter >= mm) ?? SIZE_CHART[SIZE_CHART.length - 1];
      parsed.us_size = match.size;
    }

    return json(parsed);
  } catch (error) {
    console.error("ring-sizer failed", error);
    return json({ error: "Could not estimate your size. Please try again." }, 500);
  }
});
