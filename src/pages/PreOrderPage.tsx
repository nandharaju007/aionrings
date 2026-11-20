import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUp, Check, ChevronDown, ChevronLeft, ChevronRight, Clock, Fingerprint, Loader2, Minus, Plus, ShieldCheck, Sparkles, Truck, Handshake, Trash2, X } from "lucide-react";
import { Header } from "@/components/Header";
import { SEO } from '@/components/SEO';
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import ringMidnight from "@/assets/ring-finish-midnight.png";
import ringSilver from "@/assets/ring-finish-silver.png";
import ringRose from "@/assets/ring-finish-rose.png";
import { addressRules, SHIPPING_COUNTRIES as COUNTRIES, PREORDER_PHONE_OPTIONS as PHONE_CODE_OPTIONS } from "@/lib/international-address";
import { validatePreorder } from "@/lib/preorder-validation";
import { PhysicalRingSizer } from "@/components/PhysicalRingSizer";


const GRADIENT = "linear-gradient(135deg,#00A9E0,#1878E0,#6D28D9)";
const FOUNDER_CAP = 2000;

const RING_SIZES = ["6", "7", "8", "9", "10", "11", "12", "13"];
const RING_COLORS = [
  { id: "midnight", name: "Midnight Black", image: ringMidnight, swatch: "linear-gradient(135deg,#2A2F38,#0B0F16)" },
  { id: "silver", name: "Titanium Silver", image: ringSilver, swatch: "linear-gradient(135deg,#EDEFF2,#9AA3AD)" },
  { id: "rose", name: "Rose Gold", image: ringRose, swatch: "linear-gradient(135deg,#F3C4AE,#C98D6E)" },
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
  phone_code: string;
  phone_iso: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  referral_source: string;
}

const INITIAL: FormState = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  phone_code: "1",
  phone_iso: "US",
  address: "",
  city: "",
  state: "",
  zip_code: "",
  country: "United States",
  referral_source: "",
};


export default function PreOrderPage() {
  const [params] = useSearchParams();
  const referral = params.get("ref") || undefined;
  const partnerCode = (params.get("partner") || "").trim().toLowerCase() || undefined;

  const [form, setForm] = useState<FormState>(() => ({ ...INITIAL, referral_source: referral ?? "" }));
  const [items, setItems] = useState<RingItem[]>(() => {
    const item = newItem();
    const measured = params.get("measured_size");
    return [{ ...item, ring_size: measured && RING_SIZES.includes(measured) ? measured : "" }];
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const orderFormRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{ name: string; partner?: string | null } | null>(null);
  const [partner, setPartner] = useState<{ code: string; name: string } | null>(null);

  useEffect(() => {
    document.title = "Pre-Order aiOn Ring - Founder Edition";
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
        if (data) {
          setPartner({ code: data.code, name: data.name });
          setForm((p) => (p.referral_source.trim() ? p : { ...p, referral_source: data.name }));
        }
      });

  }, [partnerCode]);

  const selectedColorIdx = Math.max(0, RING_COLORS.findIndex((c) => c.id === items[0]?.ring_color));
  const [previewIdx, setPreviewIdx] = useState(selectedColorIdx);
  useEffect(() => setPreviewIdx(selectedColorIdx), [selectedColorIdx]);
  const previewColor = RING_COLORS[previewIdx] ?? RING_COLORS[0];
  const swipeStart = useRef<number | null>(null);
  const stepPreview = (d: number) => setPreviewIdx((i) => (i + d + RING_COLORS.length) % RING_COLORS.length);
  const totalRings = items.reduce((s, i) => s + (i.quantity || 0), 0);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((p) => {
      if (k !== "country") return { ...p, [k]: v };
      const country = String(v);
      const rules = addressRules(country);
      const phoneOption = PHONE_CODE_OPTIONS.find(option => option.iso === rules.iso);
      return {
        ...p, country,
        // A customer's contact number can belong to a different country from delivery.
        ...(!p.phone.trim() && phoneOption ? { phone_code: phoneOption.code, phone_iso: phoneOption.iso } : {}),
        ...(rules.iso && !rules.postalUsed ? { zip_code: "" } : {}),
      };
    });
    markTouched(k);
  };
  const markTouched = (k: string) => setTouched((p) => ({ ...p, [k]: true }));
  const updateItem = (id: string, patch: Partial<RingItem>) => {
    Object.keys(patch).forEach(key => markTouched(`${id}.${key}`));
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };
  const addItem = () => setItems((prev) => (prev.length >= 10 ? prev : [...prev, newItem()]));
  const removeItem = (id: string) => setItems((prev) => (prev.length <= 1 ? prev : prev.filter((it) => it.id !== id)));

  // Field-level errors, always computed; only shown once touched or on submit attempt.
  const validation = useMemo(() => validatePreorder(form, items, COUNTRIES), [form, items]);
  const errors = validation.errors;
  const shippingRules = addressRules(form.country);
  const canSubmit = !!validation.data;

  const revealErrors = () => {
    const all: Record<string, boolean> = {};
    Object.keys(form).forEach(key => { all[key] = true; });
    items.forEach(item => ['ring_size', 'ring_color', 'quantity'].forEach(key => { all[`${item.id}.${key}`] = true; }));
    setTouched(all);
  };

  const requestReservation = () => {
    if (submitting) return;
    const parsed = validatePreorder(form, items, COUNTRIES);
    if (!parsed.data) {
      revealErrors();
      return;
    }
    orderFormRef.current?.requestSubmit();
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const parsed = validatePreorder(form, items, COUNTRIES);
    if (!parsed.data) {
      revealErrors();
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(
        "https://aionringcloudservice-csbbbub5bxc0c9cw.canadacentral-01.azurewebsites.net/api/web-orders",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...parsed.data,
            referral_source: form.referral_source.trim() || referral || "Self",
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
    <div className="min-h-screen bg-canvas text-ink">
      <SEO title={"Pre-order aiOn - Reserve your Founder Edition Ring"} description={"Reserve your aiOn smart wellness ring. Free Vitality app included. Founder Edition limited to 2,000. Shipping starts mid-December 2026. A general wellness product, not a medical device."} path="/preorder" image="/og-preorder.jpg" />
      <Header />

      <main className="pt-32 pb-32">
        <div className="mx-auto max-w-[1360px] px-6">
          {confirmed ? (
            <ConfirmationCard name={confirmed.name} partner={confirmed.partner} />
          ) : (
            <>
              {partner && (
                <div className="mb-10 max-w-3xl mx-auto rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.05] to-white p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div
                      className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
                      style={{ background: GRADIENT }}
                    >
                      <Handshake className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[3px] text-primary mb-2">
                        Welcome
                      </div>
                      <h2 className="text-xl md:text-2xl font-light tracking-tight text-ink">
                        You've been invited by <span className="font-medium">{partner.name}</span> to reserve your aiOn
                        Ring.
                      </h2>
                      <p className="mt-2 text-[14px] text-ink-soft leading-relaxed">
                        {partner.name} is an official aiOn Partner helping customers gain early access to AI-powered
                        wellness technology. Complete your reservation below, we'll take care of everything else.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-1.5 mb-6 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[11px] font-semibold uppercase tracking-[3px] text-ink-muted">
                    Founder Edition · Limited to {FOUNDER_CAP}
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-4 text-ink">
                  Reserve your{" "}
                  <span style={{ backgroundImage: GRADIENT, WebkitBackgroundClip: "text", color: "transparent" }}>
                    aiOn Ring
                  </span>
                  .
                </h1>
                <p className="text-[16px] text-ink-soft max-w-xl mx-auto">
                  Be among the first {FOUNDER_CAP.toLocaleString()} to wear the future of everyday wellness. No payment today, your place is held. Shipping starts mid-December 2026.
                </p>
                <p className="text-[12px] text-ink-muted max-w-xl mx-auto mt-4">
                  aiOn Ring is intended for general wellness purposes only and is not a medical device.
                </p>

              </div>

              <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16 items-start">
                {/* Product preview */}
                <div className="min-w-0 lg:sticky lg:top-28">
                  <div
                    className="relative aspect-square rounded-3xl border border-border bg-gradient-to-b from-[#EEF3FA] to-white overflow-hidden shadow-sm touch-pan-y select-none"
                    onPointerDown={(e) => { swipeStart.current = e.clientX; }}
                    onPointerUp={(e) => {
                      if (swipeStart.current === null) return;
                      const dx = e.clientX - swipeStart.current;
                      swipeStart.current = null;
                      if (Math.abs(dx) > 40) stepPreview(dx < 0 ? 1 : -1);
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img
                        key={previewColor.id}
                        src={previewColor.image}
                        alt={`aiOn Ring, ${previewColor.name}`}
                        width={1024}
                        height={1024}
                        draggable={false}
                        className="w-4/5 h-4/5 object-contain drop-shadow-[0_30px_60px_rgba(10,22,40,0.25)] animate-in fade-in duration-500"
                      />
                    </div>
                    <button type="button" aria-label="Previous colour" onClick={() => stepPreview(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white/90 text-ink shadow-sm hover:bg-white">
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button type="button" aria-label="Next colour" onClick={() => stepPreview(1)} className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white/90 text-ink shadow-sm hover:bg-white">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute top-5 left-0 right-0 flex justify-center gap-2">
                      {RING_COLORS.map((c, i) => (
                        <button key={c.id} type="button" aria-label={`Show ${c.name}`} onClick={() => setPreviewIdx(i)} className={`h-2 rounded-full transition-all ${i === previewIdx ? "w-6 bg-primary" : "w-2 bg-ink-muted/40"}`} />
                      ))}
                    </div>
                    <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] uppercase tracking-[3px] text-ink-muted">Preview</div>
                        <div className="text-[15px] font-medium mt-1 text-ink">{previewColor.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] uppercase tracking-[3px] text-ink-muted">Total</div>
                        <div className="text-[15px] font-medium mt-1 text-ink">
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
                        className="rounded-xl border border-border bg-white px-3 py-3 text-center shadow-sm"
                      >
                        <Icon className="w-4 h-4 text-primary mx-auto mb-1.5" />
                        <div className="text-[11px] text-ink-soft leading-tight">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="min-w-0 space-y-10 rounded-3xl border border-border bg-white p-6 md:p-10 shadow-sm">
                    <section className="border-y border-border py-6" aria-label="Find your ring size">
                      <PhysicalRingSizer selectionLabel="Use this size for Ring 1" onSelect={(size) => {
                        setItems(previous => previous.map((item, index) => index === 0 ? { ...item, ring_size: size } : item));
                      }} />
                    </section>

                <form
                  ref={orderFormRef}
                  noValidate
                  onSubmit={onSubmit}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && event.target instanceof HTMLInputElement) {
                      event.preventDefault();
                      requestReservation();
                    }
                  }}
                  className="space-y-10"
                >
                  <Section title="Your rings">
                    {items.map((item, idx) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-border bg-canvas p-4 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-[12px] uppercase tracking-[2px] text-ink-muted">Ring {idx + 1}</div>
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-ink-muted hover:text-red-500 transition-colors inline-flex items-center gap-1 text-[12px]"
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
                                onClick={() => {
                                  updateItem(item.id, { ring_size: s });
                                  markTouched(`${item.id}.ring_size`);
                                }}
                                className={`h-11 rounded-lg border text-[14px] font-medium transition-all ${item.ring_size === s ? "border-primary bg-primary/10 text-ink" : "border-border bg-white text-ink-soft hover:border-primary/40"}`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                          {errors[`${item.id}.ring_size`] && touched[`${item.id}.ring_size`] && (
                            <p role="alert" className="mt-2 text-[12px] text-destructive">{errors[`${item.id}.ring_size`]}</p>
                          )}
                        </div>

                        <div>
                          <Label>Finish</Label>
                          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-2">
                            {RING_COLORS.map((c) => {
                              const selected = item.ring_color === c.id;
                              return (
                                <button
                                  key={c.id}
                                  type="button"
                                  aria-pressed={selected}
                                  onClick={() => updateItem(item.id, { ring_color: c.id })}
                                  className={`relative flex flex-col items-center rounded-xl border p-2 sm:p-3 transition-all ${selected ? "border-primary ring-2 ring-primary/30 bg-primary/5" : "border-border bg-white hover:border-primary/40"}`}
                                >
                                  {selected && (
                                    <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                      <Check className="h-3 w-3" />
                                    </span>
                                  )}
                                  <img src={c.image} alt={`aiOn Ring, ${c.name}`} loading="lazy" className="h-16 w-16 sm:h-20 sm:w-20 object-contain" />
                                  <span className="mt-1.5 flex items-center gap-1.5 text-[12px] sm:text-[13px] text-ink text-center leading-tight">
                                    <span className="hidden sm:inline-block w-3 h-3 shrink-0 rounded-full border border-border" style={{ background: c.swatch }} />
                                    {c.name}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                          {errors[`${item.id}.ring_color`] && touched[`${item.id}.ring_color`] && <p role="alert" className="mt-2 text-[12px] text-destructive">{errors[`${item.id}.ring_color`]}</p>}
                        </div>

                        <div>
                          <Label>Quantity</Label>
                          <div className="mt-2 inline-flex items-center rounded-full border border-border bg-white p-1">
                            <button
                              type="button"
                              onClick={() => updateItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                              className="w-10 h-10 rounded-full hover:bg-canvas text-ink flex items-center justify-center"
                              aria-label="Decrease"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center text-[16px] font-medium text-ink">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateItem(item.id, { quantity: Math.min(100, item.quantity + 1) })}
                              className="w-10 h-10 rounded-full hover:bg-canvas text-ink flex items-center justify-center"
                              aria-label="Increase"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          {errors[`${item.id}.quantity`] && touched[`${item.id}.quantity`] && <p role="alert" className="mt-2 text-[12px] text-destructive">{errors[`${item.id}.quantity`]}</p>}
                        </div>
                      </div>
                    ))}

                    {items.length < 10 && (
                      <button
                        type="button"
                        onClick={addItem}
                        className="w-full h-12 rounded-xl border border-dashed border-border text-[14px] text-ink-soft hover:border-primary/50 hover:text-ink transition-all inline-flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Add another ring
                      </button>
                    )}
                  </Section>

                  <Section title="Your details">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="First name"
                        placeholder="Jane"
                        value={form.first_name}
                        onChange={(v) => update("first_name", v)}
                        onBlur={() => markTouched("first_name")}
                        error={touched.first_name ? errors.first_name : undefined}
                        required
                      />
                      <Input
                        label="Last name"
                        placeholder="Doe"
                        value={form.last_name}
                        onChange={(v) => update("last_name", v)}
                        onBlur={() => markTouched("last_name")}
                        error={touched.last_name ? errors.last_name : undefined}
                        required
                      />
                    </div>
                    <Input
                      label="Email"
                      type="email"
                      placeholder="jane@example.com"
                      value={form.email}
                      onChange={(v) => update("email", v)}
                      onBlur={() => markTouched("email")}
                      error={touched.email ? errors.email : undefined}
                      required
                    />
                    <PhoneInput
                      label="Phone"
                      code={form.phone_code}
                      iso={form.phone_iso}
                      value={form.phone}
                      onCodeChange={(code, iso) => {
                        setForm((p) => ({ ...p, phone_code: code, phone_iso: iso }));
                        markTouched("phone");
                      }}
                      onChange={(v) => update("phone", v)}
                      onBlur={() => markTouched("phone")}
                      error={touched.phone ? errors.phone : undefined}
                      placeholder="(555) 123-4567"
                    />

                    <div>
                      <Input
                        label="Who referred you?"
                        placeholder='Name, partner or code, enter "Self" if none'
                        value={form.referral_source}
                        onChange={(v) => update("referral_source", v)}
                        onBlur={() => markTouched("referral_source")}
                        error={touched.referral_source ? errors.referral_source : undefined}
                        required
                      />
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-[12px] text-ink-muted">Quick select:</span>
                        {["Self", "Friend / Family", "Social media", "Healthcare professional"].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              update("referral_source", opt);
                              markTouched("referral_source");
                            }}
                            className={`px-3 h-8 rounded-full border text-[12px] transition-all ${
                              form.referral_source === opt
                                ? "border-primary bg-primary/10 text-ink"
                                : "border-border bg-white text-ink-soft hover:border-primary/40"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </Section>


                  <Section title="Shipping address">
                    <CountryInput
                      label="Country"
                      placeholder="Select your country"
                      value={form.country}
                      onChange={(v) => update("country", v)}
                      onBlur={() => markTouched("country")}
                      error={touched.country ? errors.country : undefined}
                      required
                    />
                    <Input
                      label="Address"
                      placeholder={shippingRules.iso === "US" ? "123 Main Street, Apt 4" : "Street address, building, apartment"}
                      autoComplete="shipping street-address"
                      value={form.address}
                      onChange={(v) => update("address", v)}
                      onBlur={() => markTouched("address")}
                      error={touched.address ? errors.address : undefined}
                      required
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label={shippingRules.cityRequired ? "City" : "City (optional)"}
                        placeholder={shippingRules.iso === "US" ? "New York" : "City / town / locality"}
                        autoComplete="shipping address-level2"
                        value={form.city}
                        onChange={(v) => update("city", v)}
                        onBlur={() => markTouched("city")}
                        error={touched.city ? errors.city : undefined}
                        required={shippingRules.cityRequired}
                      />
                      <Input
                        label={`${shippingRules.regionLabel}${shippingRules.regionRequired ? "" : " (optional)"}`}
                        placeholder={shippingRules.iso === "US" ? "NY" : shippingRules.regionLabel}
                        autoComplete="shipping address-level1"
                        suggestions={shippingRules.regions}
                        value={form.state}
                        onChange={(v) => update("state", v)}
                        onBlur={() => markTouched("state")}
                        error={touched.state ? errors.state : undefined}
                        required={shippingRules.regionRequired}
                      />
                    </div>
                    {shippingRules.postalUsed && (
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label={`${shippingRules.postalLabel}${shippingRules.postalRequired ? "" : " (optional)"}`}
                          placeholder={shippingRules.iso === "US" ? "10001" : shippingRules.postalExample}
                          autoComplete="shipping postal-code"
                          value={form.zip_code}
                          onChange={(v) => update("zip_code", v)}
                          onBlur={() => markTouched("zip_code")}
                          error={touched.zip_code ? errors.zip_code : undefined}
                          required={shippingRules.postalRequired}
                        />
                      </div>
                    )}
                  </Section>

                  {error && (
                    <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-[13px] text-red-600">
                      {error}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={requestReservation}
                    disabled={submitting}
                    className={`w-full h-14 rounded-full font-semibold text-white text-[15px] transition-all inline-flex items-center justify-center gap-2 ${
                      canSubmit ? "cursor-pointer hover:brightness-110 hover:scale-[1.01]" : "opacity-60 cursor-not-allowed"
                    } disabled:cursor-not-allowed`}
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

                  <p className="text-center text-[12px] text-ink-muted">
                    No charge today. We'll email you before we ship. By reserving, you agree to our{" "}
                    <Link to="/terms-of-service" className="underline hover:text-ink">
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy-policy" className="underline hover:text-ink">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </form>
                </div>
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
      <h2 className="text-[11px] font-semibold uppercase tracking-[3px] text-primary">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-[13px] text-ink-soft">{children}</label>;
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  onBlur,
  error,
  autoComplete,
  suggestions,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  onBlur?: () => void;
  error?: string;
  autoComplete?: string;
  suggestions?: string[];
}) {
  return (
    <label className="block">
      <span className="text-[13px] text-ink-soft">{label}</span>
      <input
        type={type}
        autoComplete={autoComplete}
        list={suggestions?.length ? `shipping-${autoComplete}` : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        required={required}
        aria-invalid={!!error}
        placeholder={placeholder}
        maxLength={200}
        className={`mt-1.5 w-full h-12 rounded-xl border bg-white px-4 text-[15px] text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
          error ? "border-red-400 focus:border-red-500" : "border-border focus:border-primary"
        }`}
      />
      {suggestions && suggestions.length > 0 && (
        <datalist id={`shipping-${autoComplete}`}>
          {suggestions.map(option => <option key={option} value={option} />)}
        </datalist>
      )}
      {error && <p role="alert" className="mt-1 text-[12px] text-destructive">{error}</p>}
    </label>
  );
}

function PhoneInput({
  label,
  code,
  iso,
  value,
  onCodeChange,
  onChange,
  onBlur,
  error,
  placeholder,
}: {
  label: string;
  code: string;
  iso?: string;
  value: string;
  onCodeChange: (code: string, iso: string) => void;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
}) {
  // Value stored on the select is `${iso}|${code}` so duplicate dial codes (e.g. +1 US/CA) stay distinct.
  const selectValue = useMemo(() => {
    if (iso) {
      const exact = PHONE_CODE_OPTIONS.find((o) => o.iso === iso && o.code === code);
      if (exact) return `${exact.iso}|${exact.code}`;
    }
    const match = PHONE_CODE_OPTIONS.find((o) => o.code === code);
    return match ? `${match.iso}|${match.code}` : `US|1`;
  }, [code, iso]);

  return (
    <label className="block">
      <span className="text-[13px] text-ink-soft">{label}</span>
      <div
        className={`mt-1.5 flex items-stretch rounded-xl border bg-white overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/30 ${
          error ? "border-red-400" : "border-border focus-within:border-primary"
        }`}
      >
        <div className="relative flex items-center">
          <select
            value={selectValue}
            onChange={(e) => {
              const [nextIso, nextCode] = e.target.value.split("|");
              onCodeChange(nextCode, nextIso);
            }}
            aria-label="Country dial code"
            onBlur={onBlur}
            className="h-12 bg-transparent text-[14px] text-ink pl-3 pr-8 border-r border-border focus:outline-none appearance-none cursor-pointer"
            style={{ backgroundImage: "none" }}
          >
            {PHONE_CODE_OPTIONS.map((o) => (
              <option key={`${o.iso}-${o.code}`} value={`${o.iso}|${o.code}`} className="bg-white text-ink">
                {o.iso} +{o.code}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 w-4 h-4 text-ink-muted pointer-events-none" />
        </div>
        <input
          type="tel"
          aria-invalid={!!error}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          maxLength={30}
          className="flex-1 h-12 bg-transparent px-3 text-[15px] text-ink placeholder-ink-muted focus:outline-none"
        />
      </div>
      {error && <p role="alert" className="mt-1 text-[12px] text-destructive">{error}</p>}
    </label>
  );
}

// Searchable country dropdown; only recognised countries pass submission validation.
function CountryInput({
  label,
  value,
  onChange,
  required,
  placeholder,
  onBlur,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  onBlur?: () => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => c.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block">
        <span className="text-[13px] text-ink-soft">{label}</span>
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setQuery(e.target.value);
              setActiveIndex(0);
              setOpen(true);
            }}
            onFocus={() => { setQuery(""); setActiveIndex(0); setOpen(true); }}
            role="combobox"
            aria-expanded={open}
            aria-controls="shipping-country-options"
            aria-autocomplete="list"
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
              if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                setOpen(true);
                setActiveIndex(index => Math.max(0, Math.min(filtered.length - 1, index + (e.key === "ArrowDown" ? 1 : -1))));
              }
              if (e.key === "Enter" && open && filtered[activeIndex]) {
                e.preventDefault();
                onChange(filtered[activeIndex]);
                setOpen(false);
              }
              if (e.key === "Tab") setOpen(false);
            }}
            onBlur={onBlur}
            required={required}
            aria-invalid={!!error}
            placeholder={placeholder}
            maxLength={200}
            autoComplete="off"
            className={`mt-1.5 w-full h-12 rounded-xl border bg-white pl-4 pr-10 text-[15px] text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
              error ? "border-red-400 focus:border-red-500" : "border-border focus:border-primary"
            }`}
          />
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" />
        </div>
      </label>
      {error && <p role="alert" className="mt-1 text-[12px] text-destructive">{error}</p>}
      {open && filtered.length > 0 && (
        <div id="shipping-country-options" role="listbox" className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-xl border border-border bg-white shadow-lg">
          {filtered.map((c) => (
            <button
              key={c}
              role="option"
              aria-selected={c === value}
              type="button"
              onClick={() => {
                onChange(c);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-[14px] text-ink-soft hover:bg-canvas hover:text-ink transition-colors"
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ConfirmationCard({ name, partner }: { name: string; partner?: string | null }) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div
        className="w-20 h-20 mx-auto mb-8 rounded-full flex items-center justify-center"
        style={{ background: GRADIENT }}
      >
        <Check className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4 text-ink">Thank you, {name}.</h1>
      <p className="text-[16px] text-ink-soft mb-10 max-w-lg mx-auto">
        Your aiOn Ring reservation has been received. A confirmation email is on its way.
      </p>
      {partner && (
        <div className="inline-block rounded-2xl border border-primary/20 bg-primary/[0.06] px-6 py-4 mb-6">
          <div className="text-[11px] uppercase tracking-[3px] text-primary mb-1">Referred by</div>
          <div className="text-[16px] font-medium text-ink">{partner}</div>
        </div>
      )}
      <p className="text-[13px] text-ink-soft mb-8 max-w-md mx-auto">
        We'll contact you soon regarding pricing, availability and delivery.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/"
          className="rounded-full border border-border bg-white px-8 py-3 text-[14px] font-medium text-ink hover:border-primary/40 transition-colors shadow-sm"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

