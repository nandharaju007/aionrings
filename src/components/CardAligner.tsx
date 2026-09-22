import { useRef, useState, type PointerEvent } from 'react';

export type Point = { x: number; y: number }; // normalized 0-1

const CARD_RATIO = 85.6 / 53.98;

export function defaultCorners(imgAspect: number): Point[] {
  // Card-shaped box in the centre of the photo (~40% of width).
  const w = 0.4;
  const h = (w / CARD_RATIO) * imgAspect;
  const x = 0.5 - w / 2;
  const y = 0.5 - h / 2;
  return [
    { x, y },
    { x: x + w, y },
    { x: x + w, y: y + h },
    { x, y: y + h },
  ];
}

export function CardAligner({
  src,
  corners,
  onChange,
  onImageLoad,
}: {
  src: string;
  corners: Point[] | null;
  onChange: (c: Point[]) => void;
  onImageLoad: (w: number, h: number) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<number | null>(null);

  const move = (e: PointerEvent) => {
    if (drag === null || !corners || !boxRef.current) return;
    const r = boxRef.current.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    onChange(corners.map((p, i) => (i === drag ? { x, y } : p)));
  };

  return (
    <div
      ref={boxRef}
      className="relative w-full touch-none select-none overflow-hidden rounded-2xl border border-border bg-canvas"
      onPointerMove={move}
      onPointerUp={() => setDrag(null)}
      onPointerLeave={() => setDrag(null)}
    >
      <img
        src={src}
        alt="Your uploaded hand with a card"
        className="block h-auto w-full"
        draggable={false}
        onLoad={(e) => onImageLoad(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)}
      />
      {corners && (
        <>
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon
              points={corners.map((p) => `${p.x * 100},${p.y * 100}`).join(' ')}
              className="fill-primary/15 stroke-primary"
              strokeWidth={0.6}
              vectorEffect="non-scaling-stroke"
              style={{ strokeWidth: 2 }}
            />
          </svg>
          {corners.map((p, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Move card corner ${i + 1}`}
              onPointerDown={(e) => {
                e.preventDefault();
                (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
                setDrag(i);
              }}
              className="absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-background/90 shadow-card"
              style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
            />
          ))}
        </>
      )}
    </div>
  );
}
