import { useEffect, useRef } from "react";

/**
 * Gentle site-wide snowfall for the winter season.
 * - Canvas overlay, pointer-events none, sits above content but below modals (z-40).
 * - Respects prefers-reduced-motion (renders nothing).
 * - Flakes are soft blue-white so they read on the porcelain background.
 * - Pauses when the tab is hidden; caps flake count on small screens.
 */
export function WinterSnow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    type Flake = { x: number; y: number; r: number; speed: number; drift: number; phase: number; opacity: number };
    let flakes: Flake[] = [];

    const spawn = (initial: boolean): Flake => ({
      x: Math.random() * w,
      y: initial ? Math.random() * h : -8,
      r: 1 + Math.random() * 2.2,
      speed: 0.35 + Math.random() * 0.75,
      drift: 0.15 + Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.35 + Math.random() * 0.45,
    });

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.min(90, Math.round((w * h) / 22000));
      flakes = Array.from({ length: target }, () => spawn(true));
    };

    let t = 0;
    const tick = () => {
      t += 0.008;
      ctx.clearRect(0, 0, w, h);
      for (const f of flakes) {
        f.y += f.speed;
        f.x += Math.sin(t * 2 + f.phase) * f.drift;
        if (f.y > h + 8) Object.assign(f, spawn(false));
        if (f.x > w + 8) f.x = -8;
        if (f.x < -8) f.x = w + 8;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(150, 190, 235, ${f.opacity})`;
        ctx.shadowColor = "rgba(255, 255, 255, 0.9)";
        ctx.shadowBlur = 3;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      raf = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        raf = requestAnimationFrame(tick);
      }
    };

    resize();
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40"
    />
  );
}
