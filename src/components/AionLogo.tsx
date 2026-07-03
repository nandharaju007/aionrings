interface AionLogoProps {
  className?: string;
  width?: number;
  showTagline?: boolean;
  gradientId?: string;
}

export function AionLogo({
  className = '',
  width = 130,
  showTagline = false,
  gradientId = 'aionLogoGradient',
}: AionLogoProps) {
  // Tight compact wordmark: ai · O(ring) · n — kerned close together
  const height = showTagline ? width * (78 / 120) : width * (60 / 120);
  const viewBox = showTagline ? '0 0 120 78' : '0 0 120 60';
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="aiOn"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00C6FF" />
          <stop offset="50%" stopColor="#4FB3FF" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <text
        x="8"
        y="42"
        textAnchor="start"
        fill="#FFFFFF"
        fontFamily="'Arial Black', 'Inter', sans-serif"
        fontWeight={800}
        fontSize="34"
        letterSpacing="-1.5"
      >
        ai
      </text>
      <circle
        cx="60"
        cy="30"
        r="12"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="4.5"
      />
      <text
        x="76"
        y="42"
        textAnchor="start"
        fill="#FFFFFF"
        fontFamily="'Arial Black', 'Inter', sans-serif"
        fontWeight={800}
        fontSize="34"
        letterSpacing="-1.5"
      >
        n
      </text>
      {showTagline && (
        <text
          x="60"
          y="66"
          textAnchor="middle"
          fill="#5A6B7E"
          fontFamily="'Inter', sans-serif"
          fontWeight={500}
          fontSize="7"
          letterSpacing="2"
        >
          VITAL · LIFE · FORCE
        </text>
      )}
    </svg>
  );
}
