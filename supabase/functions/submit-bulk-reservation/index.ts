import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Payload {
  business_name: string;
  contact_person: string;
  email: string;
  phone: string;
  estimated_quantity: number;
  size_breakdown?: Record<string, number>;
  notes?: string;
  partner_code?: string;
}

function isValid(p: Partial<Payload>): p is Payload {
  const req: (keyof Payload)[] = ["business_name", "contact_person", "email", "phone", "estimated_quantity"];
  for (const k of req) {
    const v = p[k];
    if (v === undefined || v === null || (typeof v === "string" && !v.trim())) return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email!)) return false;
  if (typeof p.estimated_quantity !== "number" || p.estimated_quantity < 1 || p.estimated_quantity > 100000) return false;
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = (await req.json()) as Partial<Payload>;
    if (!isValid(body)) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    let partner_code: string | null = null;
    let partner_name: string | null = null;
    if (body.partner_code?.trim()) {
      const code = body.partner_code.trim().toLowerCase();
      const { data: p } = await supabase.from("partners").select("code, name, status").eq("code", code).maybeSingle();
      if (p && p.status === "active") { partner_code = p.code; partner_name = p.name; }
    }

    const { data, error } = await supabase
      .from("bulk_reservations")
      .insert({
        business_name: body.business_name.trim(),
        contact_person: body.contact_person.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone.trim(),
        estimated_quantity: body.estimated_quantity,
        size_breakdown: body.size_breakdown ?? null,
        notes: body.notes?.trim() || null,
        partner_code,
        partner_name,
      })
      .select("reservation_number")
      .single();

    if (error) throw error;

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "aiOn Rings <orders@aionrings.com>",
          to: [body.email],
          subject: `We received your aiOn bulk inquiry ${data.reservation_number}`,
          html: `<div style="font-family:Inter,sans-serif;background:#0A1628;color:#E8F0F9;padding:40px 24px;">
            <div style="max-width:560px;margin:0 auto;background:linear-gradient(180deg,#0F1E33,#0A1628);border:1px solid rgba(79,179,255,0.15);border-radius:20px;padding:40px;">
              <h1 style="font-size:26px;font-weight:300;">Thanks, ${body.contact_person}.</h1>
              <p style="color:#B8C5D3;line-height:1.7;">We received your bulk inquiry for <strong style="color:#fff;">${body.estimated_quantity} aiOn Rings</strong> on behalf of ${body.business_name}. Our partnerships team will contact you regarding pricing and delivery.</p>
              <div style="background:rgba(79,179,255,0.06);border:1px solid rgba(79,179,255,0.2);border-radius:14px;padding:20px;margin-top:20px;">
                <div style="font-size:11px;letter-spacing:3px;color:#4FB3FF;text-transform:uppercase;">Inquiry</div>
                <div style="font-size:20px;letter-spacing:2px;margin-top:4px;">${data.reservation_number}</div>
              </div>
              <p style="color:#5A6B7E;font-size:12px;margin-top:24px;">aiOn Health Sciences LLC · A Mazo Solutions Inc company</p>
            </div>
          </div>`,
        }),
      }).catch((e) => console.error("Resend send failed:", e));

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "aiOn Rings <orders@aionrings.com>",
          to: ["orders@aionrings.com"],
          subject: `New bulk inquiry ${data.reservation_number}${partner_name ? ` · ${partner_name}` : ""}`,
          html: `<div style="font-family:Inter,sans-serif;padding:20px;">
            <h2>New bulk inquiry</h2>
            <p><strong>${data.reservation_number}</strong></p>
            <p><strong>${body.business_name}</strong> · ${body.contact_person}</p>
            <p>${body.email} · ${body.phone}</p>
            <p>Estimated: ${body.estimated_quantity} rings</p>
            ${body.size_breakdown ? `<p>Sizes: ${JSON.stringify(body.size_breakdown)}</p>` : ""}
            ${body.notes ? `<p>Notes: ${body.notes}</p>` : ""}
            ${partner_name ? `<p><strong>Partner:</strong> ${partner_name} (${partner_code})</p>` : ""}
          </div>`,
        }),
      }).catch((e) => console.error("Resend internal send failed:", e));
    }

    return new Response(JSON.stringify({ ok: true, reservation_number: data.reservation_number }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("submit-bulk-reservation error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});