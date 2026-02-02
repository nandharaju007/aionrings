import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import circularData from '@/assets/circular-data.jpg';

export function IntelligenceSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} id="intelligence" className="relative py-32 lg:py-48 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-card/50 to-transparent" />

      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-md mx-auto">
              <img
                src={circularData}
                alt="Multi-signal intelligence"
                className="w-full h-full object-cover rounded-full opacity-80"
              />
              
              {/* Orbiting rings */}
              {[1, 2, 3].map((ring) => (
                <div
                  key={ring}
                  className="absolute inset-0 rounded-full border border-primary/10"
                  style={{
                    transform: `scale(${1 + ring * 0.15})`,
                    animation: `pulse-ring ${4 + ring}s ease-in-out infinite`,
                    animationDelay: `${ring * 0.5}s`,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-headline mb-8">
              Patterns, not
              <span className="text-gradient-teal"> predictions</span>
            </h2>

            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-light text-foreground mb-2">Personal Baseline Modeling</h3>
                <p className="text-body">
                  aiOn learns your unique physiology—establishing your personal 
                  normal before identifying meaningful changes.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-light text-foreground mb-2">Multi-Signal Fusion</h3>
                <p className="text-body">
                  Heart rate, HRV, sleep quality, stress levels, glucose trends, 
                  and blood pressure—woven together into unified understanding.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-light text-foreground mb-2">Longitudinal Recognition</h3>
                <p className="text-body">
                  See beyond daily fluctuations. Understand how your health 
                  evolves across weeks and months.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
