import { Header } from '@/components/Header';
import { SEO } from '@/components/SEO';
import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';

const AccessibilityPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title={"Accessibility — aiOn"} description={"aiOn's commitment to WCAG-aligned, accessible digital and product experiences."} path="/accessibility" image="/og-policies.jpg" />
      <Header />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-extralight mb-2">Accessibility Statement</h1>
            <p className="text-caption mb-12">Last updated: April 30, 2026</p>

            <div className="space-y-10 text-body">
              <section>
                <h2 className="text-xl font-light text-foreground mb-4">Our Commitment</h2>
                <p>
                  Mazo Solutions Inc. is committed to ensuring digital accessibility for people with
                  disabilities. We continually improve the user experience for everyone and apply the
                  relevant accessibility standards across the aiOn platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">Conformance Status</h2>
                <p>
                  The aiOn website and application aim to conform to the Web Content Accessibility
                  Guidelines (WCAG) 2.1 Level AA, and align with applicable provisions of the Americans
                  with Disabilities Act (ADA), Section 508, and the European Accessibility Act.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">Accessibility Features</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Semantic HTML structure for assistive technology compatibility</li>
                  <li>Keyboard-navigable interface with visible focus states</li>
                  <li>Sufficient color contrast ratios across light and dark themes</li>
                  <li>Descriptive alternative text for meaningful images</li>
                  <li>Resizable text without loss of content or functionality</li>
                  <li>ARIA labels and landmarks for screen readers</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">Feedback</h2>
                <p>
                  We welcome feedback on the accessibility of aiOn. If you encounter barriers, please
                  contact us at accessibility@mazosolutions.com. We aim to respond within 5 business days.
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

export default AccessibilityPage;