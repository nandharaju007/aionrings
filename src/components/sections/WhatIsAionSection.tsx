import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import circularData from '@/assets/circular-data.jpg';

export function WhatIsAionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-32 lg:py-48 overflow-hidden" id="about">
      {/* Subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial-glow opacity-50" />

      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="max-w-xl"
          >
            <h2 className="text-headline mb-8">
              Health is not a moment.
              <br />
              <span className="text-gradient-teal">It's a pattern over time.</span>
            </h2>
            
            <p className="text-body mb-6">
              aiOn understands your body as a continuous system. Not isolated 
              readings, but connected insights that reveal the rhythm of your 
              wellness over days, weeks, and months.
            </p>
            
            <p className="text-body">
              Through intelligent pattern recognition, aiOn transforms 
              physiological signals into meaningful awareness—helping you 
              understand not just where you are, but where you're heading.
            </p>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-lg mx-auto">
              <img
                src={circularData}
                alt="Continuous health patterns"
                className="w-full h-full object-cover rounded-3xl glow-ring"
              />
              {/* Orbiting elements */}
              <div className="absolute inset-0 rounded-full border border-primary/20 animate-pulse-ring" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
