import { Link } from 'react-router-dom';
import { Download, Printer, Ruler, Scissors, CircleDot } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';

const PDF = '/downloads/aion-printable-ring-sizer.pdf';

const steps = [
  { icon: Printer, title: 'Print at actual size', text: 'Open the sizer and print at 100% ("Actual size"). Never use "Fit to page".' },
  { icon: Ruler, title: 'Check the 50 mm line', text: 'Measure the line at the top with a ruler. If it isn’t exactly 50 mm, fix your print settings and print again.' },
  { icon: Scissors, title: 'Cut out the strip', text: 'Cut along the dotted line, then cut the small slit next to the 0 mark.' },
  { icon: CircleDot, title: 'Wrap your finger', text: 'Remove other rings. Wrap the strip around the base of the finger you’ll wear it on and feed the end through the slit. Snug, but able to slide over your knuckle.' },
  { icon: Ruler, title: 'Read your size', text: 'Read the US size where the strip meets the slit. Between two sizes? Choose the larger one.' },
];

export default function SizingKitPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <SEO
        title="Printable Ring Sizer & Sizing Kit | aiOn"
        description="Download aiOn's free printable ring sizer and follow a simple step-by-step guide to measure your US ring size at home."
        path="/sizing-kit"
        image="/og-image.jpg"
      />
      <Header />
      <main className="pt-24 pb-20">
        <div className="container mx-auto max-w-4xl px-6 lg:px-12">
          <nav aria-label="Breadcrumb" className="text-[13px] text-ink-muted">
            <Link to="/ring" className="underline-offset-4 hover:underline">aiOn Ring</Link>
            <span className="mx-2">/</span>
            <span>Sizing kit</span>
          </nav>
          <h1 className="mt-6 text-3xl font-light text-ink md:text-5xl">Find your size at home</h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
            Print our free sizer, measure in two minutes, and reserve with confidence. The aiOn Ring comes in whole US sizes 6 to 13.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href={PDF} download="aion-printable-ring-sizer.pdf"><Download className="mr-2 h-4 w-4" />Download printable sizer (PDF)</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={PDF} target="_blank" rel="noopener noreferrer"><Printer className="mr-2 h-4 w-4" />Open to print</a>
            </Button>
          </div>

          <h2 className="mt-14 text-2xl font-light text-ink">Paper strip: step by step</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2">
            {steps.map((s, i) => (
              <li key={s.title} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">{i + 1}</span>
                  <s.icon className="h-5 w-5 text-ink-muted" aria-hidden />
                  <h3 className="font-medium text-ink">{s.title}</h3>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{s.text}</p>
              </li>
            ))}
          </ol>

          <h2 className="mt-14 text-2xl font-light text-ink">Already have a ring that fits?</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
            Lay it on the circles on page one of the sizer. The circle that matches the ring’s inner edge is your size. Use a ring from the same finger.
          </p>

          <h2 className="mt-14 text-2xl font-light text-ink">Tips for the right fit</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-ink-soft">
            <li>Measure at the end of the day, when fingers are warmest and largest.</li>
            <li>Measure two or three times and use the size that comes up most.</li>
            <li>Smart rings are wider than most rings, so they feel snugger. If unsure, size up.</li>
          </ul>

          <div className="mt-12 flex flex-wrap gap-3">
            <Button asChild variant="outline"><Link to="/size-chart">View US size chart</Link></Button>
            <Button asChild variant="outline"><Link to="/faq">Sizing FAQ</Link></Button>
            <Button asChild><Link to="/preorder">Reserve your ring</Link></Button>
          </div>
          <p className="mt-10 text-[12px] text-ink-muted">aiOn is a general wellness product and not a medical device.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
