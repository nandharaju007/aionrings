import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div className="text-[14px] text-ink-muted">
        <span className="text-ink font-medium">{rows.length}</span> sizing kit requests total
      </div>
      <button
        onClick={() => void load()}
        disabled={busy}
        aria-label="Refresh sizing kit requests"
        className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[13px] text-ink-soft hover:bg-canvas transition-colors disabled:opacity-50"
      >
        <RotateCcw className="w-3.5 h-3.5" /> Refresh
      </button>
    </div>
    {error ? <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-[13px] text-red-600">{error}</div> : busy ? <p className="text-[13px] text-ink-muted">Loading…</p> : !rows.length ? <p className="text-[13px] text-ink-muted">No sizing kit requests yet.</p> : <div className="overflow-x-auto rounded-2xl border border-border"><table className="w-full text-[13px]"><thead className="bg-canvas text-[11px] uppercase tracking-[2px] text-ink-muted border-b border-border"><tr><th className="px-4 py-3 text-center font-medium">Received</th><th className="px-4 py-3 text-center font-medium">Recipient</th><th className="px-4 py-3 text-center font-medium">Contact</th><th className="px-4 py-3 text-center font-medium">Delivery address</th></tr></thead><tbody>{rows.map(row => <tr key={row.id} className="h-14 border-t border-border hover:bg-white"><td className="px-4 py-3 text-ink-soft text-center whitespace-nowrap">{new Date(row.created_at).toLocaleString()}</td><td className="px-4 py-3 text-center whitespace-nowrap">{row.name}</td><td className="px-4 py-3 text-ink-soft text-center whitespace-nowrap"><p>{row.email}</p><p>{row.phone}</p></td><td className="px-4 py-3 text-ink-soft text-center"><p>{row.address}</p><p>{[row.city, row.region, row.postcode].filter(Boolean).join(', ')}</p><p>{row.country}</p></td></tr>)}</tbody></table></div>}
  </section>;
}
