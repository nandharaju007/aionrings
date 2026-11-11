import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Loader2, Play, Trash2, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AdminGate } from '@/components/bench/AdminGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { benchSummary, halfSizeError, type ChartRow } from '../../supabase/functions/ring-sizer/measurement';
import { FLAG_HELP } from '@/lib/sizing-flags';

type Photo = {
  id: string; storage_path: string; confirmed_size: number; finger: string; hand: string; confirmation_method: string;
  est_size: number | null; est_low: number | null; est_high: number | null; error_half_sizes: number | null;
  projected_width_mm: number | null; quality_flags: string[]; chart_version: number | null; ran_at: string | null;
};
type Settings = { show_sizes: boolean; size_chart: ChartRow[]; chart_version: number; pass_min_share: number; pass_min_photos: number };

const SIZES = Array.from({ length: 23 }, (_, i) => 4 + i * 0.5);
const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ring-sizer`;
const pct = (n: number) => `${Math.round(n * 100)}%`;
const selectCls = 'mt-1 h-11 w-full rounded-md border border-input bg-background px-3 text-base';

/** Re-encode through a canvas: drops EXIF (incl. GPS location) and other metadata. */
async function stripMetadata(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const c = document.createElement('canvas');
  c.width = bmp.width; c.height = bmp.height;
  c.getContext('2d')!.drawImage(bmp, 0, 0);
  bmp.close();
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('Could not process photo'))), 'image/jpeg', 0.92));
}

function Bench() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [chartText, setChartText] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [form, setForm] = useState({ size: '9', finger: 'ring', hand: 'left', method: 'sizing_kit' });
  const [files, setFiles] = useState<FileList | null>(null);

  const load = useCallback(async () => {
    const [p, s] = await Promise.all([
      supabase.from('bench_photos').select('*').order('created_at', { ascending: true }),
      supabase.from('sizing_settings').select('*').eq('id', true).single(),
    ]);
    if (p.data) setPhotos(p.data as unknown as Photo[]);
    if (s.data) { setSettings(s.data as unknown as Settings); setChartText(JSON.stringify(s.data.size_chart, null, 1)); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const rule = { minShare: Number(settings?.pass_min_share ?? 0.8), minPhotos: settings?.pass_min_photos ?? 15 };
  const summary = useMemo(() => benchSummary(photos.map((p) => ({ confirmed_size: Number(p.confirmed_size), est_size: p.est_size === null ? null : Number(p.est_size), finger: p.finger })), rule), [photos, rule.minShare, rule.minPhotos]);
  const stale = photos.some((p) => !p.ran_at || p.chart_version !== settings?.chart_version);
  const canEnable = summary.passed && !stale;

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files?.length) return;
    setBusy('upload'); setMsg(null);
    try {
      for (const f of Array.from(files)) {
        const blob = await stripMetadata(f);
        const path = `${crypto.randomUUID()}.jpg`;
        const up = await supabase.storage.from('bench-photos').upload(path, blob, { contentType: 'image/jpeg' });
        if (up.error) throw up.error;
        const ins = await supabase.from('bench_photos').insert({ storage_path: path, confirmed_size: Number(form.size), finger: form.finger, hand: form.hand, confirmation_method: form.method });
        if (ins.error) throw ins.error;
      }
      setFiles(null); (document.getElementById('bench-files') as HTMLInputElement).value = '';
      setMsg(`Added ${files.length} photo(s).`);
      await load();
    } catch (err) { setMsg(err instanceof Error ? err.message : 'Upload failed'); }
    setBusy(null);
  };

  const runOne = async (p: Photo, token: string) => {
    const dl = await supabase.storage.from('bench-photos').download(p.storage_path);
    if (dl.error || !dl.data) throw dl.error ?? new Error('Download failed');
    const bmp = await createImageBitmap(dl.data);
    const fd = new FormData();
    fd.append('image', new File([dl.data], 'bench.jpg', { type: 'image/jpeg' }));
    fd.append('finger', p.finger); fd.append('bench', '1');
    fd.append('img_width', String(bmp.width)); fd.append('img_height', String(bmp.height));
    bmp.close();
    const res = await fetch(FN_URL, { method: 'POST', headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token}` }, body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Estimator failed (${res.status})`);
    const est = data.estimate as { us: number; low: number; high: number } | null;
    await supabase.from('bench_photos').update({
      est_size: est?.us ?? null, est_low: est?.low ?? null, est_high: est?.high ?? null,
      error_half_sizes: halfSizeError(Number(p.confirmed_size), est?.us ?? null),
      projected_width_mm: data.projected_width_mm ?? null, quality_flags: data.quality_flags ?? [],
      chart_version: data.chart_version, ran_at: new Date().toISOString(),
    }).eq('id', p.id);
  };

  const runAll = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;
    setMsg(null);
    let failed = 0;
    for (let i = 0; i < photos.length; i++) {
      setBusy(`Running ${i + 1} of ${photos.length}…`);
      try { await runOne(photos[i], data.session.access_token); } catch { failed++; }
    }
    setBusy(null);
    setMsg(failed ? `${failed} photo(s) could not be run. Try again.` : 'Run complete.');
    await load();
  };

  const remove = async (p: Photo) => {
    if (!confirm('Delete this photo?')) return;
    await supabase.storage.from('bench-photos').remove([p.storage_path]);
    await supabase.from('bench_photos').delete().eq('id', p.id);
    await load();
  };

  const saveSettings = async (patch: Partial<Settings>) => {
    setMsg(null);
    const { error } = await supabase.from('sizing_settings').update(patch as never).eq('id', true);
    if (error) setMsg(error.message);
    await load();
  };

  const saveChart = () => {
    try {
      const rows = JSON.parse(chartText) as ChartRow[];
      if (!Array.isArray(rows) || rows.some((r) => ![r.us, r.diameter_mm, r.circumference_mm].every(Number.isFinite))) throw new Error();
      saveSettings({ size_chart: rows });
    } catch { setMsg('Chart must be a list of { us, diameter_mm, circumference_mm } numbers.'); }
  };

  const exportCsv = () => {
    const head = ['id', 'confirmed_size', 'estimated_size', 'est_low', 'est_high', 'error_half_sizes', 'finger', 'hand', 'confirmation_method', 'projected_width_mm', 'quality_flags', 'ran_at'];
    const lines = photos.map((p) => [p.id, p.confirmed_size, p.est_size, p.est_low, p.est_high, p.error_half_sizes, p.finger, p.hand, p.confirmation_method, p.projected_width_mm, p.quality_flags.join('|'), p.ran_at].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','));
    const url = URL.createObjectURL(new Blob([[head.join(','), ...lines].join('\n')], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = `aion-sizing-bench-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10">
      {msg && <p role="status" className="rounded-md border border-border bg-card p-3">{msg}</p>}

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-xl font-medium">Show sizes to users</h2>
        <div className="mt-3 flex items-center gap-3">
          <Switch id="show-sizes" checked={!!settings?.show_sizes} disabled={!settings?.show_sizes && !canEnable}
            onCheckedChange={(v) => saveSettings({ show_sizes: v })} aria-describedby="show-sizes-help" />
          <Label htmlFor="show-sizes">{settings?.show_sizes ? 'On — shoppers see a size range' : 'Off — shoppers see “Sizing coming soon”'}</Label>
        </div>
        <p id="show-sizes-help" className="mt-2 text-ink-soft">
          {canEnable ? 'Accuracy check passed. You can switch this on.' : `Locked until at least ${rule.minPhotos} photos are run on the current chart and ${pct(rule.minShare)} are within ±0.5 size.${stale ? ' Some photos need a fresh run.' : ''}`}
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="min-share">Pass: share within ±0.5 size (0–1)</Label>
            <Input id="min-share" type="number" step="0.05" min="0" max="1" defaultValue={settings?.pass_min_share} key={`s${settings?.pass_min_share}`} className="mt-1 h-11 text-base"
              onBlur={(e) => Number(e.target.value) !== Number(settings?.pass_min_share) && saveSettings({ pass_min_share: Number(e.target.value) })} /></div>
          <div><Label htmlFor="min-photos">Pass: minimum photos</Label>
            <Input id="min-photos" type="number" min="1" defaultValue={settings?.pass_min_photos} key={`p${settings?.pass_min_photos}`} className="mt-1 h-11 text-base"
              onBlur={(e) => Number(e.target.value) !== settings?.pass_min_photos && saveSettings({ pass_min_photos: Number(e.target.value) })} /></div>
        </div>
        <p className="mt-2 text-sm text-ink-soft">Changing the rules or the chart switches sizes off again.</p>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-xl font-medium">Add test photos</h2>
        <p className="mt-1 text-ink-soft">Hand only — crop out faces. Don’t include names or emails. Location data is removed before upload.</p>
        <form onSubmit={upload} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-5"><Label htmlFor="bench-files">Photos</Label>
            <Input id="bench-files" type="file" accept="image/*" multiple required onChange={(e) => setFiles(e.target.files)} className="mt-1 h-11 text-base" /></div>
          <div><Label htmlFor="b-size">Confirmed US size</Label>
            <select id="b-size" className={selectCls} value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}>{SIZES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
          <div><Label htmlFor="b-finger">Finger</Label>
            <select id="b-finger" className={selectCls} value={form.finger} onChange={(e) => setForm({ ...form, finger: e.target.value })}>{['index', 'middle', 'ring'].map((s) => <option key={s}>{s}</option>)}</select></div>
          <div><Label htmlFor="b-hand">Hand</Label>
            <select id="b-hand" className={selectCls} value={form.hand} onChange={(e) => setForm({ ...form, hand: e.target.value })}>{['left', 'right'].map((s) => <option key={s}>{s}</option>)}</select></div>
          <div><Label htmlFor="b-method">How confirmed</Label>
            <select id="b-method" className={selectCls} value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
              <option value="sizing_kit">Sizing kit</option><option value="jeweller">Jeweller</option><option value="fitting_ring">Fitting ring</option></select></div>
          <div className="flex items-end"><Button type="submit" disabled={!!busy} className="h-11 w-full"><Upload />Add</Button></div>
        </form>
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-medium">Results ({photos.length})</h2>
          <div className="flex gap-2">
            <Button onClick={runAll} disabled={!!busy || !photos.length} className="h-11">{busy?.startsWith('Running') ? <Loader2 className="animate-spin" /> : <Play />}{busy?.startsWith('Running') ? busy : 'Run estimator on all'}</Button>
            <Button variant="outline" onClick={exportCsv} disabled={!photos.length} className="h-11"><Download />Export CSV</Button>
          </div>
        </div>

        <dl className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[['Within ±0.5', pct(summary.within_half)], ['Within ±1', pct(summary.within_one)], ['Average error', summary.mean_error_sizes === null ? '—' : `${summary.mean_error_sizes.toFixed(2)} size`],
            ['Worst error', summary.worst_error_sizes === null ? '—' : `${summary.worst_error_sizes} size`], ['No estimate', String(summary.no_estimate)], ['Result', summary.passed && !stale ? 'PASS' : 'Not passed']].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-border bg-card p-3"><dt className="text-sm text-ink-soft">{k}</dt><dd className="text-xl font-medium">{v}</dd></div>
          ))}
        </dl>
        <p className="mt-2 text-sm text-ink-soft">Photos without an estimate count as misses.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {([['By size range', summary.by_range], ['By finger', summary.by_finger]] as const).map(([t, g]) => (
            <div key={t} className="rounded-lg border border-border bg-card p-3"><h3 className="font-medium">{t}</h3>
              <ul className="mt-1">{Object.entries(g).map(([k, v]) => <li key={k}>{k}: {v.within_half}/{v.n} within ±0.5 ({pct(v.within_half / v.n)})</li>)}</ul></div>
          ))}
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead><tr className="border-b border-border">{['Confirmed', 'Estimated', 'Error (half sizes)', 'Finger / hand', 'Confirmed by', 'Quality flags', ''].map((h) => <th key={h} className="p-2 font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {photos.map((p) => (
                <tr key={p.id} className="border-b border-border">
                  <td className="p-2">US {p.confirmed_size}</td>
                  <td className="p-2">{p.ran_at ? (p.est_size === null ? 'None' : `US ${p.est_size} (${p.est_low}–${p.est_high})`) : 'Not run'}</td>
                  <td className="p-2">{p.error_half_sizes ?? '—'}</td>
                  <td className="p-2 capitalize">{p.finger} / {p.hand}</td>
                  <td className="p-2">{p.confirmation_method.replace('_', ' ')}</td>
                  <td className="p-2">{p.quality_flags.map((f) => FLAG_HELP[f]?.title ?? f).join(', ') || '—'}</td>
                  <td className="p-2"><Button variant="ghost" size="icon" className="h-11 w-11" aria-label="Delete photo" onClick={() => remove(p)}><Trash2 /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-xl font-medium">Size chart (chart version {settings?.chart_version})</h2>
        <p className="mt-1 text-ink-soft">US size, inner diameter mm and inner circumference mm. Saving a change requires a fresh run.</p>
        <Label htmlFor="chart" className="sr-only">Size chart</Label>
        <textarea id="chart" value={chartText} onChange={(e) => setChartText(e.target.value)} rows={10} className="mt-3 w-full rounded-md border border-input bg-background p-3 font-mono text-sm" />
        <Button onClick={saveChart} className="mt-3 h-11">Save chart</Button>
      </section>
    </div>
  );
}

export default function BenchPage() {
  return <AdminGate title="Sizing accuracy bench"><Bench /></AdminGate>;
}
