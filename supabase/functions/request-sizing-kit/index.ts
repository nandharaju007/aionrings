import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { kitAddressSchema } from './schema.ts';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const reply = (body: object, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (req.method !== 'POST') return reply({ error: 'Method not allowed.' }, 405);
  try {
    const raw = await req.text();
    if (raw.length > 4096) return reply({ error: 'Address is too long.' }, 400);
    const parsed = kitAddressSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return reply({ error: 'Please check your delivery address.' }, 400);
    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) return reply({ error: 'Requests are temporarily unavailable.' }, 503);
    const client = createClient(url, key);
    const { data, error } = await client.from('sizing_kit_requests').insert(parsed.data).select('id').single();
    if (error) return reply({ error: 'Your request could not be saved. Please try again.' }, 500);
    return reply({ ok: true, id: data.id });
  } catch {
    return reply({ error: 'Please check your address and try again.' }, 400);
  }
});