import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';

export function ConsumerSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-32 lg:py-48">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <span className="text-caption uppercase tracking-widest text-primary mb-4 block">
            For You
          </span>
          
          <h2 className="text-headline mb-8">
            Designed for
            <span className="text-gradient-teal"> everyday wellness</span>
          </h2>

          <p className="text-body max-w-2xl mx-auto mb-12">
            aiOn integrates seamlessly into your life—providing gentle awareness 
            without constant alerts. Understand your balance, your rhythms, 
            your trends. Health intelligence that respects your time.
          </p>

          <div className="grid sm:grid-cols-3 gap-8 mb-12">
            {[
              { label: 'Insight', desc: 'Not overwhelm' },
              { label: 'Balance', desc: 'Not optimization' },
              { label: 'Awareness', desc: 'Not anxiety' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="text-center"
              >
                <p className="text-2xl font-light text-foreground mb-1">{item.label}</p>
                <p className="text-caption">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <Link to="/shop" className="btn-primary">
            Coming Soon
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
