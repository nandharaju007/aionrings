import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';

export function FinalCTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-32 lg:py-48 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-hero opacity-50" />
      
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-headline mb-6">
            Join the future of
            <span className="text-gradient-teal"> health awareness</span>
          </h2>
          
          <p className="text-body mb-10">
            Experience the full circle of health. Eternal awareness, everyday wellness.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/shop" className="btn-primary">
              Buy aiOn Ring
            </Link>
            <Link to="/#features" className="btn-secondary">
              Learn More
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
