import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Lock, Eye, Database } from 'lucide-react';

export function PrivacySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const principles = [
    {
      icon: <Database className="w-5 h-5" />,
      title: 'Local-First',
      description: 'Your data lives on your device by default.',
    },
    {
      icon: <Eye className="w-5 h-5" />,
      title: 'Transparent',
      description: 'Clear, non-medical positioning always.',
    },
    {
      icon: <Lock className="w-5 h-5" />,
      title: 'User-Controlled',
      description: 'You decide what syncs and what stays private.',
    },
  ];

  return (
    <section ref={ref} id="privacy" className="relative py-24 lg:py-32">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="surface-card p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-light mb-6 text-center">
              Privacy & Trust
            </h2>

            <div className="grid sm:grid-cols-3 gap-8 mb-8">
              {principles.map((principle, i) => (
                <motion.div
                  key={principle.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                    {principle.icon}
                  </div>
                  <h3 className="font-light text-ink mb-1">{principle.title}</h3>
                  <p className="text-caption text-ink-muted">{principle.description}</p>
                </motion.div>
              ))}
            </div>

            <p className="text-caption text-ink-muted text-center max-w-2xl mx-auto">
              aiOn Ring is intended for general wellness purposes only and is not a medical device.
              Its information is not intended to diagnose, treat, cure, or prevent any disease or
              medical condition. Optional cloud sync available with end-to-end encryption.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
