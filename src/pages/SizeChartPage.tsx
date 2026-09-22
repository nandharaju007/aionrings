import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';

type Row = { us: string; uk: string; eu: string; mm: string; circ: string; available: boolean };

const rows: Row[] = [
  { us: '5', uk: 'J½', eu: '49', mm: '15.7', circ: '49.3', available: false },
  { us: '5.5', uk: 'K½', eu: '50', mm: '16.1', circ: '50.6', available: false },
  { us: '6', uk: 'L½', eu: '52', mm: '16.5', circ: '51.9', available: true },
  { us: '6.5', uk: 'M½', eu: '53', mm: '16.9', circ: '53.1', available: false },
  { us: '7', uk: 'N½', eu: '54', mm: '17.3', circ: '54.4', available: true },
  { us: '7.5', uk: 'O½', eu: '56', mm: '17.8', circ: '55.7', available: false },
  { us: '8', uk: 'P½', eu: '57', mm: '18.2', circ: '57.2', available: true },
  { us: '8.5', uk: 'Q½', eu: '58', mm: '18.6', circ: '58.3', available: false },
  { us: '9', uk: 'R½', eu: '60', mm: '19.0', circ: '59.5', available: true },
  { us: '9.5', uk: 'S½', eu: '61', mm: '19.4', circ: '60.8', available: false },
  { us: '10', uk: 'T½', eu: '62', mm: '19.8', circ: '62.1', available: true },
  { us: '10.5', uk: 'U½', eu: '63', mm: '20.2', circ: '63.4', available: false },
  { us: '11', uk: 'V½', eu: '65', mm: '20.6', circ: '64.6', available: true },
  { us: '11.5', uk: 'W½', eu: '66', mm: '21.0', circ: '65.9', available: false },
  { us: '12', uk: 'Y', eu: '67', mm: '21.4', circ: '67.2', available: true },
  { us: '12.5', uk: 'Z', eu: '68', mm: '21.8', circ: '68.5', available: false },
  { us: '13', uk: 'Z+1', eu: '70', mm: '22.2', circ: '69.7', available: true },
];

export default function SizeChartPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <SEO
        title="Ring Size Chart - US, UK & EU Sizes | aiOn"
        description="Compare US, UK and European ring sizes with inner diameter and circumference in millimetres, and check your estimated aiOn Ring size."
        path="/size-chart"
      />
      <Header />
      <main className="pt-24 pb-20">
        <div className="container mx-auto max-w-5xl px-6 lg:px-12">
          <nav aria-label="Breadcrumb" className="text-[13px] text-ink-muted">
            <Link to="/ring" className="underline-offset-4 hover:underline">aiOn Ring</Link>
            <span className="mx-2">/</span>
            <span>Size chart</span>
          </nav>

          <h1 className="mt-6 text-3xl font-light text-ink md:text-5xl">Ring size chart</h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
            Got a size from our photo estimate, or know your size in another country's system? Find it
            below to see the matching US, UK and European size. The aiOn Ring comes in whole US sizes
            6 to 13, shown in bold. If you land on a half size, we recommend sizing up.
          </p>

          <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-white shadow-sm">
            <table className="w-full min-w-[520px] text-left text-[15px]">
              <thead className="bg-canvas-alt">
                <tr>
                  <th className="px-4 py-3 font-medium text-ink">US</th>
                  <th className="px-4 py-3 font-medium text-ink">UK</th>
                  <th className="px-4 py-3 font-medium text-ink">EU</th>
                  <th className="px-4 py-3 font-medium text-ink">Inner diameter (mm)</th>
                  <th className="px-4 py-3 font-medium text-ink">Circumference (mm)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.us}
                    className={`border-t border-border ${r.available ? 'bg-primary/[0.04] font-medium text-ink' : 'text-ink-muted'}`}
                  >
                    <td className="px-4 py-3">
                      {r.us}
                      {r.available && (
                        <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] uppercase tracking-wide text-primary">
                          aiOn
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{r.uk}</td>
                    <td className="px-4 py-3">{r.eu}</td>
                    <td className="px-4 py-3">{r.mm}</td>
                    <td className="px-4 py-3">{r.circ}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { t: 'From a ring you own', b: 'Measure the inside edge of a ring that fits well and match it to the inner diameter column.' },
              { t: 'With a strip of paper', b: 'Wrap it around the base of your finger, mark where it meets, and match the length to the circumference column.' },
              { t: 'From your photo estimate', b: 'Find your estimated US size above to see its UK and EU equivalent and exact measurements.' },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                <h2 className="text-base font-medium text-ink">{c.t}</h2>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{c.b}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/ring#ring-experience" className="rounded-full bg-primary px-6 py-3 text-[14px] font-medium text-primary-foreground">
              Estimate my size from a photo
            </Link>
            <Link to="/preorder" className="rounded-full border border-border px-6 py-3 text-[14px] font-medium text-ink">
              Reserve your ring
            </Link>
          </div>

          <p className="mt-8 text-[13px] leading-relaxed text-ink-muted">
            Conversions are approximate and can vary slightly between brands. A free sizing kit ships
            before your ring, and you can change your size before dispatch.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
