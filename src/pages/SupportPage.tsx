import { Header } from '@/components/Header';
import { SEO } from '@/components/SEO';
import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';
import { Mail, Package, HelpCircle, MessageCircle } from 'lucide-react';

const SupportPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title={"aiOn Support — We're here to help"} description={"Contact aiOn support for setup, orders, and shipping. Reach us at support@aionrings.com and orders@aionrings.com."} path="/support" image="/og-support.jpg" />
      <Header />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-extralight mb-2">Support</h1>
            <p className="text-caption mb-12">We're here to help with your aiOn experience.</p>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <a
                href="mailto:support@aionrings.com"
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 hover:border-[#4FB3FF]/40 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-full p-2.5" style={{ background: 'linear-gradient(135deg,#00C6FF,#4FB3FF,#7C3AED)' }}>
                    <HelpCircle className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-light text-foreground">General Support</h2>
                </div>
                <p className="text-body text-[14px] mb-3">
                  Questions about setup, features, account access, or troubleshooting.
                </p>
                <span className="text-[14px] font-medium text-[#4FB3FF] group-hover:underline">
                  support@aionrings.com
                </span>
              </a>

              <a
                href="mailto:orders@aionrings.com"
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 hover:border-[#4FB3FF]/40 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-full p-2.5" style={{ background: 'linear-gradient(135deg,#00C6FF,#4FB3FF,#7C3AED)' }}>
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-light text-foreground">Orders & Shipping</h2>
                </div>
                <p className="text-body text-[14px] mb-3">
                  Pre-order status, reservation changes, shipping updates, and delivery questions.
                </p>
                <span className="text-[14px] font-medium text-[#4FB3FF] group-hover:underline">
                  orders@aionrings.com
                </span>
              </a>
            </div>

            <div className="space-y-10 text-body">
              <section>
                <h2 className="text-xl font-light text-foreground mb-4">Response Times</h2>
                <p>
                  Our support team typically responds within 1–2 business days. For urgent order
                  inquiries, please include your reservation number in the subject line.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">Before You Email</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Include your reservation or order number if available</li>
                  <li>Describe the issue and any steps you've already tried</li>
                  <li>Let us know your preferred contact method and timezone</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">Business & Partnership Inquiries</h2>
                <p>
                  For healthcare partnerships, bulk reservations, and B2B opportunities, please visit
                  our <a href="/partners" className="text-[#4FB3FF] hover:underline">Partners page</a> or
                  contact <a href="mailto:support@aionrings.com" className="text-[#4FB3FF] hover:underline">support@aionrings.com</a>.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-foreground mb-4">Medical Disclaimer</h2>
                <p>
                  aiOn is a consumer wellness device, not a medical device. If you have a health
                  emergency or need medical advice, please contact a qualified healthcare provider.
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

export default SupportPage;
