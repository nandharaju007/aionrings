import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import type { Tables } from '@/integrations/supabase/types';

export function AdminSizingKitRequests() {
  const [rows, setRows] = useState<Tables<'sizing_kit_requests'>[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const load = async () => {
    setBusy(true); setError('');
    const { data, error: failure } = await supabase.from('sizing_kit_requests').select('*').order('created_at', { ascending: false });
    if (failure) setError('Could not load sizing kit requests.');
    else setRows(data ?? []);
    setBusy(false);
  };
  useEffect(() => { void load(); }, []);
  return <section>
    <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-medium">Sizing kit requests</h2><Button variant="outline" size="icon" aria-label="Refresh sizing kit requests" disabled={busy} onClick={() => void load()}><RotateCcw className="h-4 w-4" /></Button></div>
    {error ? <p role="alert" className="mt-4 text-destructive">{error}</p> : busy ? <p className="mt-4 text-muted-foreground">Loading…</p> : !rows.length ? <p className="mt-4 text-muted-foreground">No sizing kit requests yet.</p> : <div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-border"><th className="p-3">Received</th><th className="p-3">Recipient</th><th className="p-3">Contact</th><th className="p-3">Delivery address</th></tr></thead><tbody>{rows.map(row => <tr key={row.id} className="border-b border-border"><td className="p-3 align-top">{new Date(row.created_at).toLocaleString()}</td><td className="p-3 align-top">{row.name}</td><td className="p-3 align-top"><p>{row.email}</p><p>{row.phone}</p></td><td className="p-3"><p>{row.address}</p><p>{[row.city, row.region, row.postcode].filter(Boolean).join(', ')}</p><p>{row.country}</p></td></tr>)}</tbody></table></div>}
  </section>;
}