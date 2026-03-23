import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Building2, Shield, BarChart3 } from 'lucide-react';

export function HealthcareSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const benefits = [
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Longitudinal Insights',
      description: 'Access continuous patient data streams for comprehensive health understanding.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Privacy-First Architecture',
      description: 'Built with healthcare-grade security and compliance from the ground up.',
    },
    {
      icon: <Building2 className="w-6 h-6" />,
      title: 'Remote Monitoring Ready',
      description: 'Seamless integration with existing healthcare workflows and systems.',
    },
  ];

  return (
    <section ref={ref} id="healthcare" className="relative py-32 lg:py-48 bg-card/30">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <span className="text-caption uppercase tracking-widest text-primary mb-4 block">
            For Healthcare
          </span>
          
          <h2 className="text-headline mb-6">
            Built for
            <span className="text-gradient-teal"> providers</span>
          </h2>

          <p className="text-body max-w-2xl mx-auto">
            aiOn bridges the gap between episodic care and continuous understanding. 
            Partner with us to bring longitudinal health intelligence to your patients.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="card-glass p-8 text-center"
            >
              <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {benefit.icon}
              </div>
              <h3 className="text-lg font-light text-foreground mb-3">{benefit.title}</h3>
              <p className="text-body">{benefit.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-body mb-4">
            Interested in a healthcare partnership or business collaboration?
          </p>
          <a
            href="mailto:healthcare@mazosolutions.com"
            className="btn-secondary inline-block"
          >
            Contact Us for Collaboration
          </a>
        </motion.div>
      </div>
    </section>
  );
}
