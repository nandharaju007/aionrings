import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import handCardSample from '@/assets/hand-card-sample-palm.jpg';

const questions = [
  {
    id: 'photo',
    question: 'How does photo sizing work?',
    answer: 'The photo tool finds the edges of your selected finger and uses a standard bank card (85.60 × 53.98 mm) as a scale reference. It checks several readings for consistency and may report visible finger width in millimetres. This is an experimental width measurement, not a ring size or a ring’s inner diameter. The tool currently does not recommend a US size for any finger.',
  },
  {
    id: 'us-size',
    question: 'What does a US ring size actually mean?',
    answer: 'A US size is a numbered standard for the inside dimensions of a ring, not a measurement of the width of your finger in a photo. For example, our reference chart lists US 8 at approximately 18.2 mm inner diameter and 57.2 mm inner circumference. Diameter is the distance across the empty opening; circumference is the distance around its inside edge. Conversions are approximate, and ring shape and width can affect fit.',
  },
  {
    id: 'small-fingers',
    question: 'Why might a smaller finger not return a result?',
    answer: 'A narrow finger can occupy fewer pixels in the photo, making its edges harder to locate precisely. Blur, overlapping fingers, a tilted card, hidden edges, or inconsistent readings can also prevent a usable width measurement on fingers of any size. The tool currently accepts plausible projected widths from 14 to 25 mm, but being within that range does not guarantee a reading or prove ring fit. No US size is returned for anyone at present—not just people with smaller fingers. A missing result does not mean your finger is too small or that you should choose the smallest size.',
  },
  {
    id: 'availability',
    question: 'Is a missing photo result the same as an unavailable ring size?',
    answer: 'No. Photo reliability and product size availability are separate. aiOn reservations currently offer whole US sizes 6–13; US 5 and half sizes are not offered. If your physically confirmed size is outside this range, contact us rather than choosing a size that does not fit.',
  },
  {
    id: 'confirm',
    question: 'What is the best way to confirm my size?',
    answer: 'Use the free sizing kit or a physical ring sizer on the finger you plan to wear your ring on. Check that it feels comfortable at the base and passes over your knuckle without being loose. Finger size can change during the day, so check at more than one time. Measuring the inside diameter of a well-fitting ring or using a strip of paper can give a starting point, but confirm the fit physically before dispatch.',
  },
  {
    id: 'photo-setup',
    question: 'How should I take the measurement photo?',
    answer: 'Remove all rings. Hold your hand open, palm up, with every finger visible and slightly separated. Place a standard bank card flat in the center of your palm with all four corners visible. Hold your phone directly above your hand in clear, even light. Do not include visible card numbers or other personal details. The example image illustrates positioning; it is not evidence of sizing accuracy.',
  },
  {
    id: 'camera',
    question: 'Can I use a laptop camera?',
    answer: 'No. The sizing camera is available only on phones. Laptops can upload an existing photo instead. On a phone, auto-capture requires a detected open hand and an aligned card; if hand detection is unavailable, you can use “Take photo” manually. Neither capture method confirms ring fit.',
  },
  {
    id: 'retake',
    question: 'Should I keep retaking photos until I get the size I expect?',
    answer: 'No. If the tool cannot produce a reliable width reading, use physical sizing instead. Repeatedly receiving similar readings does not establish accuracy, and you should not change your reservation size based on a photo measurement. Confirm with the sizing kit or a physical ring sizer.',
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <SEO title="Sizing FAQ | aiOn Ring" description="Understand US ring sizes, experimental photo measurements, smaller-finger results, and how to confirm your aiOn Ring fit." path="/faq" image="/og-image.jpg" />
      <Header />
      <main className="pb-20 pt-28">
        <div className="mx-auto max-w-5xl px-6 lg:px-12">
          <nav aria-label="Breadcrumb" className="text-sm text-ink-muted">
            <Link to="/ring" className="hover:text-primary">aiOn Ring</Link>
            <span className="mx-2">/</span>Sizing FAQ
          </nav>
          <div className="mt-8 border-b border-border pb-8">
            <span className="eyebrow">Fit & measurement</span>
            <h1 className="mt-3 text-4xl font-light text-ink md:text-5xl">Sizing FAQ</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">A photo measures visible width. A physical sizer confirms fit.</p>
          </div>
          <section aria-label="Sizing questions" className="mt-4">
            <Accordion type="multiple" defaultValue={['photo', 'us-size', 'small-fingers']}>
              {questions.map(({ id, question, answer }) => (
                <AccordionItem key={id} value={id} className="border-border">
                  <AccordionTrigger className="gap-4 py-6 text-left text-base text-ink">{question}</AccordionTrigger>
                  <AccordionContent className="max-w-3xl pb-6 text-[15px] leading-relaxed text-ink-soft">{answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
          <figure className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <img src={handCardSample} alt="Open palm with a bank card centered flat on it and all fingers visible" className="aspect-square w-40 shrink-0 rounded-lg object-cover" loading="lazy" />
            <figcaption className="max-w-md text-sm leading-relaxed text-ink-muted">Photo positioning example: no rings, card flat on the palm, all fingers visible. Always confirm your size physically.</figcaption>
          </figure>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild><Link to="/size-chart">View size chart <ArrowRight className="h-4 w-4" /></Link></Button>
            <Button asChild variant="outline"><Link to="/preorder">Sizing options</Link></Button>
            <Button asChild variant="ghost"><Link to="/contact">Ask about your fit</Link></Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}