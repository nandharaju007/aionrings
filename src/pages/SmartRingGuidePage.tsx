import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

const SITE = "https://www.aionrings.com";

const TOPICS: { id: string; h: string; body: string[] }[] = [
  {
    id: "sleep",
    h: "Sleep tracking with a smart ring",
    body: [
      "A ring sits on the finger, where blood-flow signals are strong and movement artefacts are low, so it can stay on all night without being noticed. Overnight, aiOn follows sleep duration and timing, sleep stages, resting heart rate, heart-rate variability (HRV), blood-oxygen saturation (SpO₂) and skin-temperature deviation from your own baseline.",
      "What matters for wellness is the pattern, not a single night. aiOn shows how your last night compares to your rolling baseline and turns that into one plain-language takeaway — for example, whether a later bedtime is what pulled your HRV down this week.",
    ],
  },
  {
    id: "recovery",
    h: "Recovery and readiness",
    body: [
      "Recovery combines HRV, resting heart rate, sleep quality and recent strain into one score. A strong score suggests your body has absorbed recent load; a low score suggests easing off.",
      "aiOn keeps this to one number and one action for the day, so you don't have to interpret four charts before breakfast.",
    ],
  },
  {
    id: "stress",
    h: "Stress and daytime balance",
    body: [
      "Continuous heart-rate and HRV signals show how much of your day was spent calm versus activated. Over weeks, this reveals which routines, workloads and evenings tend to leave you depleted.",
      "aiOn presents daytime stress as a simple range with context, not as an alarm.",
    ],
  },
  {
    id: "activity",
    h: "Activity, workouts and calories",
    body: [
      "Steps, distance, active calories and workouts are tracked from the ring, without a screen on your wrist. Activity is weighed against recovery, so a heavy training block is read in the context of how you slept.",
    ],
  },
  {
    id: "womens-health",
    h: "Women's health and cycle awareness",
    body: [
      "Skin temperature, resting heart rate and HRV shift predictably across the menstrual cycle. aiOn maps these signals to cycle phases and explains what each phase typically means for sleep, energy and training intensity.",
    ],
  },
  {
    id: "choosing",
    h: "How to choose a smart wellness ring",
    body: [
      "Comfort and fit come first — a ring is only useful if it's worn every night, so check sizing before ordering and pick a finish you'll wear daily.",
      "Then look at what happens to the data. Most rings measure similar signals; the difference is whether the app turns them into something you can act on, how long the battery lasts, whether a subscription is required, and how your data is stored and protected.",
      "aiOn is built around that last part: an AI-native app that reduces the day to one Vitality Score and one action, aircraft-grade titanium in three finishes, and a privacy-first data model. It is a general wellness product, not a medical device, and it does not diagnose, treat or prevent any condition.",
    ],
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is a smart ring used for?",
    a: "A smart ring is a general wellness wearable. It tracks signals such as sleep, resting heart rate, HRV, SpO₂, skin temperature, stress and activity, and helps you see how your daily habits affect them over time.",
  },
  {
    q: "Is a smart ring better than a smartwatch for sleep?",
    a: "Many people find a ring easier to wear overnight because it is lighter, has no screen and does not press against the wrist. Both form factors read similar physiological signals; the ring's advantage is that it is comfortable enough to be worn consistently.",
  },
  {
    q: "Does the aiOn ring require a subscription?",
    a: "The aiOn app is included with the ring. Pre-order details are listed on the pre-order page.",
  },
  {
    q: "Is the aiOn ring a medical device?",
    a: "No. aiOn is a general wellness product. It is not intended to diagnose, treat, cure or prevent any disease, and its readings are informational only. Consult a qualified healthcare professional for medical concerns.",
  },
  {
    q: "Which finishes does the aiOn ring come in?",
    a: "Midnight, Silver and Rose Gold, each with the aiOn wordmark laser-etched into the titanium surface.",
  },
  {
    q: "What is a wellness ring, and how is it different from a fitness tracker?",
    a: "A wellness ring focuses on recovery and everyday balance rather than workout counting. It reads sleep, HRV, resting heart rate, temperature and stress continuously, and interprets them against your own baseline so the output is guidance rather than raw activity totals.",
  },
  {
    q: "How long does a smart ring battery last?",
    a: "Most smart rings run for several days on a charge, which is why they stay on overnight more consistently than smartwatches. aiOn is designed for multi-day battery life with a short daily top-up.",
  },
  {
    q: "How accurate is smart ring HRV and sleep data?",
    a: "Consumer wearables are reliable at total sleep time, resting heart rate and HRV trends, and less precise at exact sleep stages. Read stage percentages as weekly trends and rely on your own baseline rather than comparing values with other people.",
  },
  {
    q: "How do I find my smart ring size?",
    a: "Fit matters more than any spec, because a ring only helps if it is worn every night. aiOn shows sizing guidance during pre-order, and you should size for the finger you plan to wear it on, at a normal time of day.",
  },
  {
    q: "Can I wear a smart ring in the shower or while training?",
    a: "aiOn titanium is built for daily wear, including washing hands and workouts. For heavy lifting, many people move the ring to another finger or remove it to avoid surface marks.",
  },
];

export default function SmartRingGuidePage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <SEO
        title="Smart Ring Guide: Sleep, Recovery, HRV & Stress Tracking | aiOn"
        description="How wellness rings track sleep, recovery, HRV, stress, activity and cycle signals — what each reading means, how accurate it is, and how to choose a smart ring you'll actually wear."
        path="/smart-ring-guide"
        image="/og-image.jpg"
        type="article"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Smart Ring Guide — Sleep, Recovery, Stress & Activity",
            description:
              "How smart wellness rings track sleep, recovery, HRV, stress, activity and cycle signals — and how to choose one.",
            mainEntityOfPage: `${SITE}/smart-ring-guide`,
            author: { "@type": "Organization", name: "aiOn" },
            publisher: { "@type": "Organization", name: "aiOn Health Science LLC" },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
              { "@type": "ListItem", position: 2, name: "Smart Ring Guide", item: `${SITE}/smart-ring-guide` },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />
      <Header />

      <main className="pt-32 pb-24">
        <div className="container mx-auto max-w-3xl px-6 lg:px-12">
          <p className="text-[11px] uppercase tracking-[0.34em] text-ink-muted">Guide</p>
          <h1 className="mt-4 text-3xl font-extralight leading-tight text-ink md:text-5xl">
            The smart ring guide: sleep, recovery, stress and everyday wellness
          </h1>
          <p className="mt-6 text-[17px] leading-relaxed text-ink-soft">
            Smart rings measure the quiet signals your body produces all day — heart rate, heart-rate variability,
            blood oxygen, skin temperature, movement and sleep. This guide explains what each signal means, what a
            ring can and cannot tell you, and how aiOn turns those signals into one clear daily action.
          </p>

          <nav aria-label="On this page" className="mt-10 rounded-2xl border border-ink/10 bg-canvas-alt p-6">
            <p className="text-[11px] uppercase tracking-[0.24em] text-ink-muted">On this page</p>
            <ul className="mt-4 space-y-2">
              {TOPICS.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className="text-[15px] text-ink-soft underline-offset-4 hover:underline">
                    {t.h}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-14 space-y-14">
            {TOPICS.map((t) => (
              <section key={t.id} id={t.id} className="scroll-mt-28">
                <h2 className="text-2xl font-light text-ink md:text-3xl">{t.h}</h2>
                {t.body.map((p, i) => (
                  <p key={i} className="mt-4 text-[16px] leading-relaxed text-ink-soft">
                    {p}
                  </p>
                ))}
              </section>
            ))}
          </div>

          <section className="mt-16 scroll-mt-28" id="deep-dives">
            <h2 className="text-2xl font-light text-ink md:text-3xl">Deep dives</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                {
                  to: "/smart-ring-guide/sleep-tracking-ring",
                  t: "Sleep tracking ring",
                  d: "How overnight signals are measured, how accurate they are, and what to change.",
                },
                {
                  to: "/smart-ring-guide/recovery-ring",
                  t: "Recovery ring",
                  d: "What a readiness score is made of and how to train around a low day.",
                },
                {
                  to: "/smart-ring-guide/stress-tracking-ring",
                  t: "Stress tracking ring",
                  d: "Reading calm versus activated time — and the patterns worth fixing.",
                },
              ].map((c) => (
                <Link
                  key={c.to}
                  to={c.to}
                  className="rounded-2xl border border-ink/10 bg-canvas-alt p-6 transition hover:border-ink/25"
                >
                  <p className="text-[16px] font-medium text-ink">{c.t}</p>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{c.d}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-16 scroll-mt-28" id="faq">
            <h2 className="text-2xl font-light text-ink md:text-3xl">Smart ring FAQ</h2>
            <dl className="mt-6 space-y-6">
              {FAQS.map((f) => (
                <div key={f.q} className="rounded-2xl border border-ink/10 bg-canvas-alt p-6">
                  <dt className="text-[16px] font-medium text-ink">{f.q}</dt>
                  <dd className="mt-2 text-[15px] leading-relaxed text-ink-soft">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-16 rounded-3xl border border-ink/10 bg-canvas-alt p-8 text-center">
            <h2 className="text-2xl font-light text-ink">See it in the aiOn app</h2>
            <p className="mx-auto mt-3 max-w-lg text-[15px] text-ink-soft">
              Sleep, recovery, vitals, stress, activity and cycle insights — in one place.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/app"
                className="rounded-full bg-ink px-6 py-3 text-[14px] font-medium text-white transition hover:opacity-90"
              >
                Explore the app
              </Link>
              <Link
                to="/preorder"
                className="rounded-full border border-ink/15 bg-white px-6 py-3 text-[14px] font-medium text-ink transition hover:bg-canvas"
              >
                Reserve your ring
              </Link>
            </div>
          </section>

          <p className="mt-12 text-[13px] leading-relaxed text-ink-muted">
            aiOn is a general wellness product and is not a medical device. It is not intended to diagnose, treat,
            cure or prevent any disease. Always consult a qualified healthcare professional about medical questions.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
