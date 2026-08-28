import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { ContactForm } from '@/components/ContactForm';
import { motion } from 'framer-motion';
import { Mail, Package, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <SEO
        title="Contact aiOn — We're here to help"
        description="Reach the aiOn team for support, orders, and partnership inquiries. Send us a message and we'll reply within 1–2 business days."
        path="/contact"
      />
      <Header />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-headline mb-2 text-ink">Contact Us</h1>
            <p className="text-ink-muted mb-8">
              Questions about aiOn Ring, your pre-order, or partnerships? Send us a message below.
            </p>

            <ContactForm />

            <div className="grid sm:grid-cols-2 gap-4 mt-10">
              <a href="mailto:contact@aionrings.com" className="group surface-card-hover p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-full p-2 shadow-sm" style={{ background: 'var(--gradient-brand)' }}>
                    <HelpCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[13px] text-ink-muted">General support</p>
                    <p className="text-[14px] font-medium text-primary group-hover:underline">contact@aionrings.com</p>
                  </div>
                </div>
              </a>
              <a href="mailto:orders@aionrings.com" className="group surface-card-hover p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-full p-2 shadow-sm" style={{ background: 'var(--gradient-brand)' }}>
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[13px] text-ink-muted">Orders & shipping</p>
                    <p className="text-[14px] font-medium text-primary group-hover:underline">orders@aionrings.com</p>
                  </div>
                </div>
              </a>
            </div>

            <p className="text-[13px] text-ink-muted mt-8">
              Looking for help articles and response times? Visit our{' '}
              <Link to="/support" className="text-primary hover:underline">Support page</Link>.
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
