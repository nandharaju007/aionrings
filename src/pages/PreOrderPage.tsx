import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, ChevronDown, Loader2, Minus, Plus, ShieldCheck, Sparkles, Truck, Handshake, Ruler, Trash2, X } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { COUNTRIES } from "@/lib/countries";
import ringProduct from "@/assets/ring-product.jpg";

const GRADIENT = "linear-gradient(135deg,#00C6FF,#4FB3FF,#7C3AED)";
const FOUNDER_CAP = 2000;

const RING_SIZES = ["6", "7", "8", "9", "10", "11", "12", "13"];
const RING_COLORS = [
  { id: "midnight", name: "Midnight Black", filter: "brightness(0.75) contrast(1.15) hue-rotate(200deg)" },
  { id: "silver", name: "Titanium Silver", filter: "grayscale(1) brightness(1.1)" },
  { id: "rose", name: "Rose Gold", filter: "sepia(0.5) hue-rotate(-15deg) saturate(1.2) brightness(1.05)" },
];

// US ring size → inner diameter (mm) reference
const SIZE_CHART: Array<{ size: string; diameter: string; circumference: string }> = [
  { size: "6", diameter: "16.5 mm", circumference: "51.9 mm" },
  { size: "7", diameter: "17.3 mm", circumference: "54.4 mm" },
  { size: "8", diameter: "18.1 mm", circumference: "57.0 mm" },
  { size: "9", diameter: "19.0 mm", circumference: "59.5 mm" },
  { size: "10", diameter: "19.8 mm", circumference: "62.1 mm" },
  { size: "11", diameter: "20.6 mm", circumference: "64.6 mm" },
  { size: "12", diameter: "21.4 mm", circumference: "67.2 mm" },
  { size: "13", diameter: "22.2 mm", circumference: "69.7 mm" },
];

interface RingItem {
  id: string;
  ring_size: string;
  ring_color: string;
  quantity: number;
}

const newItem = (): RingItem => ({
  id: Math.random().toString(36).slice(2, 9),
  ring_size: "",
  ring_color: "midnight",
  quantity: 1,
});

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
}

const INITIAL: FormState = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zip_code: "",
  country: "United States",
};

export default function PreOrderPage() {
  const [params] = useSearchParams();
  const referral = params.get("ref") || undefined;
  const partnerCode = (params.get("partner") || "").trim().toLowerCase() || undefined;

  const [form, setForm] = useState<FormState>(INITIAL);
  const [items, setItems] = useState<RingItem[]>([newItem()]);
  const [sizingOpen, setSizingOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{ name: string; partner?: string | null } | null>(null);
  const [totals, setTotals] = useState<{ reservations: number; rings: number }>({ reservations: 0, rings: 0 });
  const [partner, setPartner] = useState<{ code: string; name: string } | null>(null);

  useEffect(() => {
    document.title = "Pre-Order aiOn Ring — Founder Edition";
    supabase
      .from("reservation_totals")
      .select("total_reservations, total_rings")
      .maybeSingle()
      .then(({ data }) => {
        if (data) setTotals({ reservations: Number(data.total_reservations), rings: Number(data.total_rings) });
      });
  }, [confirmed]);

  useEffect(() => {
    if (!partnerCode) {
      setPartner(null);
      return;
    }
    supabase
      .from("partners")
      .select("code, name, status")
      .eq("code", partnerCode)
      .eq("status", "active")
      .maybeSingle()
      .then(({ data }) => {
        if (data) setPartner({ code: data.code, name: data.name });
      });
  }, [partnerCode]);

  const founderClaimed = totals.rings;
  const founderLeft = Math.max(0, FOUNDER_CAP - founderClaimed);
  const founderPct = Math.min(100, (founderClaimed / FOUNDER_CAP) * 100);
  const previewColor = useMemo(() => RING_COLORS.find((c) => c.id === items[0]?.ring_color) ?? RING_COLORS[0], [items]);
  const totalRings = items.reduce((s, i) => s + (i.quantity || 0), 0);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((p) => ({ ...p, [k]: v }));
  const updateItem = (id: string, patch: Partial<RingItem>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const addItem = () => setItems((prev) => (prev.length >= 10 ? prev : [...prev, newItem()]));
  const removeItem = (id: string) => setItems((prev) => (prev.length <= 1 ? prev : prev.filter((it) => it.id !== id)));

  const detailsValid =
    form.first_name.trim() &&
    form.last_name.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.phone.trim() &&
    form.address.trim() &&
    form.city.trim() &&
    form.state.trim() &&
    form.zip_code.trim() &&
    form.country.trim();
  const itemsValid = items.length > 0 && items.every((i) => i.ring_size && i.quantity >= 1);
  const canSubmit = detailsValid && itemsValid;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(
        "https://aionringcloudservice-csbbbub5bxc0c9cw.canadacentral-01.azurewebsites.net/api/web-orders",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            items: items.map(({ ring_size, ring_color, quantity }) => ({ ring_size, ring_color, quantity })),
            referral_source: referral,
            partner_code: partner?.code ?? partnerCode,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Reservation failed");
      setConfirmed({ name: form.first_name, partner: partner?.name ?? null });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
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
            <ConfirmationCard name={confirmed.name} partner={confirmed.partner} />
          ) : (
            <>
              {partner && (
                <div className="mb-10 max-w-3xl mx-auto rounded-2xl border border-[#4FB3FF]/25 bg-gradient-to-br from-[#4FB3FF]/[0.06] to-transparent p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div
                      className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
                      style={{ background: GRADIENT }}
                    >
                      <Handshake className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[3px] text-[#4FB3FF] mb-2">
                        Welcome
                      </div>
                      <h2 className="text-xl md:text-2xl font-light tracking-tight text-white">
                        You've been invited by <span className="font-medium">{partner.name}</span> to reserve your aiOn
                        Ring.
                      </h2>
                      <p className="mt-2 text-[14px] text-[#B8C5D3] leading-relaxed">
                        {partner.name} is an official aiOn Partner helping customers gain early access to AI-powered
                        wellness technology. Complete your reservation below — we'll take care of everything else.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 mb-6">
                  <Sparkles className="w-3.5 h-3.5 text-[#4FB3FF]" />
                  <span className="text-[11px] font-semibold uppercase tracking-[3px] text-[#B8C5D3]">
                    Founder Edition · Limited to {FOUNDER_CAP}
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-4">
                  Reserve your{" "}
                  <span style={{ backgroundImage: GRADIENT, WebkitBackgroundClip: "text", color: "transparent" }}>
                    aiOn Ring
                  </span>
                  .
                </h1>
                <p className="text-[16px] text-[#8B9DAF] max-w-xl mx-auto">
                  Be among the first 500 to wear the future of health awareness. No payment today — your place is held.
                </p>

                {/* Founder counter */}
                <div className="mt-10 max-w-md mx-auto">
                  <div className="flex items-baseline justify-between text-[13px] mb-2">
                    <span className="text-[#B8C5D3]">Founder Edition claimed</span>
                    <span className="font-medium text-white">
                      {founderClaimed} / {FOUNDER_CAP}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full transition-all duration-700"
                      style={{ width: `${founderPct}%`, background: GRADIENT }}
                    />
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
                        style={{ filter: previewColor.filter }}
                      />
                    </div>
                    <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] uppercase tracking-[3px] text-[#8B9DAF]">Preview</div>
                        <div className="text-[15px] font-medium mt-1">{previewColor.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] uppercase tracking-[3px] text-[#8B9DAF]">Total</div>
                        <div className="text-[15px] font-medium mt-1">
                          {totalRings} ring{totalRings === 1 ? "" : "s"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trust */}
                  <div className="mt-8 grid grid-cols-3 gap-3">
                    {[
                      { icon: ShieldCheck, label: "No payment today" },
                      { icon: Truck, label: "Priority shipping" },
                      { icon: Sparkles, label: "Founder pricing" },
                    ].map(({ icon: Icon, label }) => (
                      <div
                        key={label}
                        className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 text-center"
                      >
                        <Icon className="w-4 h-4 text-[#4FB3FF] mx-auto mb-1.5" />
                        <div className="text-[11px] text-[#B8C5D3] leading-tight">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={onSubmit} className="space-y-8">
                  <Section title="Your rings">
                    {/* Sizing help — always visible */}
                    <div className="rounded-xl border border-[#4FB3FF]/20 bg-[#4FB3FF]/[0.04] px-4 py-3">
                      <div className="flex items-start gap-3">
                        <Ruler className="w-4 h-4 text-[#4FB3FF] mt-0.5 shrink-0" />
                        <div className="flex-1 text-[13px] text-[#B8C5D3] leading-relaxed">
                          <div className="font-medium text-white mb-1">Not sure of your ring size?</div>
                          <p className="text-[#8B9DAF]">
                            Measure the inside diameter of a ring you already wear, or wrap a string around the base of
                            your finger and match the length below.
                          </p>
                          <button
                            type="button"
                            onClick={() => setSizingOpen(true)}
                            className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-[#4FB3FF] hover:text-white transition-colors underline underline-offset-2"
                          >
                            View full sizing guide →
                          </button>
                          <p className="mt-2 text-[12px] text-[#5A6B7E]">
                            Prefer to measure at home? A free sizing kit ships before your ring.
                          </p>
                        </div>
                      </div>
                    </div>

                    {items.map((item, idx) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-[12px] uppercase tracking-[2px] text-[#8B9DAF]">Ring {idx + 1}</div>
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-[#8B9DAF] hover:text-red-400 transition-colors inline-flex items-center gap-1 text-[12px]"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                          )}
                        </div>

                        <div>
                          <Label>Ring size</Label>
                          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mt-2">
                            {RING_SIZES.map((s) => (
                              <button
                                type="button"
                                key={s}
                                onClick={() => updateItem(item.id, { ring_size: s })}
                                className={`h-11 rounded-lg border text-[14px] font-medium transition-all ${item.ring_size === s ? "border-[#4FB3FF] bg-[#4FB3FF]/10 text-white" : "border-white/10 bg-white/[0.02] text-[#B8C5D3] hover:border-white/20"}`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label>Finish</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {RING_COLORS.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => updateItem(item.id, { ring_color: c.id })}
                                className={`flex items-center gap-2 px-3 h-10 rounded-full border text-[13px] transition-all ${item.ring_color === c.id ? "border-[#4FB3FF] bg-[#4FB3FF]/10 text-white" : "border-white/10 bg-white/[0.02] text-[#B8C5D3] hover:border-white/20"}`}
                              >
                                <span
                                  className="w-4 h-4 rounded-full border border-white/20"
                                  style={{
                                    background:
                                      c.id === "midnight" ? "#1a1f2e" : c.id === "silver" ? "#c0c5cc" : "#d4a596",
                                  }}
                                />
                                {c.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label>Quantity</Label>
                          <div className="mt-2 inline-flex items-center rounded-full border border-white/10 bg-white/[0.02] p-1">
                            <button
                              type="button"
                              onClick={() => updateItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                              className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center"
                              aria-label="Decrease"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center text-[16px] font-medium">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateItem(item.id, { quantity: Math.min(100, item.quantity + 1) })}
                              className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center"
                              aria-label="Increase"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {items.length < 10 && (
                      <button
                        type="button"
                        onClick={addItem}
                        className="w-full h-12 rounded-xl border border-dashed border-white/15 text-[14px] text-[#B8C5D3] hover:border-[#4FB3FF]/50 hover:text-white transition-all inline-flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Add another ring
                      </button>
                    )}
                  </Section>

                  <Section title="Your details">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="First name"
                        value={form.first_name}
                        onChange={(v) => update("first_name", v)}
                        required
                      />
                      <Input
                        label="Last name"
                        value={form.last_name}
                        onChange={(v) => update("last_name", v)}
                        required
                      />
                    </div>
                    <Input
                      label="Email"
                      type="email"
                      value={form.email}
                      onChange={(v) => update("email", v)}
                      required
                    />
                    <Input label="Phone" type="tel" value={form.phone} onChange={(v) => update("phone", v)} required />
                  </Section>

                  <Section title="Shipping address">
                    <Input label="Address" value={form.address} onChange={(v) => update("address", v)} required />
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="City" value={form.city} onChange={(v) => update("city", v)} required />
                      <Input label="State / Region" value={form.state} onChange={(v) => update("state", v)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="ZIP / Postal code"
                        value={form.zip_code}
                        onChange={(v) => update("zip_code", v)}
                        required
                      />
                      <CountrySelect
                        label="Country"
                        value={form.country}
                        onChange={(v) => update("country", v)}
                        required
                      />
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
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Reserving your ring…
                      </>
                    ) : (
                      <>Reserve {totalRings > 1 ? `my ${totalRings} aiOn Rings` : "my aiOn Ring"} →</>
                    )}
                  </button>

                  <p className="text-center text-[12px] text-[#5A6B7E]">
                    No charge today. We'll email you before we ship. By reserving, you agree to our{" "}
                    <Link to="/terms-of-service" className="underline hover:text-white">
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy-policy" className="underline hover:text-white">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </form>
              </div>
            </>
          )}
        </div>
      </main>

      {sizingOpen && <SizingGuide onClose={() => setSizingOpen(false)} />}

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
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[13px] text-[#B8C5D3]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        maxLength={200}
        className="mt-1.5 w-full h-12 rounded-xl border border-white/10 bg-white/[0.02] px-4 text-[15px] text-white placeholder-[#5A6B7E] focus:border-[#4FB3FF] focus:bg-white/[0.04] focus:outline-none transition-all"
      />
    </label>
  );
}

function ConfirmationCard({ name, partner }: { name: string; partner?: string | null }) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      {null}
      <div
        className="w-20 h-20 mx-auto mb-8 rounded-full flex items-center justify-center"
        style={{ background: GRADIENT }}
      >
        <Check className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4">Thank you, {name}.</h1>
      <p className="text-[16px] text-[#8B9DAF] mb-10 max-w-lg mx-auto">
        Your aiOn Ring reservation has been received. A confirmation email is on its way.
      </p>
      {partner && (
        <div className="inline-block rounded-2xl border border-[#4FB3FF]/25 bg-[#4FB3FF]/[0.06] px-6 py-4 mb-6">
          <div className="text-[11px] uppercase tracking-[3px] text-[#4FB3FF] mb-1">Referred by</div>
          <div className="text-[16px] font-medium">{partner}</div>
        </div>
      )}
      <p className="text-[13px] text-[#8B9DAF] mb-8 max-w-md mx-auto">
        We'll contact you soon regarding pricing, availability and delivery.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/"
          className="rounded-full border border-white/15 px-8 py-3 text-[14px] font-medium hover:border-white/30 transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

function SizingGuide({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#0F1E33] p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full border border-white/10 hover:border-white/30 flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-[11px] uppercase tracking-[3px] text-[#4FB3FF] mb-2">Sizing Guide</div>
        <h3 className="text-2xl font-light tracking-tight mb-4">Find your perfect fit.</h3>

        <div className="space-y-4 text-[13px] text-[#B8C5D3] leading-relaxed">
          <div>
            <div className="font-medium text-white mb-1">Method 1 — Existing ring</div>
            <p>Measure the inside diameter of a ring you already wear (in millimetres) and match it below.</p>
          </div>
          <div>
            <div className="font-medium text-white mb-1">Method 2 — String</div>
            <p>
              Wrap a string or strip of paper around the base of the finger you'll wear the aiOn on. Mark where it
              overlaps and measure the length — that's your circumference.
            </p>
          </div>
          <div>
            <div className="font-medium text-white mb-1">Tips</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>Measure at the end of the day when fingers are warmest.</li>
              <li>Wear it snug — the sensors need skin contact.</li>
              <li>When in doubt, size up.</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-white/[0.04] text-[#8B9DAF] text-[11px] uppercase tracking-[2px]">
                <th className="text-left px-4 py-2 font-medium">US Size</th>
                <th className="text-left px-4 py-2 font-medium">Inner Diameter</th>
                <th className="text-left px-4 py-2 font-medium">Circumference</th>
              </tr>
            </thead>
            <tbody>
              {SIZE_CHART.map((row) => (
                <tr key={row.size} className="border-t border-white/5">
                  <td className="px-4 py-2 font-medium text-white">{row.size}</td>
                  <td className="px-4 py-2 text-[#B8C5D3]">{row.diameter}</td>
                  <td className="px-4 py-2 text-[#B8C5D3]">{row.circumference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-[12px] text-[#5A6B7E]">
          Still unsure? Order any size — we'll ship a free sizing kit before your ring, and you can update your final
          size before dispatch.
        </p>
      </div>
    </div>
  );
}
