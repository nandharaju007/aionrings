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
  "Step 2: measure the width of the finger the ring will be worn on at the BASE of the finger (the segment nearest the palm, just above the knuckle where the finger joins the hand). Unless told otherwise, use the index finger, the finger next to the thumb.",
  "Step 3: that finger width is the ring's inner diameter in millimetres. Convert to a US ring size using: 5=15.7mm, 6=16.5, 7=17.3, 8=18.2, 9=19.0, 10=19.8, 11=20.6, 12=21.4, 13=22.2. Round to the nearest whole size, and when the measurement falls between sizes, round UP.",
  "Only set ok to false if the card is missing or unreadable, or the base of the chosen finger is not visible. Otherwise give your best measurement and lower the confidence instead.",
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
    const finger = String(form.get("finger") ?? "index");

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
              { type: "input_text", text: `${PROMPT} The ring will be worn on the ${finger} finger.` },
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
