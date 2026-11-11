import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminGate } from '@/components/bench/AdminGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Source = { id: string; name: string; link: string | null; contents: string | null; has_ring_sizes: string; licence: string; commercial_use: string; notes: string | null; reviewed_by: string | null; reviewed_on: string | null };
const COLS: [keyof Source, string][] = [['name', 'Name'], ['link', 'Link'], ['contents', 'What it contains'], ['has_ring_sizes', 'Has ring sizes'], ['licence', 'Licence'], ['commercial_use', 'Commercial use'], ['notes', 'Notes'], ['reviewed_by', 'Reviewed by'], ['reviewed_on', 'Date']];

function Sources() {
  const [rows, setRows] = useState<Source[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const load = useCallback(async () => {
    const { data } = await supabase.from('data_sources').select('*').order('created_at');
    if (data) setRows(data as Source[]);
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async (id: string, key: keyof Source, value: string) => {
    const { error } = await supabase.from('data_sources').update({ [key]: value || null } as never).eq('id', id);
    setMsg(error ? error.message : 'Saved.');
    load();
  };
  const add = async () => { await supabase.from('data_sources').insert({ name: 'New source' }); load(); };

  return (
    <div>
      <p role="note" className="rounded-md border border-border bg-card p-3 font-medium">Check each licence before using a dataset in a product. Many are research-only.</p>
      {msg && <p role="status" className="mt-3 text-ink-soft">{msg}</p>}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left">
          <thead><tr className="border-b border-border">{COLS.map(([, h]) => <th key={h} className="p-2 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border align-top">
                {COLS.map(([k, h]) => (
                  <td key={k} className="p-1">
                    {k === 'commercial_use' ? (
                      <select aria-label={`${h} for ${r.name}`} defaultValue={r.commercial_use} onChange={(e) => save(r.id, k, e.target.value)} className="h-11 w-full rounded-md border border-input bg-background px-2 text-base">
                        <option value="unchecked">unchecked</option><option value="yes">yes</option><option value="no">no</option></select>
                    ) : (
                      <Input aria-label={`${h} for ${r.name}`} type={k === 'reviewed_on' ? 'date' : 'text'} defaultValue={(r[k] as string) ?? ''} key={`${r.id}${k}${r[k]}`}
                        onBlur={(e) => e.target.value !== ((r[k] as string) ?? '') && save(r.id, k, e.target.value)} className="h-11 text-base" />
                    )}
                    {k === 'link' && r.link && <a href={r.link} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm text-primary underline">Open</a>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button onClick={add} className="mt-4 h-11">Add source</Button>
    </div>
  );
}

export default function BenchSourcesPage() {
  return <AdminGate title="Data sources"><Sources /></AdminGate>;
}
