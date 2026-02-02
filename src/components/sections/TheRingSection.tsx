import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import ringProduct from '@/assets/ring-product.jpg';

export function TheRingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-32 lg:py-48">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Product Visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-radial-glow opacity-60" />
              <img
                src={ringProduct}
                alt="aiOn Ring"
                className="relative w-full h-full object-cover rounded-3xl float"
              />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <h2 className="text-headline mb-8">
              The
              <span className="text-gradient-teal"> Ring</span>
            </h2>
            
            <p className="text-body mb-6">
              Crafted from aerospace-grade titanium, the aiOn Ring sits 
              weightlessly on your finger—an invisible companion that 
              never sleeps, never stops learning.
            </p>

            <ul className="space-y-4 mb-10">
              {[
                'Continuous 24/7 sensing',
                'Up to 7 days battery life',
                'Water resistant to 100m',
                'Featherlight 4g design',
              ].map((feature, i) => (
                <motion.li
                  key={feature}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-3 text-muted-foreground"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {feature}
                </motion.li>
              ))}
            </ul>

            <Link to="/shop" className="btn-primary">
              Shop aiOn Ring
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
