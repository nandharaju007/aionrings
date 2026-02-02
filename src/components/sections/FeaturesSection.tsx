import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  delay?: number;
}

function FeatureCard({ title, description, icon, delay = 0 }: FeatureCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="card-feature group"
    >
      {/* Icon */}
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-500" />
        <div className="absolute inset-0 flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>

      <h3 className="text-xl font-light mb-3 text-foreground">{title}</h3>
      <p className="text-body">{description}</p>
    </motion.div>
  );
}

// Circular SVG icons
const MetabolicIcon = () => (
  <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="24" cy="24" r="20" />
    <path d="M12 24 C16 18, 20 30, 24 24 C28 18, 32 30, 36 24" />
  </svg>
);

const CardioIcon = () => (
  <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="24" cy="24" r="20" />
    <path d="M16 24 L20 24 L22 18 L26 30 L28 24 L32 24" />
  </svg>
);

const SleepIcon = () => (
  <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="24" cy="24" r="20" />
    <path d="M20 16 C30 16, 30 32, 20 32" />
    <circle cx="18" cy="24" r="2" fill="currentColor" />
  </svg>
);

const StressIcon = () => (
  <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="24" cy="24" r="20" />
    <circle cx="24" cy="24" r="10" strokeDasharray="4 2" />
    <circle cx="24" cy="24" r="4" fill="currentColor" />
  </svg>
);

const MovementIcon = () => (
  <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="24" cy="24" r="20" />
    <path d="M24 10 L24 24 L34 30" />
    <circle cx="24" cy="24" r="3" fill="currentColor" />
  </svg>
);

const features = [
  {
    title: 'Metabolic Balance',
    description: 'Blood glucose trends and energy rhythm awareness over time. Understand your metabolic patterns, not just single readings.',
    icon: <MetabolicIcon />,
  },
  {
    title: 'Cardiovascular Awareness',
    description: 'Heart rate and blood pressure patterns. See the relationship between rest and activity in continuous context.',
    icon: <CardioIcon />,
  },
  {
    title: 'Sleep & Recovery',
    description: 'Sleep cycles, nighttime restoration, and recovery readiness. Wake up knowing how your body truly recharged.',
    icon: <SleepIcon />,
  },
  {
    title: 'Stress & Balance',
    description: "HRV-informed stress awareness. Understand your nervous system's calm versus strain states over time.",
    icon: <StressIcon />,
  },
  {
    title: 'Movement Intelligence',
    description: 'Activity patterns and sustainable daily motion. Consistency matters more than intensity.',
    icon: <MovementIcon />,
  },
];

export function FeaturesSection() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-100px' });

  return (
    <section id="features" className="relative py-32 lg:py-48">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-1/2 bg-gradient-radial-glow opacity-30" />

      <div className="container mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-headline mb-6">
            Awareness, not
            <span className="text-gradient-teal"> measurements</span>
          </h2>
          <p className="text-body">
            aiOn transforms raw signals into meaningful wellness insights. 
            Each feature is designed to reveal patterns—helping you 
            understand your health as a continuous journey.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, i) => (
            <FeatureCard
              key={feature.title}
              {...feature}
              delay={i * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
