import { motion } from 'framer-motion';

interface AionLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function AionLogo({ className = '', size = 'md', animated = true }: AionLogoProps) {
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const ringSize = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  const Wrapper = animated ? motion.div : 'div';
  const wrapperProps = animated
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.6 },
      }
    : {};

  return (
    <Wrapper
      className={`flex items-center gap-0.5 font-light tracking-tight ${className}`}
      {...wrapperProps}
    >
      <span className={`${sizes[size]} text-foreground`}>ai</span>
      <div className={`relative ${ringSize[size]} flex items-center justify-center`}>
        {/* The O ring with gradient */}
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(187, 100%, 70%)" />
              <stop offset="50%" stopColor="hsl(187, 85%, 53%)" />
              <stop offset="100%" stopColor="hsl(200, 80%, 45%)" />
            </linearGradient>
          </defs>
          {/* Segmented ring */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="url(#ringGradient)"
            strokeWidth="12"
            strokeDasharray="65 8 65 8 55 8"
            strokeLinecap="round"
            className={animated ? 'animate-pulse-ring' : ''}
          />
        </svg>
      </div>
      <span className={`${sizes[size]} text-foreground`}>n</span>
    </Wrapper>
  );
}
