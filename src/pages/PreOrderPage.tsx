import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, Loader2, Minus, Plus, ShieldCheck, Sparkles, Truck, Handshake, Ruler, Trash2, X } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import ringProduct from "@/assets/ring-product.jpg";
import { DIAL_CODES, PHONE_CODE_OPTIONS, COUNTRY_ISO2 } from "@/lib/dial-codes";

const GRADIENT = "linear-gradient(135deg,#00C6FF,#4FB3FF,#7C3AED)";
const FOUNDER_CAP = 2000;

const RING_SIZES = ["7", "8", "9", "10", "11", "12", "13"];
const RING_COLORS = [
  { id: "midnight", name: "Midnight Black", filter: "brightness(0.75) contrast(1.15) hue-rotate(200deg)" },
  { id: "silver", name: "Titanium Silver", filter: "grayscale(1) brightness(1.1)" },
  { id: "rose", name: "Rose Gold", filter: "sepia(0.5) hue-rotate(-15deg) saturate(1.2) brightness(1.05)" },
];

// US ring size → inner diameter (mm) reference
const SIZE_CHART: Array<{ size: string; diameter: string; circumference: string }> = [
  { size: "7", diameter: "17.3 mm", circumference: "54.4 mm" },
  { size: "8", diameter: "18.1 mm", circumference: "57.0 mm" },
  { size: "9", diameter: "19.0 mm", circumference: "59.5 mm" },
  { size: "10", diameter: "19.8 mm", circumference: "62.1 mm" },
  { size: "11", diameter: "20.6 mm", circumference: "64.6 mm" },
  { size: "12", diameter: "21.4 mm", circumference: "67.2 mm" },
  { size: "13", diameter: "22.2 mm", circumference: "69.7 mm" },
];

// Standard list of country names for the searchable Country field below.
const COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo (Congo-Brazzaville)",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czechia (Czech Republic)",
  "Democratic Republic of the Congo",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  'Eswatini (fmr. "Swaziland")',
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Holy See",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar (formerly Burma)",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine State",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
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
};

type FieldKey = keyof FormState | "ring_size";

function normalizePhoneForSubmission(code: string, phone: string) {
  const dialCode = code.replace(/\D+/g, "");
  let digits = phone.replace(/\D+/g, "");

  if (!digits || !dialCode) return "";

  const raw = phone.trim();
  if (raw.startsWith("+")) return `+${digits}`;
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;

  // If the customer typed the selected country code in the phone field too,
  // avoid submitting it twice. Example: US +1 + "1 555 123 4567".
  if (digits.startsWith(dialCode) && digits.length + dialCode.length > 15) {
    digits = digits.slice(dialCode.length);
  }

  // North American numbers are commonly typed as 1 + 10 digits.
  if (dialCode === "1" && digits.length === 11 && digits.startsWith("1")) {
    digits = digits.slice(1);
  }

  return `+${dialCode}${digits}`;
}

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}
function isPhoneNumberValid(code: string, phone: string) {
  const normalizedDigits = normalizePhoneForSubmission(code, phone).replace(/\D+/g, "");
  return normalizedDigits.length >= 7 && normalizedDigits.length <= 15;
}

export default function PreOrderPage() {
  const [params] = useSearchParams();
  const referral = params.get("ref") || undefined;
  const partnerCode = (params.get("partner") || "").trim().toLowerCase() || undefined;

  const [form, setForm] = useState<FormState>(INITIAL);
  const [items, setItems] = useState<RingItem[]>([newItem()]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
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
  const markTouched = (k: string) => setTouched((p) => ({ ...p, [k]: true }));
  const updateItem = (id: string, patch: Partial<RingItem>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const addItem = () => setItems((prev) => (prev.length >= 10 ? prev : [...prev, newItem()]));
  const removeItem = (id: string) => setItems((prev) => (prev.length <= 1 ? prev : prev.filter((it) => it.id !== id)));

  // Field-level errors — always computed; only shown once touched or on submit attempt.
  const errors: Partial<Record<FieldKey, string>> = {};
  if (!form.first_name.trim()) errors.first_name = "First name is required";
  if (!form.last_name.trim()) errors.last_name = "Last name is required";
  if (!isEmail(form.email)) errors.email = "Enter a valid email address";
  if (!isPhoneNumberValid(form.phone_code, form.phone)) errors.phone = "Enter a valid phone number";
  if (!form.address.trim()) errors.address = "Address is required";
  if (!form.city.trim()) errors.city = "City is required";
  if (!form.state.trim()) errors.state = "State / region is required";
  if (!form.zip_code.trim()) errors.zip_code = "ZIP / postal code is required";
  if (!form.country.trim()) errors.country = "Country is required";
  const ringSizeMissing = items.some((i) => !i.ring_size);
  if (ringSizeMissing) errors.ring_size = "Please select a ring size";
  const canSubmit = Object.keys(errors).length === 0;

  // Keep phone_code + iso in sync with country selection
  useEffect(() => {
    const code = DIAL_CODES[form.country];
    const iso = (COUNTRY_ISO2 as Record<string, string>)[form.country];
    if (code && iso && (code !== form.phone_code || iso !== form.phone_iso)) {
      setForm((p) => ({ ...p, phone_code: code, phone_iso: iso }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.country]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!canSubmit) {
      // Reveal all errors
      const all: Record<string, boolean> = { ring_size: true };
      (Object.keys(form) as Array<keyof FormState>).forEach((k) => (all[k] = true));
      setTouched(all);
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
            ...form,
            phone: normalizePhoneForSubmission(form.phone_code, form.phone),
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
                  Be among the first {FOUNDER_CAP.toLocaleString()} to wear the future of health awareness. No payment today — your place is held.
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
                                onClick={() => {
                                  updateItem(item.id, { ring_size: s });
                                  markTouched("ring_size");
                                }}
                                className={`h-11 rounded-lg border text-[14px] font-medium transition-all ${item.ring_size === s ? "border-[#4FB3FF] bg-[#4FB3FF]/10 text-white" : "border-white/10 bg-white/[0.02] text-[#B8C5D3] hover:border-white/20"}`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                          {!item.ring_size && touched.ring_size && (
                            <p className="mt-2 text-[12px] text-red-400">Please select a ring size</p>
                          )}
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
                      value={form.phone}
                      onCodeChange={(v) => update("phone_code", v)}
                      onChange={(v) => update("phone", v)}
                      onBlur={() => markTouched("phone")}
                      error={touched.phone ? errors.phone : undefined}
                      placeholder="(555) 123-4567"
                    />
                  </Section>

                  <Section title="Shipping address">
                    <Input
                      label="Address"
                      placeholder="123 Main Street, Apt 4"
                      value={form.address}
                      onChange={(v) => update("address", v)}
                      onBlur={() => markTouched("address")}
                      error={touched.address ? errors.address : undefined}
                      required
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="City"
                        placeholder="New York"
                        value={form.city}
                        onChange={(v) => update("city", v)}
                        onBlur={() => markTouched("city")}
                        error={touched.city ? errors.city : undefined}
                        required
                      />
                      <Input
                        label="State / Region"
                        placeholder="NY"
                        value={form.state}
                        onChange={(v) => update("state", v)}
                        onBlur={() => markTouched("state")}
                        error={touched.state ? errors.state : undefined}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="ZIP / Postal code"
                        placeholder="10001"
                        value={form.zip_code}
                        onChange={(v) => update("zip_code", v)}
                        onBlur={() => markTouched("zip_code")}
                        error={touched.zip_code ? errors.zip_code : undefined}
                        required
                      />
                      <CountryInput
                        label="Country"
                        placeholder="Select your country"
                        value={form.country}
                        onChange={(v) => update("country", v)}
                        onBlur={() => markTouched("country")}
                        error={touched.country ? errors.country : undefined}
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
                    disabled={submitting}
                    className={`w-full h-14 rounded-full font-semibold text-white text-[15px] transition-all inline-flex items-center justify-center gap-2 ${
                      canSubmit ? "hover:brightness-110 hover:scale-[1.01]" : "opacity-60"
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
  placeholder,
  onBlur,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  onBlur?: () => void;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="text-[13px] text-[#B8C5D3]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        required={required}
        placeholder={placeholder}
        maxLength={200}
        className={`mt-1.5 w-full h-12 rounded-xl border bg-white/[0.02] px-4 text-[15px] text-white placeholder-[#5A6B7E] focus:bg-white/[0.04] focus:outline-none transition-all ${
          error ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-[#4FB3FF]"
        }`}
      />
      {error && <p className="mt-1 text-[12px] text-red-400">{error}</p>}
    </label>
  );
}

function PhoneInput({
  label,
  code,
  value,
  onCodeChange,
  onChange,
  onBlur,
  error,
  placeholder,
}: {
  label: string;
  code: string;
  value: string;
  onCodeChange: (v: string) => void;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
}) {
  // Value stored on the select is `${iso}|${code}` so duplicate dial codes (e.g. +1 US/CA) stay distinct.
  const selectValue = useMemo(() => {
    const match = PHONE_CODE_OPTIONS.find((o) => o.code === code);
    return match ? `${match.iso}|${match.code}` : `US|1`;
  }, [code]);

  return (
    <label className="block">
      <span className="text-[13px] text-[#B8C5D3]">{label}</span>
      <div
        className={`mt-1.5 flex items-stretch rounded-xl border bg-white/[0.02] overflow-hidden transition-all ${
          error ? "border-red-500/60" : "border-white/10 focus-within:border-[#4FB3FF]"
        }`}
      >
        <select
          value={selectValue}
          onChange={(e) => {
            const [, c] = e.target.value.split("|");
            onCodeChange(c);
          }}
          aria-label="Country dial code"
          className="h-12 bg-transparent text-[14px] text-white pl-3 pr-2 border-r border-white/10 focus:outline-none appearance-none cursor-pointer"
          style={{ backgroundImage: "none" }}
        >
          {PHONE_CODE_OPTIONS.map((o) => (
            <option key={`${o.iso}-${o.code}`} value={`${o.iso}|${o.code}`} className="bg-[#0F1E33]">
              {o.iso} +{o.code}
            </option>
          ))}
        </select>
        <input
          type="tel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          maxLength={30}
          className="flex-1 h-12 bg-transparent px-3 text-[15px] text-white placeholder-[#5A6B7E] focus:outline-none"
        />
      </div>
      {error && <p className="mt-1 text-[12px] text-red-400">{error}</p>}
    </label>
  );
}

// Searchable country dropdown — typing filters the list below the field; clicking a
// suggestion fills it in. Still a plain text field underneath, so it submits/validates
// exactly like the old Input did (a plain string), and free text still works if the
// user types something not on the list.
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
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => c.toLowerCase().includes(q));
  }, [value]);

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
        <span className="text-[13px] text-[#B8C5D3]">{label}</span>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={onBlur}
          required={required}
          placeholder={placeholder}
          maxLength={200}
          autoComplete="off"
          className={`mt-1.5 w-full h-12 rounded-xl border bg-white/[0.02] px-4 text-[15px] text-white placeholder-[#5A6B7E] focus:bg-white/[0.04] focus:outline-none transition-all ${
            error ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-[#4FB3FF]"
          }`}
        />
      </label>
      {error && <p className="mt-1 text-[12px] text-red-400">{error}</p>}
      {open && filtered.length > 0 && (
        <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-[#0F1E33] shadow-lg">
          {filtered.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                onChange(c);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-[14px] text-[#B8C5D3] hover:bg-white/[0.06] hover:text-white transition-colors"
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
