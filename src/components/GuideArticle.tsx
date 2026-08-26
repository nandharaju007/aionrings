import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

export const SITE = "https://www.aionrings.com";

export type GuideSection = {
  id: string;
  h: string;
  body?: string[];
  bullets?: string[];
  table?: { head: string[]; rows: string[][] };
};

export type GuideFaq = { q: string; a: string };

type Props = {
  path: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  breadcrumbName: string;
  h1: string;
  intro: string;
  sections: GuideSection[];
  faqs: GuideFaq[];
  related: { to: string; label: string }[];
};

export function GuideArticle({
  path,
  metaTitle,
  metaDescription,
  eyebrow,
  breadcrumbName,
  h1,
  intro,
  sections,
  faqs,
  related,
}: Props) {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <SEO
        title={metaTitle}
        description={metaDescription}
        path={path}
        image="/og-image.jpg"
        type="article"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: h1,
            description: metaDescription,
            mainEntityOfPage: `${SITE}${path}`,
            author: { "@type": "Organization", name: "aiOn" },
            publisher: { "@type": "Organization", name: "aiOn Health Science LLC" },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
              { "@type": "ListItem", position: 2, name: "Smart Ring Guide", item: `${SITE}/smart-ring-guide` },
              { "@type": "ListItem", position: 3, name: breadcrumbName, item: `${SITE}${path}` },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
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
          <nav aria-label="Breadcrumb" className="text-[13px] text-ink-muted">
            <Link to="/smart-ring-guide" className="underline-offset-4 hover:underline">
              Smart Ring Guide
            </Link>
            <span className="mx-2">/</span>
            <span>{breadcrumbName}</span>
          </nav>

          <p className="mt-6 text-[11px] uppercase tracking-[0.34em] text-ink-muted">{eyebrow}</p>
          <h1 className="mt-4 text-3xl font-extralight leading-tight text-ink md:text-5xl">{h1}</h1>
          <p className="mt-6 text-[17px] leading-relaxed text-ink-soft">{intro}</p>

          <nav aria-label="On this page" className="mt-10 rounded-2xl border border-ink/10 bg-canvas-alt p-6">
            <p className="text-[11px] uppercase tracking-[0.24em] text-ink-muted">On this page</p>
            <ul className="mt-4 space-y-2">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-[15px] text-ink-soft underline-offset-4 hover:underline">
                    {s.h}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-14 space-y-14">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-28">
                <h2 className="text-2xl font-light text-ink md:text-3xl">{s.h}</h2>
                {s.body?.map((p, i) => (
                  <p key={i} className="mt-4 text-[16px] leading-relaxed text-ink-soft">
                    {p}
                  </p>
                ))}
                {s.bullets && (
                  <ul className="mt-4 space-y-2">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex gap-3 text-[16px] leading-relaxed text-ink-soft">
                        <span aria-hidden className="mt-[10px] h-1 w-1 shrink-0 rounded-full bg-ink/40" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {s.table && (
                  <div className="mt-6 overflow-x-auto rounded-2xl border border-ink/10">
                    <table className="w-full text-left text-[15px]">
                      <thead className="bg-canvas-alt">
                        <tr>
                          {s.table.head.map((h) => (
                            <th key={h} className="px-4 py-3 font-medium text-ink">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {s.table.rows.map((r, i) => (
                          <tr key={i} className="border-t border-ink/10">
                            {r.map((c, j) => (
                              <td key={j} className="px-4 py-3 align-top text-ink-soft">
                                {c}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}
          </div>

          <section className="mt-16 scroll-mt-28" id="faq">
            <h2 className="text-2xl font-light text-ink md:text-3xl">Frequently asked questions</h2>
            <dl className="mt-6 space-y-6">
              {faqs.map((f) => (
                <div key={f.q} className="rounded-2xl border border-ink/10 bg-canvas-alt p-6">
                  <dt className="text-[16px] font-medium text-ink">{f.q}</dt>
                  <dd className="mt-2 text-[15px] leading-relaxed text-ink-soft">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-16">
            <h2 className="text-2xl font-light text-ink">Keep reading</h2>
            <ul className="mt-4 space-y-2">
              {related.map((r) => (
                <li key={r.to}>
                  <Link to={r.to} className="text-[15px] text-ink-soft underline underline-offset-4 hover:text-ink">
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
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
