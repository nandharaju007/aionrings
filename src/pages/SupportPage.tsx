import { Header } from '@/components/Header';
import { SEO } from '@/components/SEO';
import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';
import { Mail, Package, HelpCircle, MessageCircle } from 'lucide-react';

const SupportPage = () => {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <SEO title={"aiOn Support — We're here to help"} description={"Contact aiOn support for setup, orders, and shipping. Reach us at contact@aionrings.com and orders@aionrings.com."} path="/support" image="/og-support.jpg" />
      <Header />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-headline mb-2 text-ink">Support</h1>
            <p className="text-ink-muted mb-12">We're here to help with your aiOn experience.</p>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <a
                href="mailto:contact@aionrings.com"
                className="group surface-card-hover p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-full p-2.5 shadow-sm" style={{ background: 'var(--gradient-brand)' }}>
                    <HelpCircle className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-light text-ink">General Support</h2>
                </div>
                <p className="text-ink-soft text-[14px] mb-3">
                  Questions about setup, features, account access, or troubleshooting.
                </p>
                <span className="text-[14px] font-medium text-primary group-hover:underline">
                  contact@aionrings.com
                </span>
              </a>

              <a
                href="mailto:orders@aionrings.com"
                className="group surface-card-hover p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-full p-2.5 shadow-sm" style={{ background: 'var(--gradient-brand)' }}>
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-light text-ink">Orders & Shipping</h2>
                </div>
                <p className="text-ink-soft text-[14px] mb-3">
                  Pre-order status, reservation changes, shipping updates, and delivery questions.
                </p>
                <span className="text-[14px] font-medium text-primary group-hover:underline">
                  orders@aionrings.com
                </span>
              </a>
            </div>

            <div className="space-y-10 text-ink-soft leading-relaxed">
              <section>
                <h2 className="text-xl font-light text-ink mb-4">Response Times</h2>
                <p>
                  Our support team typically responds within 1–2 business days. For urgent order
                  inquiries, please include your reservation number in the subject line.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-ink mb-4">Before You Email</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Include your reservation or order number if available</li>
                  <li>Describe the issue and any steps you've already tried</li>
                  <li>Let us know your preferred contact method and timezone</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-light text-ink mb-4">Business & Partnership Inquiries</h2>
                <p>
                  For wellness partnerships, bulk reservations, and B2B opportunities, please visit
                  our <a href="/partners" className="text-primary hover:underline">Partners page</a> or
                  contact <a href="mailto:contact@aionrings.com" className="text-primary hover:underline">contact@aionrings.com</a>.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-ink mb-4">Wellness Disclaimer</h2>
                <div className="surface-card p-6 bg-canvas-alt/50">
                  <p className="mb-3 text-[14px]">
                    aiOn Ring is intended for general wellness purposes only and is not a medical device.
                    The information provided by aiOn Ring is for informational purposes only and is not
                    intended to diagnose, treat, cure, or prevent any disease or medical condition.
                  </p>
                  <p className="text-[14px]">
                    Always consult a qualified healthcare professional regarding any medical concerns or
                    before making healthcare decisions. In an emergency, contact your local emergency
                    services immediately.
                  </p>
                </div>
              </section>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SupportPage;
