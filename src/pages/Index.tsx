import { useEffect, useRef, useState, ReactNode } from "react";
import { motion, AnimatePresence, useInView, useMotionValue, useSpring } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ringHero from "@/assets/ring-hero-v2.png";
import ringProduct from "@/assets/ring-product.jpg";
import heroFingerRing from "@/assets/hero-finger-ring.png";
import appScreenVitality from "@/assets/app-screen-vitality.png";
import appScreenQuest from "@/assets/app-screen-quest.png";
import appScreenSleep from "@/assets/app-screen-sleep.png";

/* ─────────────────────────────────────────────
   Brand tokens (inline, no CSS var changes)
   ───────────────────────────────────────────── */
const C = {
  navy: "#0A1628",
  blue: "#4FB3FF",
  purple: "#7C3AED",
  green: "#4ADE80",
  gold: "#FACC15",
};

/* ─────────────────────────────────────────────
   Custom glowing cursor (desktop only)
   ───────────────────────────────────────────── */
function GlowCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40 });
  const sy = useSpring(y, { stiffness: 500, damping: 40 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setEnabled(true);
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [x, y]);

  if (!enabled) return null;
  return (
    <motion.div
      aria-hidden
      style={{ x: sx, y: sy }}
      className="pointer-events-none fixed left-0 top-0 z-[100] -ml-3 -mt-3 h-6 w-6 rounded-full"
    >
      <div
        className="h-6 w-6 rounded-full"
        style={{
          background: `radial-gradient(circle, ${C.blue} 0%, rgba(79,179,255,0.4) 40%, transparent 70%)`,
          boxShadow: `0 0 24px ${C.blue}, 0 0 60px rgba(79,179,255,0.6)`,
        }}
      />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Particle field — slow drifting stars
   ───────────────────────────────────────────── */
function ParticleField({ density = 60, opacity = 0.35 }: { density?: number; opacity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    // Aggressive mobile reduction — canvas fill is the biggest scroll cost
    const effectiveDensity = isMobile ? Math.min(density, 12) : density;
    let raf = 0;
    let visible = false;
    let running = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;
    let particles: { x: number; y: number; r: number; vx: number; vy: number; a: number }[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({ length: effectiveDensity }).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.3,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
        a: Math.random() * 0.6 + 0.2,
      }));
    };
    resize();
    window.addEventListener("resize", resize);

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        if (!reduced) { p.x += p.vx; p.y += p.vy; }
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${p.a * opacity})`;
        ctx.fill();
      }
      if (reduced || !visible) { running = false; return; }
      raf = requestAnimationFrame(tick);
    };
    const start = () => { if (running || reduced) return; running = true; raf = requestAnimationFrame(tick); };
    // Draw one static frame so section is never blank
    tick();
    // Only animate when the canvas is on-screen
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        visible = e.isIntersecting;
        if (visible) start();
      }
    }, { rootMargin: "50px" });
    io.observe(canvas);
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener("resize", resize); };
  }, [density, opacity]);
  return <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />;
}

/* ─────────────────────────────────────────────
   Aurora background — animated gradient blobs
   ───────────────────────────────────────────── */
function Aurora({ intensity = 0.5 }: { intensity?: number }) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const upd = () => setIsMobile(mq.matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    upd();
    mq.addEventListener("change", upd);
    return () => mq.removeEventListener("change", upd);
  }, []);
  if (isMobile) {
    // Static, GPU-cheap gradient on mobile — no framer RAF, smaller blur
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute -top-1/4 -left-1/4 h-[70vw] w-[70vw] rounded-full blur-[60px]"
          style={{ background: C.blue, opacity: intensity * 0.28, willChange: "auto" }}
        />
        <div
          className="absolute -bottom-1/4 -right-1/4 h-[75vw] w-[75vw] rounded-full blur-[70px]"
          style={{ background: C.purple, opacity: intensity * 0.28 }}
        />
      </div>
    );
  }
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute -top-1/4 -left-1/4 h-[60vw] w-[60vw] rounded-full blur-[120px]"
        style={{ background: C.blue, opacity: intensity * 0.35 }}
        animate={{ x: [0, 80, -40, 0], y: [0, 60, -30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-1/4 -right-1/4 h-[65vw] w-[65vw] rounded-full blur-[140px]"
        style={{ background: C.purple, opacity: intensity * 0.35 }}
        animate={{ x: [0, -60, 40, 0], y: [0, -40, 30, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 left-1/2 h-[40vw] w-[40vw] -translate-x-1/2 rounded-full blur-[100px]"
        style={{ background: C.blue, opacity: intensity * 0.2 }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Subtle grid overlay
   ───────────────────────────────────────────── */
function GridOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.08]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
      }}
    />
  );
}

/* ─────────────────────────────────────────────
   Count-up on view
   ───────────────────────────────────────────── */
function CountUp({ to, duration = 1600, suffix = "" }: { to: number; duration?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return <span ref={ref}>{n}{suffix}</span>;
}

/* ─────────────────────────────────────────────
   Typewriter line
   ───────────────────────────────────────────── */
function Typewriter({ text, delay = 0, className = "", speed = 28 }: { text: string; delay?: number; className?: string; speed?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [out, setOut] = useState("");
  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const start = setTimeout(() => {
      const iv = setInterval(() => {
        i++;
        setOut(text.slice(0, i));
        if (i >= text.length) clearInterval(iv);
      }, speed);
    }, delay);
    return () => clearTimeout(start);
  }, [inView, text, delay, speed]);
  return <span ref={ref} className={className}>{out}<span className="opacity-60 animate-pulse">{out.length < text.length ? "▍" : ""}</span></span>;
}

/* ─────────────────────────────────────────────
   Fade-up wrapper
   ───────────────────────────────────────────── */
function FadeUp({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* Words stagger */
function WordStagger({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: delay + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
        >
          {w}&nbsp;
        </motion.span>
      ))}
    </span>
  );
}

/* ─────────────────────────────────────────────
   Chip
   ───────────────────────────────────────────── */
function Chip({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs sm:text-sm font-light backdrop-blur-md ${className}`}
      style={{ borderColor: "rgba(79,179,255,0.35)", background: "rgba(10,22,40,0.55)", boxShadow: `0 0 24px rgba(79,179,255,0.15)`, color: "#e6f2ff" }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Hero
   ───────────────────────────────────────────── */
function Hero() {
  const chips = [
    { label: "❤️ 72 bpm", angle: -55, delay: 1.0 },
    { label: "🫁 98% SpO₂", angle: 55, delay: 1.15 },
    { label: "🧠 HRV 34ms", angle: -100, delay: 1.3 },
    { label: "🌙 Sleep 7h 42m", angle: 100, delay: 1.45 },
    { label: "⚡ Recovery 81", angle: -145, delay: 1.6 },
    { label: "🌡️ 36.8°C", angle: 145, delay: 1.75 },
  ];

  return (
    <section className="relative min-h-[100svh] overflow-hidden" style={{ background: C.navy }}>
      <Aurora intensity={0.9} />
      <GridOverlay />
      <ParticleField density={80} opacity={0.4} />

      {/* Top atmospheric vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${C.blue}08 0%, transparent 55%), radial-gradient(ellipse at 50% 100%, ${C.purple}08 0%, transparent 50%)`,
        }}
      />

      <div className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-6 pt-28 md:pt-32 pb-12">
        {/* Cinematic finger-with-ring banner */}
        <motion.div
          className="relative w-full max-w-5xl mx-auto mb-8 md:mb-12"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src={heroFingerRing}
              alt="Human finger wearing the aiOn smart ring"
              width={1920}
              height={1024}
              className="w-full h-[140px] sm:h-[180px] md:h-[240px] object-cover"
              style={{ filter: "contrast(1.05) saturate(1.05)" }}
            />
            {/* Blend into navy background on all edges */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `
                  linear-gradient(to bottom, ${C.navy} 0%, transparent 25%, transparent 60%, ${C.navy} 100%),
                  linear-gradient(to right, ${C.navy} 0%, transparent 18%, transparent 82%, ${C.navy} 100%),
                  radial-gradient(ellipse at center, transparent 40%, rgba(10,22,40,0.55) 100%)
                `,
              }}
            />
            {/* Cool tint for color harmony */}
            <div
              className="pointer-events-none absolute inset-0 mix-blend-color"
              style={{ background: `linear-gradient(120deg, ${C.blue}22, ${C.purple}22)` }}
            />
          </div>
        </motion.div>

        {/* Headline */}
        <div className="text-center max-w-5xl mx-auto">
          <motion.h1
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extralight tracking-tight leading-[1.05]"
            initial="hidden" animate="show"
            variants={{ show: { transition: { staggerChildren: 0.18 } } }}
          >
            <motion.span
              variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="block text-white"
            >
              Your body has been talking.
            </motion.span>
            <motion.span
              variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="block text-transparent bg-clip-text"
              style={{ backgroundImage: `linear-gradient(120deg, ${C.blue}, ${C.purple})` }}
            >
              You just couldn't hear it.
            </motion.span>
          </motion.h1>
          <motion.p
            className="mt-5 md:mt-7 text-lg md:text-2xl font-light text-white/70 max-w-2xl mx-auto"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.9 }}
          >
            aiOn changes that.
          </motion.p>
        </div>

        {/* Cinematic ring stage */}
        <div className="relative mt-10 md:mt-14 w-full max-w-3xl">
          {/* Outer orbital ring glow */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[78%] md:w-[72%] aspect-square rounded-full"
            style={{
              background: `conic-gradient(from 0deg, ${C.blue}20, ${C.purple}20, ${C.blue}20)`,
              filter: "blur(2px)",
              opacity: 0.6,
            }}
          />

          {/* Dark inner portal */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] md:w-[64%] aspect-square rounded-full"
            style={{
              background: `radial-gradient(circle at 50% 45%, rgba(10,22,40,0.2) 0%, rgba(10,22,40,0.85) 55%, rgba(10,22,40,0.95) 100%)`,
              boxShadow: `inset 0 0 80px rgba(79,179,255,0.12), 0 0 60px rgba(79,179,255,0.08)`,
            }}
          />

          {/* Ambient radial glow */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-square rounded-full blur-3xl"
            style={{ background: `radial-gradient(circle, ${C.blue}18 0%, ${C.purple}10 45%, transparent 70%)` }}
          />

          {/* Floating ring */}
          <motion.div
            className="relative flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: [0, -12, 0] }}
            transition={{
              opacity: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
              scale: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
              y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <img
              src={ringHero}
              alt="aiOn smart ring floating in cinematic light"
              width={620}
              height={620}
              className="h-auto w-full max-w-[280px] sm:max-w-[360px] md:max-w-[460px] object-contain"
              style={{
                filter: "drop-shadow(0 30px 80px rgba(79,179,255,0.35))",
              }}
            />
          </motion.div>

          {/* Desktop orbital vitals chips */}
          <div className="hidden md:block absolute inset-0">
            {chips.map((c, i) => {
              const rad = (c.angle * Math.PI) / 180;
              const radius = 46; // % of container
              const x = 50 + radius * Math.cos(rad);
              const y = 50 + radius * Math.sin(rad);
              return (
                <motion.div
                  key={i}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
                  transition={{
                    opacity: { delay: c.delay, duration: 0.6 },
                    scale: { delay: c.delay, duration: 0.6 },
                    y: { duration: 4 + i * 0.4, repeat: Infinity, ease: "easeInOut" },
                  }}
                >
                  <Chip>{c.label}</Chip>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile vitals row */}
        <div className="mt-6 flex flex-wrap justify-center gap-2 md:hidden max-w-md mx-auto">
          {chips.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.08, duration: 0.5 }}
            >
              <Chip>{c.label}</Chip>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="mt-10 md:mt-12 flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.9 }}
        >
          <Link
            to="/preorder"
            className="group relative inline-flex items-center justify-center rounded-full px-10 py-4 text-base font-medium text-[#0A1628]"
            style={{ background: `linear-gradient(120deg, ${C.blue}, ${C.purple})`, boxShadow: `0 0 40px ${C.blue}66` }}
          >
            <motion.span
              className="absolute inset-0 rounded-full"
              animate={{ opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.4, repeat: Infinity }}
              style={{ boxShadow: `0 0 0 8px ${C.blue}33` }}
            />
            <span className="relative">Pre-order Now</span>
          </Link>
          <p className="mt-3 text-xs md:text-sm text-white/50">Free app included</p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="mt-auto pt-10 flex justify-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="h-10 w-6 rounded-full border border-white/30 flex justify-center pt-1.5">
            <motion.div
              className="h-1.5 w-1 rounded-full bg-white/70"
              animate={{ y: [0, 14, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Section 2 — One Number
   ───────────────────────────────────────────── */
function VitalityScoreSection() {
  return (
    <section id="how" className="relative overflow-hidden py-16 md:py-48" style={{ background: "linear-gradient(180deg, #0A1628 0%, #0F1F3A 50%, #0A1628 100%)" }}>
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <FadeUp>
            <div className="relative mx-auto h-72 w-72 md:h-96 md:w-96">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,0.08)" strokeWidth="3" fill="none" />
                <motion.circle
                  cx="50" cy="50" r="44" fill="none" strokeWidth="3" strokeLinecap="round"
                  stroke="url(#v2grad)" pathLength={1}
                  initial={{ pathLength: 0 }} whileInView={{ pathLength: 0.84 }} viewport={{ once: true }} transition={{ duration: 2.2, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="v2grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={C.blue} />
                    <stop offset="100%" stopColor={C.green} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-6xl md:text-7xl font-extralight text-white"><CountUp to={84} /></div>
                <div className="mt-1 text-xs md:text-sm text-white/50 tracking-widest">YOUR VITALITY SCORE</div>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-white/80">
              <motion.span
                className="h-2 w-2 rounded-full"
                style={{ background: C.green }}
                animate={{ opacity: [0.5, 1, 0.5], boxShadow: [`0 0 6px ${C.green}`, `0 0 16px ${C.green}`, `0 0 6px ${C.green}`] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              You're ready today
            </div>
          </FadeUp>

          <FadeUp delay={0.15}>
            <h2 className="text-4xl md:text-6xl font-extralight text-white leading-[1.05]">
              <WordStagger text="Wake up knowing" /><br /><WordStagger text="your number." delay={0.15} />
            </h2>
            <div className="mt-8 space-y-3 text-white/70 text-lg font-light">
              <p>Heart Rate. HRV. Sleep.<br />Stress. Recovery. SpO₂.</p>
              <p className="text-white">One score. Every morning.</p>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Section 3 — Track · Understand · Act
   ───────────────────────────────────────────── */
function TrackUnderstandActSection() {
  const cols = [
    {
      title: "TRACK",
      lines: ["Every metric.", "Every moment.", "24 hours a day."],
      color: C.blue,
      icon: (
        <svg viewBox="0 0 64 64" className="h-14 w-14" fill="none">
          <circle cx="32" cy="32" r="22" stroke={C.blue} strokeWidth="3" strokeLinecap="round" strokeDasharray="90 200" transform="rotate(-90 32 32)" />
        </svg>
      ),
    },
    {
      title: "UNDERSTAND",
      lines: ["One daily score.", "Exactly where you stand.", "Every single morning."],
      color: C.purple,
      icon: (
        <svg viewBox="0 0 64 64" className="h-14 w-14" fill="none" stroke={C.purple} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="32,14 50,26 44,48 20,48 14,26" />
          <circle cx="32" cy="14" r="2.5" fill={C.purple} />
          <circle cx="50" cy="26" r="2.5" fill={C.purple} />
          <circle cx="44" cy="48" r="2.5" fill={C.purple} />
          <circle cx="20" cy="48" r="2.5" fill={C.purple} />
          <circle cx="14" cy="26" r="2.5" fill={C.purple} />
        </svg>
      ),
    },
    {
      title: "ACT",
      lines: ["One action.", "Built for your body.", "Assigned every morning."],
      color: C.green,
      icon: (
        <svg viewBox="0 0 64 64" className="h-14 w-14" fill={C.green}>
          <path d="M36 6 L18 36 h12 l-4 22 22-30 h-12 z" />
        </svg>
      ),
    },
  ];
  return (
    <section id="app" className="relative overflow-hidden py-16 md:py-48" style={{ background: C.navy }}>
      <ParticleField density={45} opacity={0.3} />
      <div className="container mx-auto px-6 relative z-10">
        <FadeUp className="text-center">
          <div className="mx-auto mb-4 h-3 w-3 rounded-full" style={{ background: C.blue, boxShadow: `0 0 24px ${C.blue}, 0 0 60px ${C.blue}88` }} />
          <p className="text-xs md:text-sm tracking-[0.35em] text-white/60 uppercase">
            Other rings track. aiOn acts.
          </p>
        </FadeUp>

        <div className="mt-14 grid md:grid-cols-3 gap-6 md:gap-4 items-stretch relative">
          {cols.map((c, idx) => (
            <div key={c.title} className="relative flex">
              <motion.div
                className="w-full rounded-3xl border backdrop-blur-xl p-8 md:p-10 text-center flex flex-col items-center"
                style={{ borderColor: `${c.color}44`, background: "rgba(10,22,40,0.55)", boxShadow: `0 0 40px ${c.color}22` }}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.15, ease: [0.22, 1, 0.36, 1] }}
              >
                <div style={{ filter: `drop-shadow(0 0 12px ${c.color}88)` }}>{c.icon}</div>
                <h3 className="mt-6 text-2xl md:text-3xl font-light tracking-[0.35em] text-white">
                  {c.title}
                </h3>
                <div className="mt-6 space-y-1 text-white/60 text-sm md:text-base font-light">
                  {c.lines.map((l, i) => <p key={i}>{l}</p>)}
                </div>
              </motion.div>
              {idx < cols.length - 1 && (
                <motion.div
                  aria-hidden
                  className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 items-center justify-center text-white/40"
                  initial={{ opacity: 0, x: -6 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ delay: 0.4 + idx * 0.15, duration: 0.6 }}
                >
                  <svg width="26" height="14" viewBox="0 0 26 14" fill="none">
                    <path d="M1 7 H23 M17 1 L23 7 L17 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              )}
            </div>
          ))}
        </div>

        <FadeUp delay={0.3} className="mt-16 text-center">
          <p className="text-xl md:text-2xl font-extralight text-white/80 leading-relaxed">
            Most wearables stop at the data.<br />
            <span className="text-white">aiOn starts there.</span>
          </p>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Section — Body Talking (You feel tired…)
   ───────────────────────────────────────────── */
function BodyTalkingSection() {
  const lines = [
    { text: "You feel tired.", strong: true },
    { text: "You don't know why.", strong: false },
    { text: "You're working hard.", strong: true },
    { text: "You're not recovering.", strong: false },
    { text: "You're stressed.", strong: true, hasPulse: true },
    { text: "You can't see what it's doing.", strong: false },
  ];
  return (
    <section className="relative overflow-hidden py-20 md:py-40" style={{ background: C.navy }}>
      <ParticleField density={30} opacity={0.25} />
      <div className="container mx-auto px-6 relative z-10 text-center max-w-3xl">
        <div className="space-y-4 md:space-y-6">
          {lines.map((l, i) => (
            <motion.div
              key={i}
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
            >
              {l.hasPulse && (
                <svg
                  aria-hidden
                  viewBox="0 0 800 80"
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] max-w-none h-20 opacity-70"
                  preserveAspectRatio="none"
                >
                  <motion.path
                    d="M0,40 L220,40 L250,20 L275,60 L300,10 L325,70 L350,40 L470,40 L500,25 L520,55 L540,40 L800,40"
                    stroke={C.blue}
                    strokeWidth="1.5"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    style={{ filter: `drop-shadow(0 0 6px ${C.blue})` }}
                  />
                </svg>
              )}
              <p
                className={`relative text-3xl md:text-5xl font-extralight leading-tight ${l.strong ? "text-white" : "text-white/45"}`}
              >
                {l.text}
              </p>
            </motion.div>
          ))}
        </div>

        <FadeUp delay={0.4} className="mt-20 space-y-2 text-white/55 text-sm md:text-base font-light">
          <p>Your annual physical is once a year.</p>
          <p>Your doctor has 10 minutes.</p>
          <p>Nobody is watching.</p>
        </FadeUp>

        <motion.p
          className="mt-14 text-4xl md:text-6xl font-extralight"
          style={{ color: C.blue, textShadow: `0 0 40px ${C.blue}88` }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          Until now.
        </motion.p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Section 4 — The 6 Health Pillars
   ───────────────────────────────────────────── */
function PillarsSection() {
  const pillars = [
    { icon: "❤️", name: "Heart Health", line: "Resting HR · HRV · ECG · BP (EST)", bullets: [
      "HRV — your stress and resilience in one number",
      "ECG — detect irregular rhythms on demand",
      "BP trend (EST) — direction, not just readings",
    ]},
    { icon: "🌙", name: "Sleep", line: "Stages · SpO₂ · Breathing · Temperature", bullets: [
      "Deep, REM, Light — every stage, every night",
      "Breathing rate during sleep is an early illness signal",
      "7 hours in bed is not 7 hours of sleep",
    ]},
    { icon: "🌸", name: "Women's Health", line: "Cycle · Ovulation · Phase coaching", bullets: [
      "Automatic cycle tracking from temperature and HRV",
      "Each phase has different energy and recovery needs",
      "aiOn's quests adapt to where you are",
    ]},
    { icon: "💪", name: "Active & Recovery", line: "Recovery · Strain · VO₂ Max", bullets: [
      "Know when to go hard and when to rest",
      "Overtraining detection before you feel it",
      "The workout doesn't make you stronger. Recovery does.",
    ]},
    { icon: "🧠", name: "Stress & Mental", line: "Real-time stress · HRV · Burnout risk", bullets: [
      "See how each meeting affects your nervous system",
      "Burnout shows up in data weeks before you feel it",
      "Stress is invisible until aiOn shows it",
    ]},
    { icon: "🩸", name: "Metabolic", line: "Blood Glucose (EST) · BP (EST)", bullets: [
      "Glucose and BP trends matter long before diagnosis",
      "EST readings — direction, not clinical readings",
      "Metabolic disease starts with a trend. aiOn watches it.",
    ]},
  ];
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="signals" className="relative overflow-hidden py-16 md:py-48" style={{ background: C.navy }}>
      <ParticleField density={35} opacity={0.22} />
      <div className="container mx-auto px-6 relative z-10">
        <FadeUp className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-extralight text-white leading-[1.05]">
            <WordStagger text="Everything your body" /><br /><WordStagger text="is telling you." delay={0.15} />
          </h2>
        </FadeUp>
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {pillars.map((p, i) => {
            const isOpen = open === i;
            return (
              <motion.button
                key={p.name}
                onClick={() => setOpen(isOpen ? null : i)}
                className="text-left rounded-3xl border p-6 backdrop-blur-xl transition-all"
                style={{
                  borderColor: isOpen ? `${C.blue}88` : `${C.blue}33`,
                  background: "rgba(10,22,40,0.55)",
                  boxShadow: isOpen ? `0 0 40px ${C.blue}44` : "none",
                }}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.06 }}
                whileHover={{ y: -3, boxShadow: `0 0 40px ${C.blue}33` }}
              >
                <div className="text-3xl">{p.icon}</div>
                <h3 className="mt-3 text-xl font-light text-white">{p.name}</h3>
                <p className="mt-2 text-sm text-white/60 font-light">{p.line}</p>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.ul
                      className="mt-4 space-y-2 text-sm text-white/70 font-light overflow-hidden"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.35 }}
                    >
                      {p.bullets.map((b, j) => (
                        <li key={j} className="flex gap-2">
                          <span style={{ color: C.blue }}>·</span>{b}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
                <p className="mt-4 text-[10px] tracking-widest text-white/40">
                  {isOpen ? "TAP TO CLOSE" : "TAP TO EXPAND"}
                </p>
              </motion.button>
            );
          })}
        </div>
        <p className="mt-10 text-center text-[11px] text-white/40 max-w-xl mx-auto">
          Blood Pressure (EST) and Blood Glucose (EST) are estimates — not for medical diagnosis.
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Section 5 — Today's Quest
   ───────────────────────────────────────────── */
function QuestSection() {
  const quests = [
    { title: "Box breathing", tag: "HRV", metric: "🧠 HRV" },
    { title: "No caffeine after 2pm", tag: "SLEEP", metric: "🌙 Sleep" },
    { title: "10-min walk", tag: "STRESS", metric: "⚡ Stress" },
  ];
  return (
    <section className="relative overflow-hidden py-16 md:py-48" style={{ background: C.navy }}>
      <div className="container mx-auto px-6 relative z-10">
        <FadeUp className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-extralight text-white leading-[1.05]">
            <WordStagger text="The one thing" /><br /><WordStagger text="you should do today." delay={0.15} />
          </h2>
          <p className="mt-6 text-white/60 text-base md:text-lg font-light">
            Every morning. Built for your body.<br />Based on your last 7 days.
          </p>
        </FadeUp>

        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {quests.map((q, i) => (
            <motion.div key={i}
              className="rounded-3xl border p-6 backdrop-blur-xl"
              style={{ borderColor: "rgba(79,179,255,0.25)", background: "rgba(10,22,40,0.55)" }}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.12 }}
            >
              <span className="text-[10px] tracking-[0.25em] text-white/50">TODAY'S QUEST · {q.tag}</span>
              <h3 className="mt-4 text-2xl font-light text-white">{q.title}</h3>
              <div className="mt-6 flex justify-end">
                <Chip>{q.metric}</Chip>
              </div>
            </motion.div>
          ))}
        </div>

        <FadeUp delay={0.3} className="mt-12 text-center">
          <p className="text-base md:text-lg text-white/70 font-light">
            Complete it. Earn XP. Build your streak.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Section — The App (screens)
   ───────────────────────────────────────────── */
function TheAppSection() {
  const screens = [
    { src: appScreenVitality, alt: "aiOn app — Vitality Score", caption: "Your number, every morning." },
    { src: appScreenQuest,    alt: "aiOn app — Today's Quest",  caption: "One quest a day." },
    { src: appScreenSleep,    alt: "aiOn app — Sleep insight",  caption: "See what last night did." },
  ];
  return (
    <section id="the-app" className="relative overflow-hidden py-16 md:py-40" style={{ background: C.navy }}>
      <ParticleField density={30} opacity={0.25} />
      <div className="container mx-auto px-6 relative z-10">
        <FadeUp className="text-center max-w-3xl mx-auto">
          <p className="text-xs md:text-sm tracking-[0.35em] text-white/50 uppercase">The app</p>
          <h2 className="mt-4 text-4xl md:text-6xl font-extralight text-white leading-[1.05]">
            Your body, on screen.
          </h2>
          <p className="mt-6 text-white/60 text-base md:text-lg font-light">
            Clean. Calm. Built to answer one question — what should I do today?
          </p>
        </FadeUp>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 items-end">
          {screens.map((s, i) => (
            <motion.div
              key={s.alt}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              style={{ transform: i === 1 ? "translateY(-24px)" : undefined }}
            >
              <div
                className="relative"
                style={{ filter: `drop-shadow(0 30px 60px rgba(0,0,0,0.55)) drop-shadow(0 0 40px ${C.blue}33)` }}
              >
                <img
                  src={s.src}
                  alt={s.alt}
                  loading="lazy"
                  width={768}
                  height={1536}
                  className="w-[220px] md:w-[260px] h-auto select-none pointer-events-none"
                />
              </div>
              <p className="mt-6 text-sm md:text-base text-white/60 font-light tracking-wide">
                {s.caption}
              </p>
            </motion.div>
          ))}
        </div>

        <FadeUp delay={0.3} className="mt-14 text-center">
          <p className="text-sm md:text-base text-white/50 font-light">
            Free with every ring. iOS &amp; Android.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Section 6 — Preventive
   ───────────────────────────────────────────── */
function PreventiveSection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-56" style={{ background: C.navy }}>
      <div className="container mx-auto px-6 relative z-10 text-center max-w-3xl">
        <FadeUp>
          <div className="relative rounded-3xl border p-6 backdrop-blur-xl mx-auto max-w-2xl" style={{ borderColor: `${C.blue}33`, background: "rgba(10,22,40,0.5)" }}>
            <div className="text-left text-xs tracking-widest text-white/50">HRV · LAST 14 DAYS</div>
            <svg viewBox="0 0 400 120" className="mt-3 w-full h-32">
              <motion.path
                d="M0,30 L30,32 L60,35 L90,38 L120,42 L150,48 L180,52 L210,58 L240,64 L270,72 L300,80 L330,86 L360,92 L400,96"
                fill="none" stroke={C.blue} strokeWidth="2"
                initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 2.5, ease: "easeOut" }}
              />
            </svg>
            <motion.div
              className="absolute right-4 top-16 rounded-xl border px-3 py-2 text-xs text-left"
              style={{ borderColor: `${C.gold}66`, background: "rgba(10,22,40,0.9)", color: C.gold }}
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 2.5, duration: 0.6 }}
            >
              ⚠️ Your HRV dropped 22% this week
            </motion.div>
          </div>
        </FadeUp>
        <FadeUp delay={0.4} className="mt-14">
          <h2 className="text-3xl md:text-5xl font-extralight text-white leading-tight">
            aiOn saw it on Day 11.<br />
            <span className="text-white/60">You felt it on Day 14.</span>
          </h2>
          <p className="mt-6 text-lg md:text-xl font-light" style={{ color: C.blue, textShadow: `0 0 24px ${C.blue}66` }}>
            See it before you feel it.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Section 7 — The Ring
   ───────────────────────────────────────────── */
function RingSection() {
  const specs = [
    { icon: "⬡", label: "Titanium" },
    { icon: "💧", label: "IP68" },
    { icon: "🔋", label: "5 days" },
    { icon: "📡", label: "BLE 5.0" },
    { icon: "📏", label: "Size 6–13" },
    { icon: "🖤", label: "Midnight Black" },
  ];
  return (
    <section id="ring" className="relative overflow-hidden py-16 md:py-48" style={{ background: "linear-gradient(180deg, #0A1628 0%, #0E1B34 100%)" }}>
      <ParticleField density={30} opacity={0.2} />
      <div className="container mx-auto px-6 relative z-10">
        <FadeUp>
          <motion.div
            className="mx-auto aspect-square w-[min(70vw,420px)] relative"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute inset-0 rounded-full" style={{ boxShadow: `0 0 100px ${C.blue}44` }} />
            <img
              src={ringProduct}
              alt="aiOn ring"
              className="h-full w-full rounded-full object-cover"
              style={{ mixBlendMode: "screen", filter: "drop-shadow(0 0 40px rgba(79,179,255,0.5))" }}
            />
          </motion.div>
        </FadeUp>
        <div className="mt-14 grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6 max-w-4xl mx-auto">
          {specs.map((s, i) => (
            <motion.div key={i}
              className="text-center"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <div className="text-3xl md:text-4xl">{s.icon}</div>
              <div className="mt-2 text-xs md:text-sm text-white/80 font-light">{s.label}</div>
            </motion.div>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-white/50 font-light">
          More colors and matte finish coming.
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Section 8 — Plans (no prices)
   ───────────────────────────────────────────── */
function PlansSection() {
  const plans = [
    { tag: "FREE WITH EVERY RING", name: "aiOn Vitals", tease: "The essentials. Free.", accent: C.blue, features: ["Heart Rate · HRV", "SpO₂ · Temperature", "Sleep · Recovery", "Stress · Vitality Score", "Daily Quest · XP", "aiOn Vitals app"] },
    { tag: "", name: "aiOn Vitals + Insights", tease: "Trends. Coaching. History.", accent: C.purple, highlight: true, features: ["Everything in Vitals", "Insights · Trends", "Sleep Coaching", "Goal Tracking", "Full History"] },
    { tag: "MOST COMPLETE", name: "aiOn Vitals + Insights + Premium", tease: "AI. ECG. Everything.", accent: C.gold, features: ["Everything in Insights", "AI Coach", "Preventive Alerts", "BP (EST) · Glucose (EST)", "ECG", "Priority Support"] },
  ];
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="relative overflow-hidden py-16 md:py-48" style={{ background: "linear-gradient(180deg, #0A1628 0%, #0F1F3A 50%, #0A1628 100%)" }}>
      <div className="container mx-auto px-6 relative z-10">
        <FadeUp className="text-center max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-extralight text-white leading-[1.05]">
            <WordStagger text="Start free." /><br /><WordStagger text="Unlock more when ready." delay={0.15} />
          </h2>
        </FadeUp>
        <div className="mt-16 grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((p, i) => {
            const isOpen = open === i;
            return (
              <motion.div key={i}
                className={`relative rounded-3xl border p-8 backdrop-blur-xl flex flex-col ${p.highlight ? "md:scale-105" : ""}`}
                style={{ borderColor: `${p.accent}66`, background: "rgba(10,22,40,0.6)", boxShadow: p.highlight ? `0 0 60px ${p.accent}44` : `0 0 20px ${p.accent}22` }}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.7 }}
              >
                {p.tag && (
                  <span className="self-start rounded-full border px-3 py-1 text-[10px] tracking-widest" style={{ borderColor: `${p.accent}88`, color: p.accent }}>{p.tag}</span>
                )}
                <h3 className="mt-4 text-2xl font-light text-white">{p.name}</h3>
                <p className="mt-3 text-base text-white/70 font-light">{p.tease}</p>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="mt-4 self-start text-[11px] tracking-widest text-white/50 hover:text-white transition"
                >
                  {isOpen ? "HIDE FEATURES" : "SEE FEATURES"}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.ul
                      className="mt-4 space-y-2 text-sm text-white/70 font-light overflow-hidden"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.35 }}
                    >
                      {p.features.map((f, j) => <li key={j} className="flex gap-2"><span style={{ color: p.accent }}>·</span>{f}</li>)}
                    </motion.ul>
                  )}
                </AnimatePresence>
                <div className="flex-1" />
                <Link to="/preorder" className="mt-8 inline-flex items-center justify-center rounded-full py-3 text-sm font-medium text-[#0A1628]"
                  style={{ background: p.highlight ? `linear-gradient(120deg, ${C.blue}, ${C.purple})` : "rgba(255,255,255,0.9)" }}>
                  Pre-order Now
                </Link>
              </motion.div>
            );
          })}
        </div>
        <p className="mt-8 text-center text-xs text-white/40">30-day free trial on paid plans</p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Section 9 — Final CTA
   ───────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-16 md:py-56 min-h-[90svh] flex items-center" style={{ background: C.navy }}>
      <Aurora intensity={1.2} />
      <ParticleField density={70} opacity={0.4} />
      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          className="mx-auto aspect-square w-[min(70vw,420px)] relative"
          initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1.2 }}
        >
          <motion.div className="absolute inset-0 rounded-full"
            animate={{ boxShadow: [`0 0 80px ${C.blue}66`, `0 0 200px ${C.purple}66`, `0 0 80px ${C.blue}66`] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.img src={ringHero} alt="aiOn ring" className="h-full w-full rounded-full object-cover"
            style={{ mixBlendMode: "screen", filter: "drop-shadow(0 0 40px rgba(79,179,255,0.7))" }}
            animate={{ rotateY: [0, 360] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
        <FadeUp delay={0.3} className="mt-10">
          <h2 className="text-4xl md:text-7xl font-extralight text-white leading-[1.05]">
            Your body has answers.
          </h2>
          <p className="mt-4 text-2xl md:text-4xl font-extralight bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(120deg, ${C.blue}, ${C.purple})` }}>
            aiOn helps you hear them.
          </p>
        </FadeUp>
        <FadeUp delay={0.5} className="mt-10">
          <Link to="/preorder"
            className="relative inline-flex items-center justify-center rounded-full px-10 py-5 text-lg font-medium text-[#0A1628]"
            style={{ background: `linear-gradient(120deg, ${C.blue}, ${C.purple})`, boxShadow: `0 0 60px ${C.blue}88` }}>
            <motion.span className="absolute inset-0 rounded-full"
              animate={{ boxShadow: [`0 0 0 0 ${C.blue}66`, `0 0 0 20px transparent`] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="relative">Pre-order Now</span>
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Page load intro
   ───────────────────────────────────────────── */
function IntroOverlay() {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGone(true), 1400);
    return () => clearTimeout(t);
  }, []);
  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center"
          style={{ background: C.navy }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-7xl font-extralight tracking-tight text-white">
            ai<span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(120deg, ${C.blue}, ${C.purple})` }}>O</span>n
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────
   Main Index
   ───────────────────────────────────────────── */
export default function Index() {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 200);
    }
  }, [location]);

  return (
    <div className="min-h-screen text-white" style={{ background: C.navy }}>
      <IntroOverlay />
      <GlowCursor />
      <Header />
      <main>
        <Hero />
        <VitalityScoreSection />
        <TrackUnderstandActSection />
        <BodyTalkingSection />
        <PillarsSection />
        <QuestSection />
        <PreventiveSection />
        <RingSection />
        <PlansSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
