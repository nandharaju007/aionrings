import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';

const TrademarksPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-extralight mb-2">Trademarks & Intellectual Property</h1>
            <p className="text-caption mb-12">Last updated: April 30, 2026</p>

            <div className="space-y-10 text-body">
              <section>
                <h2 className="text-xl font-light text-foreground mb-4">Ownership</h2>
                <p>
                  aiOn™, the aiOn Ring™, the aiOn logo, the circular "full circle of health" mark, and
                  related taglines including "The full circle of health" and "Eternal awareness, everyday
                  wellness" are trademarks or service marks of Mazo Solutions Inc., registered or pending
                  registration in the United States and other jurisdictions.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">Registered & Common-Law Marks</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>aiOn®</strong> — wearable health intelligence platform</li>
                  <li><strong>aiOn Ring™</strong> — smart ring hardware product</li>
                  <li><strong>Mazo Solutions®</strong> — corporate brand and parent entity</li>
                  <li>The aiOn ring glyph and wordmark</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">Patents</h2>
                <p>
                  Components of the aiOn Ring and platform are covered by one or more issued patents and
                  pending patent applications in the United States and abroad. A list is available upon
                  written request to legal@mazosolutions.com.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">Permitted Use</h2>
                <p>
                  Use of any Mazo Solutions trademark requires prior written permission, except for fair
                  descriptive references in editorial, news, or comparative contexts. You may not use our
                  marks in a manner that suggests endorsement, sponsorship, or affiliation without
                  authorization.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">Third-Party Marks</h2>
                <p>
                  All other product and company names referenced on the aiOn platform are the property
                  of their respective owners. Reference to third-party marks is for identification
                  purposes only and does not imply endorsement.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">Reporting Infringement</h2>
                <p>
                  To report suspected trademark misuse, counterfeit products, or copyright infringement
                  (including DMCA notices), contact: <strong>legal@mazosolutions.com</strong>.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">Copyright Notice</h2>
                <p>
                  © {new Date().getFullYear()} Mazo Solutions Inc. All rights reserved. All content,
                  software, designs, and materials on this site are protected by copyright laws and
                  international treaties.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TrademarksPage;