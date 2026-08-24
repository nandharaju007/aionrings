import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { SEO } from '@/components/SEO';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Handshake, Users, Building2, ArrowRight, Check, Loader2, QrCode, Sparkles } from 'lucide-react';

const GRADIENT = 'linear-gradient(135deg,#00A9E0,#1878E0,#6D28D9)';
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
    document.title = 'aiOn Partner Program — Wellness & Lifestyle Partners';
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
    <div className="min-h-screen bg-canvas text-ink">
      <SEO title={"aiOn Partner Program — Bring everyday wellness to your community"} description={"Join the aiOn Partner Program. Referral tools, bulk reservations, and co-branded launches for wellness studios, gyms, employers, and creators."} path="/partners" image="/og-partners.jpg" />
      <Header />
      <main className="pt-32 pb-32">
        <div className="mx-auto max-w-[1200px] px-6">

          {done ? (
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-20 h-20 mx-auto mb-8 rounded-full flex items-center justify-center shadow-lg" style={{ background: GRADIENT }}>
                <Check className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4 text-ink">Thank you.</h1>
              <p className="text-[16px] text-ink-muted mb-8 max-w-lg mx-auto">
                We've received your bulk inquiry. Our partnerships team will contact you regarding pricing and delivery.
              </p>
              <div className="inline-block surface-card px-8 py-6 mb-10">
                <div className="text-[11px] uppercase tracking-[3px] text-primary mb-2">Inquiry Number</div>
                <div className="text-2xl font-medium tracking-[2px] text-ink">{done}</div>
              </div>
              <div>
                <Link to="/" className="rounded-full border border-border px-8 py-3 text-[14px] font-medium hover:border-primary transition-colors text-ink">
                  Back to home
                </Link>
              </div>
            </div>
          ) : mode === 'bulk' ? (
            <div className="max-w-3xl mx-auto">
              <button onClick={() => setMode('landing')} className="text-[13px] text-ink-muted hover:text-ink mb-6 transition-colors">← Back</button>
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-1.5 mb-6 shadow-sm">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[11px] font-semibold uppercase tracking-[3px] text-ink-muted">Bulk Reservation</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4 text-ink">
                  For wellness centers, studios <span className="text-gradient-brand">& businesses</span>.
                </h1>
                <p className="text-[15px] text-ink-muted max-w-xl mx-auto">
                  Tell us about your organization. We'll contact you regarding pricing and delivery — no payment today.
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-6 surface-card p-6 md:p-10">
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Business / Organization name" value={form.business_name} onChange={v => update('business_name', v)} required />
                  <Field label="Contact person" value={form.contact_person} onChange={v => update('contact_person', v)} required />
                  <Field label="Business email" type="email" value={form.email} onChange={v => update('email', v)} required />
                  <Field label="Phone" type="tel" value={form.phone} onChange={v => update('phone', v)} required />
                </div>
                <div>
                  <label className="text-[13px] text-ink-soft">Estimated total quantity</label>
                  <input
                    type="number" min={1} max={100000} value={form.estimated_quantity}
                    onChange={e => update('estimated_quantity', Math.max(1, parseInt(e.target.value || '0', 10)))}
                    className="mt-1.5 w-full h-12 rounded-xl border border-border bg-white px-4 text-[15px] text-ink focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[13px] text-ink-soft">Quantity by ring size (optional)</label>
                  <div className="mt-2 grid grid-cols-4 md:grid-cols-8 gap-2">
                    {RING_SIZES.map(s => (
                      <div key={s} className="rounded-lg border border-border bg-canvas-alt p-2 text-center">
                        <div className="text-[11px] text-ink-muted mb-1">Size {s}</div>
                        <input
                          type="number" min={0} value={form.size_breakdown[s]}
                          onChange={e => update('size_breakdown', { ...form.size_breakdown, [s]: Math.max(0, parseInt(e.target.value || '0', 10)) })}
                          className="w-full h-9 rounded bg-white border border-border text-center text-[13px] text-ink focus:border-primary focus:outline-none transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[13px] text-ink-soft">Notes (optional)</label>
                  <textarea
                    value={form.notes} onChange={e => update('notes', e.target.value)} rows={3} maxLength={2000}
                    className="mt-1.5 w-full rounded-xl border border-border bg-white px-4 py-3 text-[15px] text-ink focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                  />
                </div>
                {error && <div className="rounded-xl border border-red-500/30 bg-red-50 px-4 py-3 text-[13px] text-red-600">{error}</div>}
                <p className="text-[12px] text-ink-muted">We'll contact you regarding pricing and delivery.</p>
                <button
                  type="submit" disabled={!canSubmit || submitting}
                  className="w-full h-14 rounded-full font-semibold text-white text-[15px] transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-lg"
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
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-1.5 mb-6 shadow-sm">
                  <Handshake className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[11px] font-semibold uppercase tracking-[3px] text-ink-muted">aiOn Partner Program</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-6 text-ink">
                  Bring aiOn to <span className="text-gradient-brand">your community</span>.
                </h1>
                <p className="text-[17px] text-ink-soft max-w-2xl mx-auto leading-relaxed">
                  Wellness centers, studios, gyms, employers and businesses can invite their customers to reserve the aiOn Ring — no inventory, no upfront cost.
                </p>
              </div>

              {/* Two paths */}
              <div className="grid md:grid-cols-2 gap-6 mb-20">
                <Link to="/preorder" className="group surface-card-hover p-8 md:p-10">
                  <Users className="w-8 h-8 text-primary mb-6" />
                  <div className="text-[11px] uppercase tracking-[3px] text-primary mb-3">Individual</div>
                  <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-3 text-ink">I'm reserving for myself</h2>
                  <p className="text-[14px] text-ink-muted leading-relaxed mb-6">
                    Reserve your Founder Edition aiOn Ring. No payment today.
                  </p>
                  <span className="inline-flex items-center gap-2 text-[14px] font-medium text-primary group-hover:gap-3 transition-all">
                    Pre-order your ring <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>

                <button onClick={() => setMode('bulk')} className="text-left group relative overflow-hidden rounded-3xl border border-primary/20 bg-white p-8 md:p-10 shadow-sm hover:border-primary/40 transition-all">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                  <Building2 className="w-8 h-8 text-primary mb-6" />
                  <div className="text-[11px] uppercase tracking-[3px] text-primary mb-3">Business / Wellness Partner</div>
                  <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-3 text-ink">We're reserving for our organization</h2>
                  <p className="text-[14px] text-ink-muted leading-relaxed mb-6">
                    Bulk reservations for wellness centers, studios, and enterprises. We'll contact you regarding pricing and delivery.
                  </p>
                  <span className="inline-flex items-center gap-2 text-[14px] font-medium text-primary group-hover:gap-3 transition-all">
                    Request bulk reservation <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              </div>

              {/* How it works */}
              <div className="mb-20">
                <div className="text-center mb-12">
                  <div className="text-[11px] uppercase tracking-[3px] text-primary mb-3">How the partner program works</div>
                  <h2 className="text-3xl md:text-5xl font-light tracking-tight text-ink">A dedicated referral link for every partner.</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { icon: Sparkles, title: 'Become a partner', body: 'We create your dedicated partner code, referral link and QR code.' },
                    { icon: QrCode, title: 'Share with your community', body: 'Invite your customers via your unique link — every reservation is attributed to you automatically.' },
                    { icon: Handshake, title: 'We handle the rest', body: 'aiOn takes care of confirmations, fulfillment and customer communication end-to-end.' },
                  ].map(({ icon: Icon, title, body }) => (
                    <div key={title} className="surface-card p-8">
                      <Icon className="w-6 h-6 text-primary mb-4" />
                      <h3 className="text-[18px] font-medium mb-2 text-ink">{title}</h3>
                      <p className="text-[14px] text-ink-muted leading-relaxed">{body}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="rounded-3xl border border-border bg-white p-10 md:p-16 text-center shadow-sm">
                <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-4 text-ink">Interested in becoming an aiOn Partner?</h2>
                <p className="text-[15px] text-ink-muted mb-8 max-w-xl mx-auto">
                  Reach out to our partnerships team. We'll set up your dedicated partner page and referral link.
                </p>
                <a href="mailto:contact@aionrings.com" className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-[15px] font-semibold text-white hover:brightness-110 transition-all shadow-lg" style={{ background: GRADIENT }}>
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
      <span className="text-[13px] text-ink-soft">{label}</span>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} required={required} maxLength={200}
        className="mt-1.5 w-full h-12 rounded-xl border border-border bg-white px-4 text-[15px] text-ink focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
      />
    </label>
  );
}
