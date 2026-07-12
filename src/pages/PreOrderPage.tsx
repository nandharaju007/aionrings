import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, Loader2, Minus, Plus, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import ringProduct from '@/assets/ring-product.jpg';

const GRADIENT = 'linear-gradient(135deg,#00C6FF,#4FB3FF,#7C3AED)';
const FOUNDER_CAP = 500;

const RING_SIZES = ['6', '7', '8', '9', '10', '11', '12', '13'];
const RING_COLORS = [
  { id: 'midnight', name: 'Midnight Black', filter: 'brightness(0.75) contrast(1.15) hue-rotate(200deg)' },
  { id: 'silver', name: 'Titanium Silver', filter: 'grayscale(1) brightness(1.1)' },
  { id: 'rose', name: 'Rose Gold', filter: 'sepia(0.5) hue-rotate(-15deg) saturate(1.2) brightness(1.05)' },
];

interface FormState {
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
  ring_color: string;
  quantity: number;
}

const INITIAL: FormState = {
  first_name: '', last_name: '', email: '', phone: '',
  address: '', city: '', state: '', zip_code: '', country: 'United States',
  ring_size: '', ring_color: 'midnight', quantity: 1,
};

export default function PreOrderPage() {
  const [params] = useSearchParams();
  const referral = params.get('ref') || undefined;

  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{ number: string; name: string } | null>(null);
  const [totals, setTotals] = useState<{ reservations: number; rings: number }>({ reservations: 0, rings: 0 });

  useEffect(() => {
    document.title = 'Pre-Order aiOn Ring — Founder Edition';
    supabase
      .from('reservation_totals')
      .select('total_reservations, total_rings')
      .maybeSingle()
      .then(({ data }) => {
        if (data) setTotals({ reservations: Number(data.total_reservations), rings: Number(data.total_rings) });
      });
  }, [confirmed]);

  const founderClaimed = totals.rings;
  const founderLeft = Math.max(0, FOUNDER_CAP - founderClaimed);
  const founderPct = Math.min(100, (founderClaimed / FOUNDER_CAP) * 100);
  const selectedColor = useMemo(() => RING_COLORS.find(c => c.id === form.ring_color) ?? RING_COLORS[0], [form.ring_color]);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm(p => ({ ...p, [k]: v }));

  const canSubmit =
    form.first_name.trim() && form.last_name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    && form.phone.trim() && form.address.trim() && form.city.trim() && form.state.trim()
    && form.zip_code.trim() && form.country.trim() && form.ring_size && form.quantity >= 1;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('submit-reservation', {
        body: { ...form, referral_source: referral },
      });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || 'Reservation failed');
      setConfirmed({ number: data.reservation_number, name: form.first_name });
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
          {confirmed ? (
            <ConfirmationCard number={confirmed.number} name={confirmed.name} />
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 mb-6">
                  <Sparkles className="w-3.5 h-3.5 text-[#4FB3FF]" />
                  <span className="text-[11px] font-semibold uppercase tracking-[3px] text-[#B8C5D3]">
                    Founder Edition · Limited to {FOUNDER_CAP}
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-4">
                  Reserve your <span style={{ backgroundImage: GRADIENT, WebkitBackgroundClip: 'text', color: 'transparent' }}>aiOn Ring</span>.
                </h1>
                <p className="text-[16px] text-[#8B9DAF] max-w-xl mx-auto">
                  Be among the first 500 to wear the future of health awareness. No payment today — your place is held.
                </p>

                {/* Founder counter */}
                <div className="mt-10 max-w-md mx-auto">
                  <div className="flex items-baseline justify-between text-[13px] mb-2">
                    <span className="text-[#B8C5D3]">Founder Edition claimed</span>
                    <span className="font-medium text-white">{founderClaimed} / {FOUNDER_CAP}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full transition-all duration-700" style={{ width: `${founderPct}%`, background: GRADIENT }} />
                  </div>
                  <p className="mt-3 text-[12px] text-[#5A6B7E]">Only {founderLeft} founder rings remain.</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-start">
                {/* Product preview */}
                <div className="lg:sticky lg:top-28">
                  <div className="relative aspect-square rounded-3xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img
                        src={ringProduct}
                        alt="aiOn Ring"
                        className="w-4/5 h-4/5 object-contain transition-all duration-500"
                        style={{ filter: selectedColor.filter }}
                      />
                    </div>
                    <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] uppercase tracking-[3px] text-[#8B9DAF]">Finish</div>
                        <div className="text-[15px] font-medium mt-1">{selectedColor.name}</div>
                      </div>
                      <div className="flex gap-2">
                        {RING_COLORS.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => update('ring_color', c.id)}
                            aria-label={c.name}
                            className={`w-9 h-9 rounded-full border-2 transition-all ${form.ring_color === c.id ? 'border-white scale-110' : 'border-white/20'}`}
                            style={{
                              background: c.id === 'midnight' ? '#1a1f2e' : c.id === 'silver' ? '#c0c5cc' : '#d4a596',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Trust */}
                  <div className="mt-8 grid grid-cols-3 gap-3">
                    {[
                      { icon: ShieldCheck, label: 'No payment today' },
                      { icon: Truck, label: 'Priority shipping' },
                      { icon: Sparkles, label: 'Founder pricing' },
                    ].map(({ icon: Icon, label }) => (
                      <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 text-center">
                        <Icon className="w-4 h-4 text-[#4FB3FF] mx-auto mb-1.5" />
                        <div className="text-[11px] text-[#B8C5D3] leading-tight">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={onSubmit} className="space-y-8">
                  <Section title="Your ring">
                    <div>
                      <Label>Ring size</Label>
                      <div className="grid grid-cols-5 sm:grid-cols-9 gap-2 mt-2">
                        {RING_SIZES.map(s => (
                          <button
                            type="button"
                            key={s}
                            onClick={() => update('ring_size', s)}
                            className={`h-11 rounded-lg border text-[14px] font-medium transition-all ${form.ring_size === s ? 'border-[#4FB3FF] bg-[#4FB3FF]/10 text-white' : 'border-white/10 bg-white/[0.02] text-[#B8C5D3] hover:border-white/20'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 text-[12px] text-[#5A6B7E]">Not sure? A free sizing kit ships before your ring.</p>
                    </div>

                    <div>
                      <Label>Quantity</Label>
                      <div className="mt-2 inline-flex items-center rounded-full border border-white/10 bg-white/[0.02] p-1">
                        <button
                          type="button"
                          onClick={() => update('quantity', Math.max(1, form.quantity - 1))}
                          className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center"
                          aria-label="Decrease"
                        ><Minus className="w-4 h-4" /></button>
                        <span className="w-12 text-center text-[16px] font-medium">{form.quantity}</span>
                        <button
                          type="button"
                          onClick={() => update('quantity', Math.min(10, form.quantity + 1))}
                          className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center"
                          aria-label="Increase"
                        ><Plus className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </Section>

                  <Section title="Your details">
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="First name" value={form.first_name} onChange={v => update('first_name', v)} required />
                      <Input label="Last name" value={form.last_name} onChange={v => update('last_name', v)} required />
                    </div>
                    <Input label="Email" type="email" value={form.email} onChange={v => update('email', v)} required />
                    <Input label="Phone" type="tel" value={form.phone} onChange={v => update('phone', v)} required />
                  </Section>

                  <Section title="Shipping address">
                    <Input label="Address" value={form.address} onChange={v => update('address', v)} required />
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="City" value={form.city} onChange={v => update('city', v)} required />
                      <Input label="State / Region" value={form.state} onChange={v => update('state', v)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="ZIP / Postal code" value={form.zip_code} onChange={v => update('zip_code', v)} required />
                      <Input label="Country" value={form.country} onChange={v => update('country', v)} required />
                    </div>
                  </Section>

                  {error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-[13px] text-red-300">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!canSubmit || submitting}
                    className="w-full h-14 rounded-full font-semibold text-white text-[15px] transition-all hover:brightness-110 hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                    style={{ background: GRADIENT }}
                  >
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Reserving your ring…</>
                    ) : (
                      <>Reserve my aiOn Ring →</>
                    )}
                  </button>

                  <p className="text-center text-[12px] text-[#5A6B7E]">
                    No charge today. We'll email you before we ship. By reserving, you agree to our{' '}
                    <Link to="/terms-of-service" className="underline hover:text-white">Terms</Link> and{' '}
                    <Link to="/privacy-policy" className="underline hover:text-white">Privacy Policy</Link>.
                  </p>
                </form>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-[11px] font-semibold uppercase tracking-[3px] text-[#4FB3FF]">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-[13px] text-[#B8C5D3]">{children}</label>;
}

function Input({
  label, value, onChange, type = 'text', required,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[13px] text-[#B8C5D3]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        maxLength={200}
        className="mt-1.5 w-full h-12 rounded-xl border border-white/10 bg-white/[0.02] px-4 text-[15px] text-white placeholder-[#5A6B7E] focus:border-[#4FB3FF] focus:bg-white/[0.04] focus:outline-none transition-all"
      />
    </label>
  );
}

function ConfirmationCard({ number, name }: { number: string; name: string }) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="w-20 h-20 mx-auto mb-8 rounded-full flex items-center justify-center" style={{ background: GRADIENT }}>
        <Check className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4">
        Your ring is reserved, {name}.
      </h1>
      <p className="text-[16px] text-[#8B9DAF] mb-10 max-w-lg mx-auto">
        We've held your spot in the Founder Edition. A confirmation email is on its way.
      </p>
      <div className="inline-block rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-6 mb-10">
        <div className="text-[11px] uppercase tracking-[3px] text-[#4FB3FF] mb-2">Reservation Number</div>
        <div className="text-2xl font-medium tracking-[2px]">{number}</div>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link to="/" className="rounded-full border border-white/15 px-8 py-3 text-[14px] font-medium hover:border-white/30 transition-colors">
          Back to home
        </Link>
      </div>
    </div>
  );
}