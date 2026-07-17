import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, LogOut, Download, Plus, Trash2, QrCode, Copy, Check, Truck, Package, CheckCircle2, Save, History } from 'lucide-react';

interface Reservation {
  id: string;
  reservation_number: string;
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
  ring_color: string | null;
  quantity: number;
  referral_source: string | null;
  partner_code: string | null;
  partner_name: string | null;
  status: string;
  created_at: string;
  tracking_number?: string | null;
  carrier?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  admin_notes?: string | null;
}

interface Partner {
  id: string;
  code: string;
  name: string;
  contact_email: string | null;
  phone: string | null;
  website: string | null;
  status: string;
  created_at: string;
}

interface BulkRes {
  id: string;
  reservation_number: string;
  business_name: string;
  contact_person: string;
  email: string;
  phone: string;
  estimated_quantity: number;
  size_breakdown: Record<string, number> | null;
  notes: string | null;
  partner_code: string | null;
  status: string;
  created_at: string;
}

type Tab = 'reservations' | 'fulfillment' | 'partners' | 'bulk';

interface AuditEntry {
  id: string;
  reservation_id: string;
  changed_by_email: string | null;
  field: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

function toLocal(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-white/5 text-[#B8C5D3]',
    confirmed: 'bg-sky-500/10 text-sky-300',
    processing: 'bg-amber-500/10 text-amber-300',
    shipped: 'bg-violet-500/10 text-violet-300',
    delivered: 'bg-emerald-500/10 text-emerald-300',
    cancelled: 'bg-red-500/10 text-red-300',
  };
  return <span className={`text-[10px] uppercase tracking-[2px] px-2 py-1 rounded-full ${map[status] ?? map.pending}`}>{status}</span>;
}

export default function AdminReservationsPage() {
  const [session, setSession] = useState<{ email: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Reservation[] | null>(null);
  const [partners, setPartners] = useState<Partner[] | null>(null);
  const [bulk, setBulk] = useState<BulkRes[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>('reservations');
  const [filterPartner, setFilterPartner] = useState<string>('');
  const [qrPartner, setQrPartner] = useState<Partner | null>(null);
  const [newPartner, setNewPartner] = useState({ code: '', name: '', contact_email: '', phone: '', website: '' });
  const [copied, setCopied] = useState<string | null>(null);
  const [edit, setEdit] = useState<Record<string, Partial<Reservation>>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>('all');
  const [openTimeline, setOpenTimeline] = useState<Record<string, boolean>>({});
  const [audit, setAudit] = useState<Record<string, AuditEntry[]>>({});
  const [auditLoading, setAuditLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    document.title = 'Admin · Reservations';

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s?.user?.email ? { email: s.user.email } : null);
      if (s?.user) checkAdmin(s.user.id);
      else { setIsAdmin(null); setRows(null); }
    });

    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      if (u?.email) {
        setSession({ email: u.email });
        checkAdmin(u.id);
      } else setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkAdmin(userId: string) {
    setLoading(true);
    const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle();
    const admin = !!data;
    setIsAdmin(admin);
    if (admin) await loadAll();
    setLoading(false);
  }

  async function loadAll() {
    const [r, p, b] = await Promise.all([
      supabase.from('reservations').select('*').order('created_at', { ascending: false }),
      supabase.from('partners').select('*').order('created_at', { ascending: false }),
      supabase.from('bulk_reservations').select('*').order('created_at', { ascending: false }),
    ]);
    if (r.error) setError(r.error.message); else setRows(r.data as Reservation[]);
    if (!p.error) setPartners(p.data as unknown as Partner[]);
    if (!b.error) setBulk(b.data as BulkRes[]);
  }

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setBusy(false);
  }

  async function onLogout() {
    await supabase.auth.signOut();
  }

  const filteredRows = useMemo(() => {
    if (!rows) return null;
    if (!filterPartner) return rows;
    if (filterPartner === '__none__') return rows.filter(r => !r.partner_code);
    return rows.filter(r => r.partner_code === filterPartner);
  }, [rows, filterPartner]);

  function exportCSV() {
    const data = filteredRows;
    if (!data) return;
    const headers = ['reservation_number','created_at','first_name','last_name','email','phone','address','city','state','zip_code','country','ring_size','ring_color','quantity','referral_source','partner_code','partner_name','status'];
    const csv = [headers.join(',')].concat(
      data.map(r => headers.map(h => `"${String((r as any)[h] ?? '').replace(/"/g, '""')}"`).join(','))
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `reservations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportBulkCSV() {
    if (!bulk) return;
    const headers = ['reservation_number','created_at','business_name','contact_person','email','phone','estimated_quantity','partner_code','status','notes'];
    const csv = [headers.join(',')].concat(
      bulk.map(r => headers.map(h => `"${String((r as any)[h] ?? '').replace(/"/g, '""')}"`).join(','))
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `bulk-reservations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function createPartner(e: React.FormEvent) {
    e.preventDefault();
    const code = newPartner.code.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!code || !newPartner.name.trim()) return;
    const { error } = await supabase.from('partners').insert({
      code,
      name: newPartner.name.trim(),
      contact_email: newPartner.contact_email.trim() || null,
      phone: newPartner.phone.trim() || null,
      website: newPartner.website.trim() || null,
    });
    if (error) { alert(error.message); return; }
    setNewPartner({ code: '', name: '', contact_email: '', phone: '', website: '' });
    await loadAll();
  }

  async function togglePartnerStatus(p: Partner) {
    const next = p.status === 'active' ? 'inactive' : 'active';
    await supabase.from('partners').update({ status: next }).eq('id', p.id);
    await loadAll();
  }

  async function deletePartner(p: Partner) {
    if (!confirm(`Delete partner "${p.name}"?`)) return;
    await supabase.from('partners').delete().eq('id', p.id);
    await loadAll();
  }

  function partnerUrl(code: string) {
    return `${window.location.origin}/preorder?partner=${encodeURIComponent(code)}`;
  }

  function qrSrc(url: string) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(url)}`;
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key); setTimeout(() => setCopied(null), 1200);
  }

  function editField(id: string, field: keyof Reservation, value: any) {
    setEdit(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  async function saveFulfillment(r: Reservation) {
    const changes = edit[r.id];
    if (!changes) return;
    setSavingId(r.id);
    const patch: any = { ...changes };
    // Auto-timestamp status transitions
    if (patch.status === 'shipped' && !r.shipped_at && !patch.shipped_at) patch.shipped_at = new Date().toISOString();
    if (patch.status === 'delivered' && !r.delivered_at && !patch.delivered_at) patch.delivered_at = new Date().toISOString();
    const { error } = await supabase.from('reservations').update(patch).eq('id', r.id);
    setSavingId(null);
    if (error) { alert(error.message); return; }
    setEdit(prev => { const n = { ...prev }; delete n[r.id]; return n; });
    if (openTimeline[r.id]) await loadAudit(r.id);
    await loadAll();
  }

  async function loadAudit(reservationId: string) {
    setAuditLoading(prev => ({ ...prev, [reservationId]: true }));
    const { data, error } = await supabase
      .from('reservation_audit_log')
      .select('*')
      .eq('reservation_id', reservationId)
      .order('created_at', { ascending: false });
    setAuditLoading(prev => ({ ...prev, [reservationId]: false }));
    if (!error) setAudit(prev => ({ ...prev, [reservationId]: data as AuditEntry[] }));
  }

  async function toggleTimeline(reservationId: string) {
    const next = !openTimeline[reservationId];
    setOpenTimeline(prev => ({ ...prev, [reservationId]: next }));
    if (next && !audit[reservationId]) await loadAudit(reservationId);
  }

  const STATUSES = ['reserved', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

  const fulfillmentRows = useMemo(() => {
    if (!rows) return null;
    if (fulfillmentFilter === 'all') return rows;
    return rows.filter(r => (r.status || 'pending') === fulfillmentFilter);
  }, [rows, fulfillmentFilter]);

  const stats = useMemo(() => {
    const s: Record<string, number> = { reserved: 0, confirmed: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
    rows?.forEach(r => {
      const k = r.status || 'reserved';
      s[k] = (s[k] ?? 0) + 1;
    });
    return s;
  }, [rows]);

  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      <Header />
      <main className="pt-32 pb-24">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="text-[11px] uppercase tracking-[3px] text-[#4FB3FF] mb-1">Admin</div>
              <h1 className="text-3xl md:text-4xl font-light tracking-tight">Dashboard</h1>
            </div>
            {session && (
              <button onClick={onLogout} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[13px] hover:border-white/30">
                <LogOut className="w-3.5 h-3.5" /> {session.email}
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-[#4FB3FF]" /></div>
          ) : !session ? (
            <form onSubmit={onLogin} className="max-w-sm mx-auto space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-8">
              <h2 className="text-xl font-light mb-2">Sign in</h2>
              <input type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full h-12 rounded-xl border border-white/10 bg-white/[0.02] px-4 text-[15px] focus:border-[#4FB3FF] focus:outline-none" />
              <input type="password" required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full h-12 rounded-xl border border-white/10 bg-white/[0.02] px-4 text-[15px] focus:border-[#4FB3FF] focus:outline-none" />
              {error && <div className="text-[13px] text-red-300">{error}</div>}
              <button type="submit" disabled={busy}
                className="w-full h-12 rounded-full font-semibold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#00C6FF,#4FB3FF,#7C3AED)' }}>
                {busy ? 'Signing in…' : 'Sign in'}
              </button>
              <p className="text-[12px] text-[#5A6B7E] text-center pt-2">
                Admin access is restricted. Contact <a href="mailto:support@aionrings.com" className="underline">support@aionrings.com</a> if you need access.
              </p>
            </form>
          ) : isAdmin === false ? (
            <div className="max-w-lg mx-auto text-center rounded-2xl border border-white/10 bg-white/[0.02] p-10">
              <h2 className="text-2xl font-light mb-3">Access denied</h2>
              <p className="text-[14px] text-[#8B9DAF]">Your account doesn't have admin privileges.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-1 mb-8 rounded-full border border-white/10 bg-white/[0.02] p-1 w-fit">
                {(['reservations','fulfillment','partners','bulk'] as Tab[]).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-5 py-2 text-[13px] rounded-full transition-colors ${tab === t ? 'bg-white/10 text-white' : 'text-[#8B9DAF] hover:text-white'}`}>
                    {t === 'reservations' ? 'Reservations' : t === 'fulfillment' ? 'Orders & Delivery' : t === 'partners' ? 'Partners' : 'Bulk Inquiries'}
                  </button>
                ))}
              </div>

              {tab === 'fulfillment' && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
                    {STATUSES.map(s => (
                      <button key={s} onClick={() => setFulfillmentFilter(s)}
                        className={`rounded-2xl border p-4 text-left transition-colors ${fulfillmentFilter === s ? 'border-[#4FB3FF] bg-[#4FB3FF]/5' : 'border-white/10 bg-white/[0.02] hover:border-white/20'}`}>
                        <div className="text-[10px] uppercase tracking-[2px] text-[#8B9DAF]">{s}</div>
                        <div className="text-2xl font-light mt-1">{stats[s] ?? 0}</div>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-[13px] text-[#8B9DAF]">
                      Filter: <button onClick={() => setFulfillmentFilter('all')} className={`ml-1 underline ${fulfillmentFilter === 'all' ? 'text-white' : 'text-[#4FB3FF]'}`}>All ({rows?.length ?? 0})</button>
                    </div>
                    <div className="text-[12px] text-[#5A6B7E]">Click a status card to filter · edit rows and hit Save</div>
                  </div>

                  <div className="space-y-3">
                    {fulfillmentRows?.map(r => {
                      const e = edit[r.id] ?? {};
                      const merged = { ...r, ...e };
                      const dirty = !!edit[r.id];
                      return (
                        <div key={r.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <span className="font-mono text-[13px] text-[#4FB3FF]">{r.reservation_number}</span>
                                <StatusPill status={merged.status || 'pending'} />
                              </div>
                              <div className="text-[15px] font-medium">{r.first_name} {r.last_name} <span className="text-[#8B9DAF] font-normal">· {r.email}</span></div>
                              <div className="text-[12px] text-[#8B9DAF]">
                                {r.address}, {r.city}, {r.state} {r.zip_code}, {r.country} · {r.phone}
                              </div>
                              <div className="text-[12px] text-[#B8C5D3] mt-1">
                                Size <span className="text-white">{r.ring_size}</span> · Color <span className="text-white">{r.ring_color ?? '—'}</span> · Qty <span className="text-white">{r.quantity}</span> · {new Date(r.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <button onClick={() => saveFulfillment(r)} disabled={!dirty || savingId === r.id}
                              className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-[12px] font-medium text-white disabled:opacity-40"
                              style={{ background: dirty ? 'linear-gradient(135deg,#00C6FF,#4FB3FF,#7C3AED)' : 'rgba(255,255,255,0.06)' }}>
                              {savingId === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                              {dirty ? 'Save changes' : 'Saved'}
                            </button>
                          </div>

                          <div className="grid md:grid-cols-4 gap-3">
                            <label className="block">
                              <span className="text-[10px] uppercase tracking-[2px] text-[#8B9DAF]">Status</span>
                              <select value={merged.status || 'pending'} onChange={ev => editField(r.id, 'status', ev.target.value)}
                                className="mt-1 w-full h-10 rounded-lg border border-white/10 bg-white/[0.02] px-3 text-[13px] focus:outline-none focus:border-[#4FB3FF]">
                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </label>
                            <label className="block">
                              <span className="text-[10px] uppercase tracking-[2px] text-[#8B9DAF]">Carrier</span>
                              <input value={merged.carrier ?? ''} onChange={ev => editField(r.id, 'carrier', ev.target.value)}
                                placeholder="UPS, FedEx, USPS…"
                                className="mt-1 w-full h-10 rounded-lg border border-white/10 bg-white/[0.02] px-3 text-[13px] focus:outline-none focus:border-[#4FB3FF]" />
                            </label>
                            <label className="block md:col-span-2">
                              <span className="text-[10px] uppercase tracking-[2px] text-[#8B9DAF]">Tracking number</span>
                              <input value={merged.tracking_number ?? ''} onChange={ev => editField(r.id, 'tracking_number', ev.target.value)}
                                placeholder="1Z999AA10123456784"
                                className="mt-1 w-full h-10 rounded-lg border border-white/10 bg-white/[0.02] px-3 text-[13px] focus:outline-none focus:border-[#4FB3FF]" />
                            </label>
                            <label className="block">
                              <span className="text-[10px] uppercase tracking-[2px] text-[#8B9DAF]">Shipped at</span>
                              <input type="datetime-local" value={toLocal(merged.shipped_at)} onChange={ev => editField(r.id, 'shipped_at', ev.target.value ? new Date(ev.target.value).toISOString() : null)}
                                className="mt-1 w-full h-10 rounded-lg border border-white/10 bg-white/[0.02] px-3 text-[13px] focus:outline-none focus:border-[#4FB3FF]" />
                            </label>
                            <label className="block">
                              <span className="text-[10px] uppercase tracking-[2px] text-[#8B9DAF]">Delivered at</span>
                              <input type="datetime-local" value={toLocal(merged.delivered_at)} onChange={ev => editField(r.id, 'delivered_at', ev.target.value ? new Date(ev.target.value).toISOString() : null)}
                                className="mt-1 w-full h-10 rounded-lg border border-white/10 bg-white/[0.02] px-3 text-[13px] focus:outline-none focus:border-[#4FB3FF]" />
                            </label>
                            <label className="block md:col-span-2">
                              <span className="text-[10px] uppercase tracking-[2px] text-[#8B9DAF]">Internal notes</span>
                              <input value={merged.admin_notes ?? ''} onChange={ev => editField(r.id, 'admin_notes', ev.target.value)}
                                placeholder="Anything worth remembering…"
                                className="mt-1 w-full h-10 rounded-lg border border-white/10 bg-white/[0.02] px-3 text-[13px] focus:outline-none focus:border-[#4FB3FF]" />
                            </label>
                          </div>

                          <div className="mt-4 pt-4 border-t border-white/5">
                            <button onClick={() => toggleTimeline(r.id)}
                              className="inline-flex items-center gap-2 text-[12px] text-[#8B9DAF] hover:text-white">
                              <History className="w-3.5 h-3.5" />
                              {openTimeline[r.id] ? 'Hide' : 'Show'} audit timeline
                              {audit[r.id] && <span className="text-[#5A6B7E]">({audit[r.id].length})</span>}
                            </button>
                            {openTimeline[r.id] && (
                              <div className="mt-3 rounded-xl bg-black/20 border border-white/5 p-4">
                                {auditLoading[r.id] ? (
                                  <div className="flex items-center gap-2 text-[12px] text-[#8B9DAF]"><Loader2 className="w-3 h-3 animate-spin" /> Loading…</div>
                                ) : (audit[r.id]?.length ?? 0) === 0 ? (
                                  <div className="text-[12px] text-[#5A6B7E]">No changes recorded yet.</div>
                                ) : (
                                  <ol className="space-y-3">
                                    {audit[r.id].map(a => (
                                      <li key={a.id} className="flex gap-3 text-[12px]">
                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#4FB3FF] shrink-0" />
                                        <div className="flex-1 min-w-0">
                                          <div className="text-[#B8C5D3]">
                                            <span className="text-white font-medium">{a.changed_by_email ?? 'system'}</span>{' '}
                                            changed <span className="text-[#4FB3FF]">{a.field}</span>
                                          </div>
                                          <div className="text-[#8B9DAF] font-mono text-[11px] break-all">
                                            <span className="line-through text-[#5A6B7E]">{a.old_value ?? '∅'}</span>
                                            {' → '}
                                            <span className="text-emerald-300">{a.new_value ?? '∅'}</span>
                                          </div>
                                          <div className="text-[10px] text-[#5A6B7E] mt-0.5">{new Date(a.created_at).toLocaleString()}</div>
                                        </div>
                                      </li>
                                    ))}
                                  </ol>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {fulfillmentRows && fulfillmentRows.length === 0 && (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center text-[#5A6B7E]">No orders in this stage.</div>
                    )}
                  </div>
                </>
              )}

              {tab === 'reservations' && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <div className="text-[14px] text-[#8B9DAF]">
                      <span className="text-white font-medium">{filteredRows?.length ?? 0}</span> reservations · <span className="text-white font-medium">{filteredRows?.reduce((s, r) => s + r.quantity, 0) ?? 0}</span> rings
                    </div>
                    <div className="flex items-center gap-3">
                      <select value={filterPartner} onChange={e => setFilterPartner(e.target.value)}
                        className="h-10 rounded-full border border-white/15 bg-white/[0.02] px-4 text-[13px] focus:outline-none focus:border-[#4FB3FF]">
                        <option value="">All partners</option>
                        <option value="__none__">Direct (no partner)</option>
                        {partners?.map(p => <option key={p.id} value={p.code}>{p.name} ({p.code})</option>)}
                      </select>
                      <button onClick={exportCSV} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[13px] hover:border-white/30">
                        <Download className="w-3.5 h-3.5" /> Export CSV
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-white/10">
                    <table className="w-full text-[13px]">
                      <thead className="bg-white/[0.03] text-[11px] uppercase tracking-[2px] text-[#8B9DAF]">
                        <tr>
                          {['#','Date','Name','Email','Phone','Size','Color','Qty','Location','Partner'].map(h =>
                            <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRows?.map(r => (
                          <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                            <td className="px-4 py-3 font-mono text-[12px] text-[#4FB3FF]">{r.reservation_number}</td>
                            <td className="px-4 py-3 text-[#B8C5D3]">{new Date(r.created_at).toLocaleDateString()}</td>
                            <td className="px-4 py-3">{r.first_name} {r.last_name}</td>
                            <td className="px-4 py-3 text-[#B8C5D3]">{r.email}</td>
                            <td className="px-4 py-3 text-[#B8C5D3]">{r.phone}</td>
                            <td className="px-4 py-3">{r.ring_size}</td>
                            <td className="px-4 py-3 text-[#B8C5D3]">{r.ring_color ?? '—'}</td>
                            <td className="px-4 py-3">{r.quantity}</td>
                            <td className="px-4 py-3 text-[#B8C5D3]">{r.city}, {r.state}</td>
                            <td className="px-4 py-3 text-[#4FB3FF]">{r.partner_name ?? (r.referral_source ?? '—')}</td>
                          </tr>
                        ))}
                        {filteredRows && filteredRows.length === 0 && (
                          <tr><td colSpan={10} className="px-4 py-16 text-center text-[#5A6B7E]">No reservations.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {tab === 'partners' && (
                <>
                  <form onSubmit={createPartner} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 mb-6 grid md:grid-cols-6 gap-2">
                    <input required placeholder="code (e.g. abcclinic)" value={newPartner.code} onChange={e => setNewPartner({ ...newPartner, code: e.target.value })}
                      className="h-10 rounded-lg border border-white/10 bg-white/[0.02] px-3 text-[13px] focus:outline-none focus:border-[#4FB3FF]" />
                    <input required placeholder="Business name" value={newPartner.name} onChange={e => setNewPartner({ ...newPartner, name: e.target.value })}
                      className="h-10 rounded-lg border border-white/10 bg-white/[0.02] px-3 text-[13px] md:col-span-2 focus:outline-none focus:border-[#4FB3FF]" />
                    <input placeholder="Website" value={newPartner.website} onChange={e => setNewPartner({ ...newPartner, website: e.target.value })}
                      className="h-10 rounded-lg border border-white/10 bg-white/[0.02] px-3 text-[13px] focus:outline-none focus:border-[#4FB3FF]" />
                    <input placeholder="Email" value={newPartner.contact_email} onChange={e => setNewPartner({ ...newPartner, contact_email: e.target.value })}
                      className="h-10 rounded-lg border border-white/10 bg-white/[0.02] px-3 text-[13px] focus:outline-none focus:border-[#4FB3FF]" />
                    <button type="submit" className="h-10 rounded-lg font-semibold text-white text-[13px] inline-flex items-center justify-center gap-1"
                      style={{ background: 'linear-gradient(135deg,#00C6FF,#4FB3FF,#7C3AED)' }}>
                      <Plus className="w-3.5 h-3.5" /> Add partner
                    </button>
                  </form>

                  <div className="grid md:grid-cols-2 gap-4">
                    {partners?.map(p => {
                      const url = partnerUrl(p.code);
                      return (
                        <div key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="text-[15px] font-medium">{p.name}</div>
                              <div className="text-[12px] text-[#8B9DAF] font-mono">{p.code}</div>
                            </div>
                            <span className={`text-[10px] uppercase tracking-[2px] px-2 py-1 rounded-full ${p.status === 'active' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-white/5 text-[#8B9DAF]'}`}>
                              {p.status}
                            </span>
                          </div>
                          {(p.website || p.contact_email || p.phone) && (
                            <div className="text-[12px] text-[#8B9DAF] mb-3">
                              {p.contact_email ?? ''}{p.phone ? ` · ${p.phone}` : ''}{p.website ? ` · ${p.website}` : ''}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-[12px] text-[#4FB3FF] font-mono break-all mb-3 rounded-lg bg-white/[0.02] px-3 py-2 border border-white/5">
                            {url}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => copyText(url, `link-${p.id}`)} className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-[12px] hover:border-white/30">
                              {copied === `link-${p.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy link
                            </button>
                            <button onClick={() => setQrPartner(p)} className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-[12px] hover:border-white/30">
                              <QrCode className="w-3 h-3" /> QR
                            </button>
                            <button onClick={() => togglePartnerStatus(p)} className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-[12px] hover:border-white/30">
                              {p.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button onClick={() => deletePartner(p)} className="inline-flex items-center gap-1 rounded-full border border-red-400/25 text-red-300 px-3 py-1.5 text-[12px] hover:border-red-400/60">
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {partners && partners.length === 0 && (
                      <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center text-[#8B9DAF]">No partners yet. Add one above.</div>
                    )}
                  </div>

                  {qrPartner && (
                    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6" onClick={() => setQrPartner(null)}>
                      <div className="bg-[#0A1628] border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
                        <div className="text-[12px] uppercase tracking-[3px] text-[#4FB3FF] mb-2">Partner QR</div>
                        <div className="text-[18px] font-medium mb-1">{qrPartner.name}</div>
                        <div className="text-[12px] font-mono text-[#8B9DAF] mb-4">{qrPartner.code}</div>
                        <div className="bg-white p-3 rounded-xl inline-block mb-4">
                          <img src={qrSrc(partnerUrl(qrPartner.code))} alt="Partner QR code" className="w-64 h-64" />
                        </div>
                        <div className="flex gap-2 justify-center">
                          <a href={qrSrc(partnerUrl(qrPartner.code))} download={`aion-${qrPartner.code}-qr.png`} className="rounded-full border border-white/15 px-4 py-2 text-[13px] hover:border-white/30">
                            Download PNG
                          </a>
                          <button onClick={() => setQrPartner(null)} className="rounded-full border border-white/15 px-4 py-2 text-[13px] hover:border-white/30">Close</button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {tab === 'bulk' && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-[14px] text-[#8B9DAF]">
                      <span className="text-white font-medium">{bulk?.length ?? 0}</span> inquiries · <span className="text-white font-medium">{bulk?.reduce((s, r) => s + r.estimated_quantity, 0) ?? 0}</span> estimated rings
                    </div>
                    <button onClick={exportBulkCSV} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[13px] hover:border-white/30">
                      <Download className="w-3.5 h-3.5" /> Export CSV
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-white/10">
                    <table className="w-full text-[13px]">
                      <thead className="bg-white/[0.03] text-[11px] uppercase tracking-[2px] text-[#8B9DAF]">
                        <tr>
                          {['#','Date','Business','Contact','Email','Phone','Est Qty','Partner','Status'].map(h =>
                            <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {bulk?.map(r => (
                          <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                            <td className="px-4 py-3 font-mono text-[12px] text-[#4FB3FF]">{r.reservation_number}</td>
                            <td className="px-4 py-3 text-[#B8C5D3]">{new Date(r.created_at).toLocaleDateString()}</td>
                            <td className="px-4 py-3">{r.business_name}</td>
                            <td className="px-4 py-3 text-[#B8C5D3]">{r.contact_person}</td>
                            <td className="px-4 py-3 text-[#B8C5D3]">{r.email}</td>
                            <td className="px-4 py-3 text-[#B8C5D3]">{r.phone}</td>
                            <td className="px-4 py-3">{r.estimated_quantity}</td>
                            <td className="px-4 py-3 text-[#B8C5D3]">{r.partner_code ?? '—'}</td>
                            <td className="px-4 py-3 text-[#B8C5D3]">{r.status}</td>
                          </tr>
                        ))}
                        {bulk && bulk.length === 0 && (
                          <tr><td colSpan={9} className="px-4 py-16 text-center text-[#5A6B7E]">No bulk inquiries yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}

          <div className="text-center mt-10">
            <Link to="/" className="text-[13px] text-[#5A6B7E] hover:text-white">← Back to site</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}