import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, LogOut, Download, Plus, Trash2, QrCode, Copy, Check } from 'lucide-react';

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

type Tab = 'reservations' | 'partners' | 'bulk';

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
              <div className="flex gap-1 mb-8 rounded-full border border-white/10 bg-white/[0.02] p-1 w-fit">
                {(['reservations','partners','bulk'] as Tab[]).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-5 py-2 text-[13px] rounded-full transition-colors ${tab === t ? 'bg-white/10 text-white' : 'text-[#8B9DAF] hover:text-white'}`}>
                    {t === 'reservations' ? 'Reservations' : t === 'partners' ? 'Partners' : 'Bulk Inquiries'}
                  </button>
                ))}
              </div>

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