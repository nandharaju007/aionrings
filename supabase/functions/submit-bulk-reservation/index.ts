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
  if (!p.business_name?.trim() || !p.contact_person?.trim() || !p.phone?.trim()) return false;
  if (!p.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) return false;
  if (typeof p.estimated_quantity !== "number" || p.estimated_quantity < 1 || p.estimated_quantity > 100000) return false;
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

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

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
        partner_code: body.partner_code?.trim().toLowerCase() || null,
      })
      .select("reservation_number, business_name, contact_person, estimated_quantity")
      .single();

    if (error) throw error;

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      const html = `
        <div style="font-family:Inter,-apple-system,sans-serif;background:#0A1628;color:#E8F0F9;padding:40px 24px;">
          <div style="max-width:560px;margin:0 auto;background:linear-gradient(180deg,#0F1E33,#0A1628);border:1px solid rgba(79,179,255,0.15);border-radius:20px;padding:40px;">
            <h1 style="font-size:26px;font-weight:300;margin:0 0 8px;">Thank you, ${data.contact_person}.</h1>
            <p style="color:#8B9DAF;font-size:15px;margin:0 0 24px;">We've received your bulk reservation inquiry for ${data.business_name}.</p>
            <div style="background:rgba(79,179,255,0.06);border:1px solid rgba(79,179,255,0.2);border-radius:14px;padding:20px;margin-bottom:24px;">
              <div style="font-size:11px;letter-spacing:3px;color:#4FB3FF;text-transform:uppercase;margin-bottom:6px;">Inquiry</div>
              <div style="font-size:20px;font-weight:500;letter-spacing:2px;">${data.reservation_number}</div>
              <div style="margin-top:10px;font-size:13px;color:#B8C5D3;">Estimated quantity: ${data.estimated_quantity}</div>
            </div>
            <p style="color:#B8C5D3;line-height:1.7;font-size:14px;">Our partnerships team will contact you regarding pricing and delivery.</p>
            <p style="color:#5A6B7E;font-size:12px;margin-top:32px;">aiOn Health Sciences LLC · A Mazo Solutions Inc company</p>
          </div>
        </div>`;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "aiOn Rings <orders@aionrings.com>",
          to: [body.email],
          bcc: ["partners@aionrings.com"],
          subject: `Bulk reservation received ${data.reservation_number}`,
          html,
        }),
      }).catch((e) => console.error("Resend send failed:", e));
    }

    return new Response(JSON.stringify({ ok: true, reservation_number: data.reservation_number }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("submit-bulk-reservation error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});