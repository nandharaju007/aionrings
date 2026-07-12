import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, LogOut, Download } from 'lucide-react';

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
  status: string;
  created_at: string;
}

export default function AdminReservationsPage() {
  const [session, setSession] = useState<{ email: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Reservation[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

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
    if (admin) await loadRows();
    setLoading(false);
  }

  async function loadRows() {
    const { data, error } = await supabase.from('reservations').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setRows(data as Reservation[]);
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

  function exportCSV() {
    if (!rows) return;
    const headers = ['reservation_number','created_at','first_name','last_name','email','phone','address','city','state','zip_code','country','ring_size','ring_color','quantity','referral_source','status'];
    const csv = [headers.join(',')].concat(
      rows.map(r => headers.map(h => `"${String((r as any)[h] ?? '').replace(/"/g, '""')}"`).join(','))
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `reservations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      <Header />
      <main className="pt-32 pb-24">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="text-[11px] uppercase tracking-[3px] text-[#4FB3FF] mb-1">Admin</div>
              <h1 className="text-3xl md:text-4xl font-light tracking-tight">Reservations</h1>
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
                Admin access is restricted. Contact <a href="mailto:healthcare@mazosolutions.com" className="underline">healthcare@mazosolutions.com</a> if you need access.
              </p>
            </form>
          ) : isAdmin === false ? (
            <div className="max-w-lg mx-auto text-center rounded-2xl border border-white/10 bg-white/[0.02] p-10">
              <h2 className="text-2xl font-light mb-3">Access denied</h2>
              <p className="text-[14px] text-[#8B9DAF]">Your account doesn't have admin privileges.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="text-[14px] text-[#8B9DAF]">
                  <span className="text-white font-medium">{rows?.length ?? 0}</span> reservations · <span className="text-white font-medium">{rows?.reduce((s, r) => s + r.quantity, 0) ?? 0}</span> rings
                </div>
                <button onClick={exportCSV} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[13px] hover:border-white/30">
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-[13px]">
                  <thead className="bg-white/[0.03] text-[11px] uppercase tracking-[2px] text-[#8B9DAF]">
                    <tr>
                      {['#','Date','Name','Email','Phone','Size','Color','Qty','Location','Ref'].map(h =>
                        <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {rows?.map(r => (
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
                        <td className="px-4 py-3 text-[#5A6B7E]">{r.referral_source ?? '—'}</td>
                      </tr>
                    ))}
                    {rows && rows.length === 0 && (
                      <tr><td colSpan={10} className="px-4 py-16 text-center text-[#5A6B7E]">No reservations yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
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