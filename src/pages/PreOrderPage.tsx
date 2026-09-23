import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUp, Camera, Check, ChevronDown, ChevronLeft, ChevronRight, Clock, Fingerprint, Loader2, Minus, Plus, ShieldCheck, Smartphone, Sparkles, Truck, Handshake, Trash2, X } from "lucide-react";
import { Header } from "@/components/Header";
import { SEO } from '@/components/SEO';
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import ringMidnight from "@/assets/ring-finish-midnight.png";
import ringSilver from "@/assets/ring-finish-silver.png";
import ringRose from "@/assets/ring-finish-rose.png";
import { DIAL_CODES, PHONE_CODE_OPTIONS, COUNTRY_ISO2 } from "@/lib/dial-codes";
import { RingSizer } from "@/components/RingSizer";
import handCardSample from "@/assets/hand-card-sample-palm.jpg";

const GRADIENT = "linear-gradient(135deg,#00A9E0,#1878E0,#6D28D9)";
const FOUNDER_CAP = 2000;

const RING_SIZES = ["6", "7", "8", "9", "10", "11", "12", "13"];
const RING_COLORS = [
  { id: "midnight", name: "Midnight Black", image: ringMidnight, swatch: "linear-gradient(135deg,#2A2F38,#0B0F16)" },
  { id: "silver", name: "Titanium Silver", image: ringSilver, swatch: "linear-gradient(135deg,#EDEFF2,#9AA3AD)" },
  { id: "rose", name: "Rose Gold", image: ringRose, swatch: "linear-gradient(135deg,#F3C4AE,#C98D6E)" },
];

// US ring size → inner diameter (mm) reference
const SIZE_CHART: Array<{ size: string; diameter: string; circumference: string }> = [
  { size: "6", diameter: "16.5 mm", circumference: "51.8 mm" },
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

  const [form, setForm] = useState<FormState>(() => ({ ...INITIAL, referral_source: referral ?? "" }));
  const [items, setItems] = useState<RingItem[]>([newItem()]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [sizingOpen, setSizingOpen] = useState(false);
  const [photoSizerOpen, setPhotoSizerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{ name: string; partner?: string | null } | null>(null);
  const [totals, setTotals] = useState<{ reservations: number; rings: number }>({ reservations: 0, rings: 0 });
  const [partner, setPartner] = useState<{ code: string; name: string } | null>(null);

  useEffect(() => {
    document.title = "Pre-Order aiOn Ring - Founder Edition";
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
        if (data) {
          setPartner({ code: data.code, name: data.name });
          setForm((p) => (p.referral_source.trim() ? p : { ...p, referral_source: data.name }));
        }
      });

  }, [partnerCode]);

  const founderClaimed = totals.rings;
  const founderLeft = Math.max(0, FOUNDER_CAP - founderClaimed);
  const founderPct = Math.min(100, (founderClaimed / FOUNDER_CAP) * 100);
  const selectedColorIdx = Math.max(0, RING_COLORS.findIndex((c) => c.id === items[0]?.ring_color));
  const [previewIdx, setPreviewIdx] = useState(selectedColorIdx);
  useEffect(() => setPreviewIdx(selectedColorIdx), [selectedColorIdx]);
  const previewColor = RING_COLORS[previewIdx] ?? RING_COLORS[0];
  const swipeStart = useRef<number | null>(null);
  const stepPreview = (d: number) => setPreviewIdx((i) => (i + d + RING_COLORS.length) % RING_COLORS.length);
  const totalRings = items.reduce((s, i) => s + (i.quantity || 0), 0);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((p) => ({ ...p, [k]: v }));
  const markTouched = (k: string) => setTouched((p) => ({ ...p, [k]: true }));
  const updateItem = (id: string, patch: Partial<RingItem>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const addItem = () => setItems((prev) => (prev.length >= 10 ? prev : [...prev, newItem()]));
  const removeItem = (id: string) => setItems((prev) => (prev.length <= 1 ? prev : prev.filter((it) => it.id !== id)));

  // Field-level errors, always computed; only shown once touched or on submit attempt.
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
  if (!form.referral_source.trim()) errors.referral_source = "Required, enter \"Self\" if no referral";

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
      <SEO title={"Pre-order aiOn - Reserve your Founder Edition Ring"} description={"Reserve your aiOn smart wellness ring. Free Vitality app included. Founder Edition limited to 2,000. Ships Q3 2026. A general wellness product, not a medical device."} path="/preorder" image="/og-preorder.jpg" />
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
                  Be among the first {FOUNDER_CAP.toLocaleString()} to wear the future of everyday wellness. No payment today, your place is held.
                </p>
                <p className="text-[12px] text-ink-muted max-w-xl mx-auto mt-4">
                  aiOn Ring is intended for general wellness purposes only and is not a medical device.
                </p>

                {/* Founder counter */}
                <div className="mt-10 max-w-md mx-auto">
                  <div className="flex items-baseline justify-between text-[13px] mb-2">
                    <span className="text-ink-soft">Founder Edition claimed</span>
                    <span className="font-medium text-ink">
                      {founderClaimed} / {FOUNDER_CAP}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full transition-all duration-700"
                      style={{ width: `${founderPct}%`, background: GRADIENT }}
                    />
                  </div>
                  <p className="mt-3 text-[12px] text-ink-muted">Only {founderLeft} founder rings remain.</p>
                </div>
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

                {/* Form */}
                <form onSubmit={onSubmit} className="min-w-0 space-y-10 rounded-3xl border border-border bg-white p-6 md:p-10 shadow-sm">
                  <Section title="Your rings">
                    <div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/[0.06] to-white p-5 md:p-6 shadow-sm">
                      <div className="text-[18px] md:text-[20px] font-medium text-ink mb-1.5">
                        Not sure of your ring size?
                      </div>
                      <p className="text-[14px] text-ink-soft leading-relaxed">
                        Find your size in the way that suits you best, most people start with a quick photo.
                      </p>

                      {/* Option 1, Photo size estimation (primary) */}
                      <div className="mt-4 rounded-xl border-2 border-primary bg-white p-4 md:p-5 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <img
                            src={handCardSample}
                            alt="Example photo: open palm with a bank card resting flat in its center"
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-border shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[11px] font-semibold uppercase tracking-[2px] text-primary">
                              Recommended
                            </span>
                            <div className="mt-1 text-[16px] md:text-[17px] font-medium text-ink">
                              Try photo size estimation
                            </div>
                            <p className="mt-1 text-[13px] text-ink-soft leading-relaxed">
                              A quick photo of your palm with a bank card, we'll match your US size in seconds.
                            </p>
                            <p className="mt-1.5 text-[12px] text-ink-muted leading-relaxed flex items-center gap-1.5">
                              <Smartphone className="w-3.5 h-3.5 shrink-0 text-primary" />
                              Designed for your phone, the camera opens full screen so you can line up your hand and card easily. On a computer, use one of the other sizing options below.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPhotoSizerOpen((v) => !v)}
                            className="shrink-0 h-12 px-6 rounded-full font-semibold text-white text-[14px] inline-flex items-center justify-center gap-2 transition-all hover:brightness-110 hover:scale-[1.02]"
                            style={{ background: GRADIENT }}
                          >
                            <Camera className="w-4 h-4" />
                            {photoSizerOpen ? "Hide photo estimation" : "Try photo size estimation"}
                          </button>
                        </div>
                        {photoSizerOpen && (
                          <div className="mt-4">
                            <RingSizer />
                          </div>
                        )}
                      </div>

                      {/* Other sizing options, one simple combined action */}
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => setSizingOpen(true)}
                          className="w-full flex items-center gap-3 rounded-xl border border-border bg-white p-3.5 text-left transition-colors hover:border-primary/40"
                        >
                          <span className="w-11 h-11 rounded-full bg-canvas border border-border flex items-center justify-center shrink-0">
                            <RingMethodIcon />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[13px] font-medium text-ink leading-snug">
                              Measure with a ring or a strip of paper
                            </span>
                            <span className="block text-[12px] text-ink-muted leading-snug">
                              Two quick ways to find your size at home
                            </span>
                          </span>
                        </button>
                      </div>

                      <p className="mt-3 text-[12px] text-ink-muted flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 shrink-0" />
                        A free sizing kit ships before your ring, adjust your size anytime.
                      </p>
                    </div>


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
                                  markTouched("ring_size");
                                }}
                                className={`h-11 rounded-lg border text-[14px] font-medium transition-all ${item.ring_size === s ? "border-primary bg-primary/10 text-ink" : "border-border bg-white text-ink-soft hover:border-primary/40"}`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                          {!item.ring_size && touched.ring_size && (
                            <p className="mt-2 text-[12px] text-red-500">Please select a ring size</p>
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
                      onCodeChange={(code, iso) => setForm((p) => ({ ...p, phone_code: code, phone_iso: iso }))}
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
                    <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-[13px] text-red-600">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
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
      <span className="text-[13px] text-ink-soft">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        required={required}
        placeholder={placeholder}
        maxLength={200}
        className={`mt-1.5 w-full h-12 rounded-xl border bg-white px-4 text-[15px] text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
          error ? "border-red-400 focus:border-red-500" : "border-border focus:border-primary"
        }`}
      />
      {error && <p className="mt-1 text-[12px] text-red-500">{error}</p>}
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          maxLength={30}
          className="flex-1 h-12 bg-transparent px-3 text-[15px] text-ink placeholder-ink-muted focus:outline-none"
        />
      </div>
      {error && <p className="mt-1 text-[12px] text-red-500">{error}</p>}
    </label>
  );
}

// Searchable country dropdown, typing filters the list below the field; clicking a
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
        <span className="text-[13px] text-ink-soft">{label}</span>
        <div className="relative">
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
            className={`mt-1.5 w-full h-12 rounded-xl border bg-white pl-4 pr-10 text-[15px] text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
              error ? "border-red-400 focus:border-red-500" : "border-border focus:border-primary"
            }`}
          />
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" />
        </div>
      </label>
      {error && <p className="mt-1 text-[12px] text-red-500">{error}</p>}
      {open && filtered.length > 0 && (
        <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-xl border border-border bg-white shadow-lg">
          {filtered.map((c) => (
            <button
              key={c}
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

function RingMethodIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="14" r="6.5" />
      <path d="M12 7.5 9.5 4.5h5L12 7.5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function StringMethodIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="8.5" y="3" width="7" height="18" rx="3.5" />
      <path d="M5.5 10.5c2.5 1.8 10.5 1.8 13 0" />
</svg>
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/35 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl border border-border bg-white p-8 max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full border border-border text-ink-muted hover:border-primary/40 hover:text-ink flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-[11px] uppercase tracking-[3px] text-primary mb-2">Sizing Guide</div>
        <h3 className="text-2xl font-light tracking-tight mb-4 text-ink">Find your perfect fit.</h3>

        {/* Measure at home, both ways in one card */}
        <div className="rounded-xl border border-border bg-white p-4 mb-5">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-full bg-canvas border border-border flex items-center justify-center shrink-0">
              <RingMethodIcon />
            </span>
            <div className="min-w-0">
              <div className="text-[13px] font-medium text-ink">Use a ring you already wear</div>
              <p className="mt-1 text-[12px] text-ink-muted leading-relaxed">
                Pick a ring that fits the same finger, measure straight across its inside edge in mm, then find the
                closest "Inner Diameter" in the chart below.
              </p>
            </div>
          </div>
          <div className="my-3 border-t border-border" />
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-full bg-canvas border border-border flex items-center justify-center shrink-0">
              <StringMethodIcon />
            </span>
            <div className="min-w-0">
              <div className="text-[13px] font-medium text-ink">Or wrap a strip of paper</div>
              <p className="mt-1 text-[12px] text-ink-muted leading-relaxed">
                Wrap it snugly around the base of your finger, mark where it overlaps, lay it flat and measure its
                length in mm, then find the closest "Circumference" in the chart below.
              </p>
            </div>
          </div>
        </div>

        {/* Quick tips, one line each with an icon */}
        <div className="space-y-2 mb-2">
          {[
            { icon: Clock, text: "Measure at the end of the day, when fingers are warmest." },
            { icon: Fingerprint, text: "Wear it snug, the sensors need skin contact." },
            { icon: ArrowUp, text: "When in doubt, size up." },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5 text-[13px] text-ink-soft">
              <Icon className="w-4 h-4 text-primary shrink-0" />
              <span>{text}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-canvas text-ink-muted text-[11px] uppercase tracking-[2px]">
                <th className="text-left px-4 py-2 font-medium">US Size</th>
                <th className="text-left px-4 py-2 font-medium">Inner Diameter</th>
                <th className="text-left px-4 py-2 font-medium">Circumference</th>
              </tr>
            </thead>
            <tbody>
              {SIZE_CHART.map((row) => (
                <tr key={row.size} className="border-t border-border">
                  <td className="px-4 py-2 font-medium text-ink">{row.size}</td>
                  <td className="px-4 py-2 text-ink-soft">{row.diameter}</td>
                  <td className="px-4 py-2 text-ink-soft">{row.circumference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-[12px] text-ink-muted">
          Still unsure? Order any size, we'll ship a free sizing kit before your ring, and you can update your final
          size before dispatch.
        </p>
      </div>
    </div>
  );
}
