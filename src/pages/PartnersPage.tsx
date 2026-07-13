import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Handshake, Users, Building2, ArrowRight, Check, Loader2, QrCode, Sparkles } from 'lucide-react';

const GRADIENT = 'linear-gradient(135deg,#00C6FF,#4FB3FF,#7C3AED)';
const RING_SIZES = ['6', '7', '8', '9', '10', '11', '12', '13'];

interface BulkForm {
  business_name: string;
  contact_person: string;
  email: string;
  phone: string;
  estimated_quantity: number;
  notes: string;
  size_breakdown: Record<string, number>;
}

const INITIAL: BulkForm = {
  business_name: '', contact_person: '', email: '', phone: '',
  estimated_quantity: 10, notes: '',
  size_breakdown: Object.fromEntries(RING_SIZES.map(s => [s, 0])),
};

export default function PartnersPage() {
  const [mode, setMode] = useState<'landing' | 'bulk'>('landing');
  const [form, setForm] = useState<BulkForm>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'aiOn Partner Program — Healthcare & Wellness Partners';
  }, []);

  const update = <K extends keyof BulkForm>(k: K, v: BulkForm[K]) => setForm(p => ({ ...p, [k]: v }));

  const canSubmit =
    form.business_name.trim() && form.contact_person.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.phone.trim() && form.estimated_quantity >= 1;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true); setError(null);
    try {
      const breakdown = Object.fromEntries(
        Object.entries(form.size_breakdown).filter(([, n]) => n > 0)
      );
      const { data, error } = await supabase.functions.invoke('submit-bulk-reservation', {
        body: {
          business_name: form.business_name,
          contact_person: form.contact_person,
          email: form.email,
          phone: form.phone,
          estimated_quantity: form.estimated_quantity,
          notes: form.notes || undefined,
          size_breakdown: Object.keys(breakdown).length ? breakdown : undefined,
        },
      });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || 'Submission failed');
      setDone(data.reservation_number);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      <Header />
      <main className="pt-32 pb-32">
        <div className="mx-auto max-w-[1200px] px-6">

          {done ? (
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-20 h-20 mx-auto mb-8 rounded-full flex items-center justify-center" style={{ background: GRADIENT }}>
                <Check className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4">Thank you.</h1>
              <p className="text-[16px] text-[#8B9DAF] mb-8 max-w-lg mx-auto">
                We've received your bulk inquiry. Our partnerships team will contact you regarding pricing and delivery.
              </p>
              <div className="inline-block rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-6 mb-10">
                <div className="text-[11px] uppercase tracking-[3px] text-[#4FB3FF] mb-2">Inquiry Number</div>
                <div className="text-2xl font-medium tracking-[2px]">{done}</div>
              </div>
              <div>
                <Link to="/" className="rounded-full border border-white/15 px-8 py-3 text-[14px] font-medium hover:border-white/30 transition-colors">
                  Back to home
                </Link>
              </div>
            </div>
          ) : mode === 'bulk' ? (
            <div className="max-w-3xl mx-auto">
              <button onClick={() => setMode('landing')} className="text-[13px] text-[#8B9DAF] hover:text-white mb-6">← Back</button>
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 mb-6">
                  <Building2 className="w-3.5 h-3.5 text-[#4FB3FF]" />
                  <span className="text-[11px] font-semibold uppercase tracking-[3px] text-[#B8C5D3]">Bulk Reservation</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4">
                  For clinics, wellness centers <span style={{ backgroundImage: GRADIENT, WebkitBackgroundClip: 'text', color: 'transparent' }}>& businesses</span>.
                </h1>
                <p className="text-[15px] text-[#8B9DAF] max-w-xl mx-auto">
                  Tell us about your organization. We'll contact you regarding pricing and delivery — no payment today.
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-10">
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Business / Clinic name" value={form.business_name} onChange={v => update('business_name', v)} required />
                  <Field label="Contact person" value={form.contact_person} onChange={v => update('contact_person', v)} required />
                  <Field label="Business email" type="email" value={form.email} onChange={v => update('email', v)} required />
                  <Field label="Phone" type="tel" value={form.phone} onChange={v => update('phone', v)} required />
                </div>
                <div>
                  <label className="text-[13px] text-[#B8C5D3]">Estimated total quantity</label>
                  <input
                    type="number" min={1} max={100000} value={form.estimated_quantity}
                    onChange={e => update('estimated_quantity', Math.max(1, parseInt(e.target.value || '0', 10)))}
                    className="mt-1.5 w-full h-12 rounded-xl border border-white/10 bg-white/[0.02] px-4 text-[15px] focus:border-[#4FB3FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[13px] text-[#B8C5D3]">Quantity by ring size (optional)</label>
                  <div className="mt-2 grid grid-cols-4 md:grid-cols-8 gap-2">
                    {RING_SIZES.map(s => (
                      <div key={s} className="rounded-lg border border-white/10 bg-white/[0.02] p-2 text-center">
                        <div className="text-[11px] text-[#8B9DAF] mb-1">Size {s}</div>
                        <input
                          type="number" min={0} value={form.size_breakdown[s]}
                          onChange={e => update('size_breakdown', { ...form.size_breakdown, [s]: Math.max(0, parseInt(e.target.value || '0', 10)) })}
                          className="w-full h-9 rounded bg-white/[0.03] border border-white/10 text-center text-[13px] focus:border-[#4FB3FF] focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[13px] text-[#B8C5D3]">Notes (optional)</label>
                  <textarea
                    value={form.notes} onChange={e => update('notes', e.target.value)} rows={3} maxLength={2000}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-[15px] focus:border-[#4FB3FF] focus:outline-none"
                  />
                </div>
                {error && <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-[13px] text-red-300">{error}</div>}
                <p className="text-[12px] text-[#8B9DAF]">We'll contact you regarding pricing and delivery.</p>
                <button
                  type="submit" disabled={!canSubmit || submitting}
                  className="w-full h-14 rounded-full font-semibold text-white text-[15px] transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                  style={{ background: GRADIENT }}
                >
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <>Submit bulk inquiry →</>}
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Hero */}
              <div className="text-center mb-20">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 mb-6">
                  <Handshake className="w-3.5 h-3.5 text-[#4FB3FF]" />
                  <span className="text-[11px] font-semibold uppercase tracking-[3px] text-[#B8C5D3]">aiOn Partner Program</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-6">
                  Bring aiOn to <span style={{ backgroundImage: GRADIENT, WebkitBackgroundClip: 'text', color: 'transparent' }}>your community</span>.
                </h1>
                <p className="text-[17px] text-[#8B9DAF] max-w-2xl mx-auto leading-relaxed">
                  Clinics, wellness centers, healthcare providers and businesses can invite their customers to reserve the aiOn Ring — no inventory, no upfront cost.
                </p>
              </div>

              {/* Two paths */}
              <div className="grid md:grid-cols-2 gap-6 mb-20">
                <Link to="/preorder" className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 md:p-10 hover:border-white/20 transition-all">
                  <Users className="w-8 h-8 text-[#4FB3FF] mb-6" />
                  <div className="text-[11px] uppercase tracking-[3px] text-[#4FB3FF] mb-3">Individual</div>
                  <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-3">I'm reserving for myself</h2>
                  <p className="text-[14px] text-[#8B9DAF] leading-relaxed mb-6">
                    Reserve your Founder Edition aiOn Ring. No payment today.
                  </p>
                  <span className="inline-flex items-center gap-2 text-[14px] font-medium text-white group-hover:gap-3 transition-all">
                    Pre-order your ring <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>

                <button onClick={() => setMode('bulk')} className="text-left group relative overflow-hidden rounded-3xl border border-[#4FB3FF]/30 bg-gradient-to-br from-[#4FB3FF]/[0.06] to-transparent p-8 md:p-10 hover:border-[#4FB3FF]/60 transition-all">
                  <Building2 className="w-8 h-8 text-[#4FB3FF] mb-6" />
                  <div className="text-[11px] uppercase tracking-[3px] text-[#4FB3FF] mb-3">Business / Healthcare Partner</div>
                  <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-3">We're reserving for our organization</h2>
                  <p className="text-[14px] text-[#8B9DAF] leading-relaxed mb-6">
                    Bulk reservations for clinics, wellness centers, and enterprises. We'll contact you regarding pricing and delivery.
                  </p>
                  <span className="inline-flex items-center gap-2 text-[14px] font-medium text-white group-hover:gap-3 transition-all">
                    Request bulk reservation <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              </div>

              {/* How it works */}
              <div className="mb-20">
                <div className="text-center mb-12">
                  <div className="text-[11px] uppercase tracking-[3px] text-[#4FB3FF] mb-3">How the partner program works</div>
                  <h2 className="text-3xl md:text-5xl font-light tracking-tight">A dedicated referral link for every partner.</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { icon: Sparkles, title: 'Become a partner', body: 'We create your dedicated partner code, referral link and QR code.' },
                    { icon: QrCode, title: 'Share with your community', body: 'Invite your customers via your unique link — every reservation is attributed to you automatically.' },
                    { icon: Handshake, title: 'We handle the rest', body: 'aiOn takes care of confirmations, fulfillment and customer communication end-to-end.' },
                  ].map(({ icon: Icon, title, body }) => (
                    <div key={title} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
                      <Icon className="w-6 h-6 text-[#4FB3FF] mb-4" />
                      <h3 className="text-[18px] font-medium mb-2">{title}</h3>
                      <p className="text-[14px] text-[#8B9DAF] leading-relaxed">{body}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-transparent p-10 md:p-16 text-center">
                <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-4">Interested in becoming an aiOn Partner?</h2>
                <p className="text-[15px] text-[#8B9DAF] mb-8 max-w-xl mx-auto">
                  Reach out to our partnerships team. We'll set up your dedicated partner page and referral link.
                </p>
                <a href="mailto:support@aionrings.com" className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-[15px] font-semibold text-white hover:brightness-110 transition-all" style={{ background: GRADIENT }}>
                  Contact partnerships →
                </a>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-[13px] text-[#B8C5D3]">{label}</span>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} required={required} maxLength={200}
        className="mt-1.5 w-full h-12 rounded-xl border border-white/10 bg-white/[0.02] px-4 text-[15px] focus:border-[#4FB3FF] focus:outline-none"
      />
    </label>
  );
}