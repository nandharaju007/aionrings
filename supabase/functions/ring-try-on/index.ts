const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY_BASE_URL = "https://ai.gateway.lovable.dev";
const IMAGE_MODEL = "openai/gpt-image-2.5-sunburst";

const FINISH_DESCRIPTIONS: Record<string, string> = {
  "Midnight Black": "a matte midnight-black titanium finish with a subtle dark sheen",
  "Titanium Silver": "a brushed titanium-silver finish with soft metallic highlights",
  "Rose Gold": "a warm rose-gold titanium finish with soft metallic highlights",
};

function buildPrompt(finish: string) {
  const finishText = FINISH_DESCRIPTIONS[finish] ?? FINISH_DESCRIPTIONS["Midnight Black"];
  return [
    "Photorealistically place a slim, smooth smart ring on the INDEX FINGER of the hand in this photo.",
    `The ring is a seamless rounded band about 8mm wide with ${finishText}, no stones and no logo.`,
    "Wrap the band correctly around the finger with accurate perspective, curvature and thickness,",
    "matching the photo's existing lighting, shadows, skin tone, focus and grain.",
    "Do not change the hand, pose, fingers, nails, background, colours or framing in any other way.",
    "Return the same photo with only the ring added.",
  ].join(" ");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI service is not configured." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const incoming = await req.formData();
    const image = incoming.get("image");
    const finish = String(incoming.get("finish") ?? "Midnight Black");
    const streaming = incoming.get("stream") !== "false";

    if (!(image instanceof File) || image.size === 0) {
      return new Response(JSON.stringify({ error: "Please upload a photo of your hand." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (image.size > 12 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: "Photo is too large. Please use an image under 12 MB." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const form = new FormData();
    form.set("model", IMAGE_MODEL);
    form.set("prompt", buildPrompt(finish));
    form.set("image", image, image.name || "hand.png");
    form.set("size", "1024x1024");
    form.set("quality", "medium");
    if (streaming) {
      form.set("stream", "true");
      form.set("partial_images", "1");
    }

    const upstream = await fetch(`${GATEWAY_BASE_URL}/v1/images/edits`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        ...corsHeaders,
        "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("ring-try-on failed", error);
    return new Response(JSON.stringify({ error: "Could not create the preview. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
