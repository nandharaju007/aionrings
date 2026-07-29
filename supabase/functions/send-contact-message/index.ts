const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

interface Payload { name: string; email: string; subject?: string; message: string }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const b = (await req.json()) as Partial<Payload>;
    const name = (b.name ?? "").trim();
    const email = (b.email ?? "").trim().toLowerCase();
    const subject = (b.subject ?? "").trim().slice(0, 150);
    const message = (b.message ?? "").trim();

    if (
      !name || name.length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255 ||
      !message || message.length > 4000
    ) {
      return new Response(JSON.stringify({ error: "Please provide a valid name, email and message." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      console.error("RESEND_API_KEY missing");
      return new Response(JSON.stringify({ error: "Email service is not configured." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "aiOn Website <support@aionrings.com>",
        to: ["support@aionrings.com"],
        reply_to: email,
        subject: subject ? `Privacy inquiry: ${subject}` : `Privacy inquiry from ${name}`,
        html: `<div style="font-family:Inter,sans-serif;padding:20px;color:#0A1628;">
          <h2 style="font-weight:400;">New privacy inquiry</h2>
          <p><strong>Name:</strong> ${esc(name)}<br/>
             <strong>Email:</strong> ${esc(email)}<br/>
             ${subject ? `<strong>Subject:</strong> ${esc(subject)}` : ""}</p>
          <p style="white-space:pre-wrap;">${esc(message)}</p>
        </div>`,
      }),
    });

    if (!res.ok) {
      const details = await res.text();
      console.error(`Resend failed [${res.status}]: ${details}`);
      return new Response(JSON.stringify({ error: "Could not send your message.", status: res.status, details }), {
        status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-contact-message error:", e);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
