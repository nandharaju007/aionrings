import { Link } from 'react-router-dom';
import { Check, Camera, CreditCard, Hand, Ruler } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { RingTryOn } from '@/components/RingTryOn';
import { RingSizer } from '@/components/RingSizer';
import ringProduct from '@/assets/ring-product.jpg';
import handCardSample from '@/assets/hand-card-sample-palm.jpg';

const specs: { label: string; value: string }[] = [
  { label: 'Material', value: 'Aerospace-grade titanium (Grade 5)' },
  { label: 'Weight', value: '4 g (varies slightly by size)' },
  { label: 'Width', value: '8 mm seamless band' },
  { label: 'Battery life', value: 'Up to 7 days per charge' },
  { label: 'Charging', value: 'Wireless charging case, USB-C cable included' },
  { label: 'Water resistance', value: '100 m (swim, shower, dive)' },
  { label: 'Sensors', value: 'Optical heart sensing, temperature, motion (accelerometer)' },
  { label: 'Connectivity', value: 'Bluetooth Low Energy, iOS & Android companion app' },
  { label: 'Finishes', value: 'Midnight Black, Titanium Silver' },
  { label: 'Sizes', value: 'US 6–13' },
];

const materials: { title: string; body: string }[] = [
  {
    title: 'Aerospace-grade titanium shell',
    body: 'The outer band is machined from Grade 5 titanium, the same alloy trusted in aircraft and medical implants, for exceptional strength at almost no weight.',
  },
  {
    title: 'Skin-friendly interior',
    body: 'A smooth, non-metallic inner lining sits gently against the skin, keeping the sensors in close, comfortable contact through the day and night.',
  },
  {
    title: 'Seamless, stone-free design',
    body: 'No clasps, no stones, no logo on the band, a continuous circle engineered to disappear on your finger.',
  },
];

const sizeChart: { us: string; mm: string; circumference: string }[] = [
  { us: '6', mm: '16.5', circumference: '51.9' },
  { us: '7', mm: '17.3', circumference: '54.4' },
  { us: '8', mm: '18.2', circumference: '57.2' },
  { us: '9', mm: '19.0', circumference: '59.5' },
  { us: '10', mm: '19.8', circumference: '62.1' },
  { us: '11', mm: '20.6', circumference: '64.6' },
  { us: '12', mm: '21.4', circumference: '67.2' },
  { us: '13', mm: '22.2', circumference: '69.7' },
];

const photoSteps: { icon: typeof Hand; title: string; body: string }[] = [
  {
    icon: Hand,
    title: 'Open your hand palm-up',
    body: 'Hold your palm fully visible, with your fingers slightly open and relaxed.',
  },
  {
    icon: CreditCard,
    title: 'Rest a bank card on your palm',
    body: 'Place a standard bank or credit card flat in the center of your palm. Keep the entire card visible and do not cover it with your fingers. Card details can be hidden.',
  },
  {
    icon: Camera,
    title: 'Shoot straight from above',
    body: 'Hold your phone directly above the hand and take a straight-on photo in good, even light. Avoid angles and harsh shadows.',
  },
  {
    icon: Ruler,
    title: 'Get your estimate',
    body: 'Upload the photo and our sizing assistant measures your finger against the card and matches it to a US ring size.',
  },
];

export default function RingPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <SEO
        title="aiOn Ring - Specs, Materials & Size Chart"
        description="Detailed aiOn Ring specifications, aerospace-grade titanium materials, US size chart, and a photo guide to find your ring size."
        path="/ring"
        image="/og-image.jpg"
      />
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto max-w-5xl px-6 lg:px-12">
          <nav aria-label="Breadcrumb" className="text-[13px] text-ink-muted">
            <Link to="/shop" className="underline-offset-4 hover:underline">Shop</Link>
            <span className="mx-2">/</span>
            <span>aiOn Ring</span>
          </nav>

          {/* Hero */}
          <section className="mt-8 grid items-center gap-10 lg:grid-cols-2">
            <div className="surface-card overflow-hidden">
              <img
                src={ringProduct}
                alt="aiOn Ring"
                className="h-full w-full object-cover"
                width={1024}
                height={1024}
              />
            </div>
            <div>
              <span className="eyebrow">The Ring</span>
              <h1 className="mt-2 text-4xl font-extralight text-ink md:text-5xl">aiOn Ring</h1>
              <p className="mt-4 leading-relaxed text-ink-soft">
                A featherlight titanium ring that senses continuously, sleep, recovery,
                vitals, stress, activity and cycle, and turns it all into one calm,
                daily picture of your wellbeing.
              </p>
              <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2">
                {['Up to 7 days battery', 'Water resistant to 100 m', 'Featherlight 4 g design', 'Continuous 24/7 sensing'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[14px] text-ink-soft">
                    <Check className="h-4 w-4 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/preorder"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Reserve your ring
                </Link>
                <Link
                  to="/shop"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-ink/15 bg-white px-6 py-3 text-sm font-medium text-ink transition hover:bg-canvas"
                >
                  Back to shop
                </Link>
              </div>
            </div>
          </section>

          {/* Ring experience */}
          <section className="mt-16 border-y border-border py-12 md:mt-20 md:py-16" id="ring-experience">
            <div className="mx-auto max-w-2xl text-center">
              <span className="eyebrow">Experience the Ring</span>
              <h2 className="mt-2 text-3xl font-light text-ink md:text-4xl">See the fit before you reserve.</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                Preview your preferred finish on your own hand, then estimate your ring size from a photo.
              </p>
            </div>
            <div className="mt-8 grid items-start gap-5 md:grid-cols-2">
              <RingTryOn />
              <RingSizer collapsible />
            </div>
          </section>

          {/* Materials */}
          <section className="mt-16 md:mt-20">
            <h2 className="text-2xl font-light text-ink md:text-3xl">Materials & build</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {materials.map((m) => (
                <div key={m.title} className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                  <h3 className="text-[16px] font-medium text-ink">{m.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{m.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Specs */}
          <section className="mt-16 md:mt-20">
            <h2 className="text-2xl font-light text-ink md:text-3xl">Full specifications</h2>
            <dl className="mt-6 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
              {specs.map((s, i) => (
                <div
                  key={s.label}
                  className={`grid grid-cols-1 gap-1 px-5 py-4 sm:grid-cols-3 sm:gap-4 ${i > 0 ? 'border-t border-border' : ''}`}
                >
                  <dt className="text-[13px] uppercase tracking-wider text-ink-muted">{s.label}</dt>
                  <dd className="text-[15px] text-ink sm:col-span-2">{s.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Size chart */}
          <section className="mt-16 md:mt-20" id="size-chart">
            <h2 className="text-2xl font-light text-ink md:text-3xl">Size chart</h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
              Measure the inner diameter of a ring that fits you well, or wrap a thin strip of paper
              around the base of your finger and measure its length (circumference). Match it below -
              when between sizes, we recommend sizing up.
            </p>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-white shadow-sm">
              <table className="w-full text-left text-[15px]">
                <thead className="bg-canvas-alt">
                  <tr>
                    <th className="px-4 py-3 font-medium text-ink">US size</th>
                    <th className="px-4 py-3 font-medium text-ink">Inner diameter (mm)</th>
                    <th className="px-4 py-3 font-medium text-ink">Circumference (mm)</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeChart.map((r) => (
                    <tr key={r.us} className="border-t border-border">
                      <td className="px-4 py-3 text-ink">{r.us}</td>
                      <td className="px-4 py-3 text-ink-soft">{r.mm}</td>
                      <td className="px-4 py-3 text-ink-soft">{r.circumference}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Photo sizing instructions */}
          <section className="mt-16 md:mt-20" id="photo-sizing">
            <h2 className="text-2xl font-light text-ink md:text-3xl">Find your size with a photo</h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
              No measuring tape? Take one photo of your open palm holding a bank card and our sizing
              assistant estimates your ring size. Here’s exactly how to take it:
            </p>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <figure className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
                <img
                  src={handCardSample}
                  alt="Example photo: an open hand with the palm facing upward and a bank card resting flat in its center, with the entire card and all fingers visible"
                  className="h-full w-full object-cover"
                  loading="lazy"
                  width={1024}
                  height={1024}
                />
                <figcaption className="px-4 py-3 text-[13px] text-ink-muted">
                  A good photo: palm facing upward, card flat in the center and fully visible, fingers relaxed, camera directly above.
                </figcaption>
              </figure>

              <ol className="space-y-4">
                {photoSteps.map((s, i) => (
                  <li key={s.title} className="flex gap-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <s.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-[15px] font-medium text-ink">
                        {i + 1}. {s.title}
                      </p>
                      <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <a
              href="#ring-experience"
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Estimate my size from a photo
            </a>
          </section>

          <p className="mt-14 text-[13px] leading-relaxed text-ink-muted">
            Photo-based sizing and the virtual try-on are digital estimates for guidance only -
            confirm your size before purchasing. aiOn is a general wellness product and is not a
            medical device; it is not intended to diagnose, treat, cure or prevent any disease.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
