import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Payload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  ring_size: string;
  ring_color?: string;
  quantity: number;
  referral_source?: string;
  partner_code?: string;
}

function isValid(p: Partial<Payload>): p is Payload {
  const required: (keyof Payload)[] = [
    "first_name","last_name","email","phone","address","city","state","zip_code","country","ring_size","quantity"
  ];
  for (const k of required) {
    const v = p[k];
    if (v === undefined || v === null || (typeof v === "string" && !v.trim())) return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email!)) return false;
  if (typeof p.quantity !== "number" || p.quantity < 1 || p.quantity > 10) return false;
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as Partial<Payload>;
    if (!isValid(body)) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Look up partner if provided
    let partner_code: string | null = null;
    let partner_name: string | null = null;
    if (body.partner_code?.trim()) {
      const code = body.partner_code.trim().toLowerCase();
      const { data: partner } = await supabase
        .from("partners")
        .select("code, name, status")
        .eq("code", code)
        .maybeSingle();
      if (partner && partner.status === "active") {
        partner_code = partner.code;
        partner_name = partner.name;
      }
    }

    const { data, error } = await supabase
      .from("reservations")
      .insert({
        first_name: body.first_name.trim(),
        last_name: body.last_name.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone.trim(),
        address: body.address.trim(),
        city: body.city.trim(),
        state: body.state.trim(),
        zip_code: body.zip_code.trim(),
        country: body.country.trim(),
        ring_size: body.ring_size.trim(),
        ring_color: body.ring_color?.trim() || null,
        quantity: body.quantity,
        referral_source: body.referral_source?.trim() || null,
        partner_code,
        partner_name,
      })
      .select("reservation_number, first_name, quantity, ring_size, ring_color")
      .single();

    if (error) throw error;

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      const html = `
        <div style="font-family:Inter,-apple-system,sans-serif;background:#0A1628;color:#E8F0F9;padding:40px 24px;">
          <div style="max-width:560px;margin:0 auto;background:linear-gradient(180deg,#0F1E33,#0A1628);border:1px solid rgba(79,179,255,0.15);border-radius:20px;padding:40px;">
            <h1 style="font-size:28px;font-weight:300;letter-spacing:-0.5px;margin:0 0 8px;">Your aiOn Ring is reserved.</h1>
            <p style="color:#8B9DAF;font-size:15px;margin:0 0 32px;">The Full Circle of Health — reserved in your name.</p>
            <div style="background:rgba(79,179,255,0.06);border:1px solid rgba(79,179,255,0.2);border-radius:14px;padding:24px;margin-bottom:24px;">
              <div style="font-size:11px;letter-spacing:3px;color:#4FB3FF;text-transform:uppercase;margin-bottom:8px;">Reservation</div>
              <div style="font-size:22px;font-weight:500;letter-spacing:2px;">${data.reservation_number}</div>
            </div>
            <p style="color:#B8C5D3;line-height:1.7;font-size:14px;">Hi ${data.first_name}, we've secured <strong style="color:#fff;">${data.quantity} × aiOn Ring${data.quantity>1?"s":""}</strong> in size ${data.ring_size}${data.ring_color?` (${data.ring_color})`:""}. You'll be among the first to receive shipping details as we approach launch.</p>
            ${partner_name ? `<p style="color:#B8C5D3;line-height:1.7;font-size:14px;margin-top:16px;">Referred by <strong style="color:#fff;">${partner_name}</strong> — an official aiOn Partner.</p>` : ""}
            <p style="color:#5A6B7E;font-size:12px;margin-top:32px;">aiOn Health Sciences LLC · A Mazo Solutions Inc company</p>
          </div>
        </div>`;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "aiOn Rings <orders@aionrings.com>",
          to: [body.email],
          subject: `Your aiOn Ring reservation ${data.reservation_number}`,
          html,
        }),
      }).catch((e) => console.error("Resend send failed:", e));

      // Internal notification
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "aiOn Rings <orders@aionrings.com>",
          to: ["orders@aionrings.com"],
          subject: `New reservation ${data.reservation_number}${partner_name ? ` · ${partner_name}` : ""}`,
          html: `<div style="font-family:Inter,sans-serif;padding:20px;">
            <h2>New aiOn reservation</h2>
            <p><strong>${data.reservation_number}</strong></p>
            <p>${body.first_name} ${body.last_name} · ${body.email} · ${body.phone}</p>
            <p>${body.quantity} × Size ${body.ring_size} ${body.ring_color ? `(${body.ring_color})` : ""}</p>
            <p>${body.address}, ${body.city}, ${body.state} ${body.zip_code}, ${body.country}</p>
            ${partner_name ? `<p><strong>Partner:</strong> ${partner_name} (${partner_code})</p>` : ""}
          </div>`,
        }),
      }).catch((e) => console.error("Resend internal send failed:", e));
    }

    return new Response(JSON.stringify({ ok: true, reservation_number: data.reservation_number, partner_name }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("submit-reservation error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});