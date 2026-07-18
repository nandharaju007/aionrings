import { useEffect, useRef, useState, ReactNode, Fragment } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useInView, useMotionValue, useSpring } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ringHero from "@/assets/ring-hero.jpg";
import ringProduct from "@/assets/ring-product.jpg";
import lifestyle4 from "@/assets/lifestyle-hand-4.jpg";
import lifestyle6 from "@/assets/lifestyle-hand-6.jpg";
import lifestyle8 from "@/assets/lifestyle-hand-8.jpg";

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
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;
    let particles: { x: number; y: number; r: number; vx: number; vy: number; a: number }[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({ length: density }).map(() => ({
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
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [density, opacity]);
  return <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />;
}

/* ─────────────────────────────────────────────
   Aurora background — animated gradient blobs
   ───────────────────────────────────────────── */
function Aurora({ intensity = 0.5 }: { intensity?: number }) {
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
  const chipPos = [
    { label: "❤️ 72 bpm", cls: "top-[8%] left-[6%] md:top-[12%] md:left-[8%]" },
    { label: "🫁 98% SpO₂", cls: "top-[8%] right-[6%] md:top-[12%] md:right-[8%]" },
    { label: "🧠 HRV 34ms", cls: "top-1/2 left-[2%] md:left-[4%] -translate-y-1/2" },
    { label: "🌙 Sleep 7h 42m", cls: "top-1/2 right-[2%] md:right-[4%] -translate-y-1/2" },
    { label: "⚡ Recovery 81", cls: "bottom-[22%] left-[8%] md:bottom-[18%] md:left-[10%]" },
    { label: "🌡️ 36.8°C", cls: "bottom-[22%] right-[8%] md:bottom-[18%] md:right-[10%]" },
  ];
  return (
    <section className="relative min-h-[100svh] overflow-hidden pt-28" style={{ background: C.navy }}>
      <Aurora intensity={0.9} />
      <GridOverlay />
      <ParticleField density={80} opacity={0.4} />

      <div className="relative z-10 container mx-auto px-6">
        {/* Lifestyle hand image — blended, no card box */}
        <motion.div
          className="relative mx-auto mt-2 mb-6 h-[220px] w-[96%] max-w-4xl overflow-hidden sm:h-[260px] md:mt-4 md:h-[320px] lg:h-[380px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src={lifestyle6}
            alt="aiOn ring worn on a finger"
            className="h-full w-full object-cover object-[center_60%]"
            style={{ filter: "contrast(1.08) brightness(1.04) saturate(1.06)" }}
          />
          {/* Top fade — blends into header/hero copy */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, ${C.navy} 0%, ${C.navy}00 32%, transparent 52%, ${C.navy}90 92%, ${C.navy} 100%)`,
            }}
          />
          {/* Side + corner vignettes — seamless edge fade into navy */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at center, transparent 42%, ${C.navy} 100%)`,
            }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `linear-gradient(90deg, ${C.navy} 0%, ${C.navy}00 12%, transparent 88%, ${C.navy}00 92%, ${C.navy} 100%)`,
            }}
          />
          {/* Cool tint overlay to harmonize warm skin tones with site palette */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: `linear-gradient(180deg, ${C.blue}08 0%, transparent 60%)`, mixBlendMode: "overlay" }}
          />
          {/* Subtle bottom rim glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ boxShadow: `inset 0 -30px 80px -30px ${C.blue}22` }}
          />
        </motion.div>

        {/* Headline */}
        <div className="text-center max-w-5xl mx-auto pt-2 md:pt-4">
          <motion.h1
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extralight tracking-tight leading-[1.02]"
            initial="hidden" animate="show"
            variants={{ show: { transition: { staggerChildren: 0.2 } } }}
          >
            <motion.span variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="block text-white">
              Your body has been talking.
            </motion.span>
            <motion.span
              variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="block bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(120deg, ${C.blue}, ${C.purple})` }}
            >
              You just couldn't hear it.
            </motion.span>
          </motion.h1>
          <motion.p
            className="mt-6 md:mt-8 text-lg md:text-2xl font-light text-white/70"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.9 }}
          >
            aiOn changes that.
          </motion.p>
        </div>

        {/* Ring stage */}
        <div className="relative mx-auto mt-10 md:mt-12 w-[min(92vw,720px)]">
          {/* layered glow behind ring */}
          <div
            className="pointer-events-none absolute inset-0 -z-10 scale-90 rounded-full blur-3xl"
            style={{ background: `radial-gradient(circle, ${C.blue}30 0%, ${C.purple}18 45%, transparent 70%)` }}
          />
          <motion.div
            className="pointer-events-none absolute inset-0 -z-10 rounded-full"
            animate={{
              boxShadow: [
                `0 0 80px 10px ${C.blue}30`,
                `0 0 160px 40px ${C.blue}15`,
                `0 0 80px 10px ${C.blue}30`,
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Ring image — full premium shot, no harsh circular crop */}
          <motion.div
            className="relative flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
            transition={{
              opacity: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
              scale: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
              y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <img
              src={ringHero}
              alt="aiOn ring"
              className="h-auto w-full max-w-[520px] md:max-w-[620px] object-contain"
              style={{
                filter: "drop-shadow(0 20px 60px rgba(79,179,255,0.35))",
              }}
            />
          </motion.div>

          {/* Floating chips (desktop absolute, mobile row below) */}
          <div className="hidden md:block">
            {chipPos.map((c, i) => (
              <motion.div
                key={i}
                className={`absolute ${c.cls}`}
                initial={{ opacity: 0, scale: 0.7, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
                transition={{ opacity: { delay: 1 + i * 0.12, duration: 0.6 }, scale: { delay: 1 + i * 0.12, duration: 0.6 }, y: { duration: 4 + i * 0.4, repeat: Infinity, ease: "easeInOut" } }}
              >
                <Chip>{c.label}</Chip>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile chips below ring */}
        <div className="mt-6 flex flex-wrap justify-center gap-2 md:hidden">
          {chipPos.map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 + i * 0.08, duration: 0.5 }}>
              <Chip>{c.label}</Chip>
            </motion.div>
          ))}
        </div>

        {/* Vitality score */}
        <div className="mt-10 flex flex-col items-center">
          <div className="relative h-32 w-32 md:h-40 md:w-40">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
              <motion.circle
                cx="50" cy="50" r="44" fill="none" strokeWidth="4" strokeLinecap="round"
                stroke="url(#vitalGrad)"
                initial={{ pathLength: 0 }} animate={{ pathLength: 0.84 }} transition={{ duration: 2, delay: 1.2, ease: "easeOut" }}
                style={{ pathLength: 0.84 }}
              />
              <defs>
                <linearGradient id="vitalGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={C.blue} />
                  <stop offset="100%" stopColor={C.green} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-4xl md:text-5xl font-extralight text-white">
              <CountUp to={84} duration={1800} />
            </div>
          </div>
          <div className="mt-4 text-sm text-white/60">Your Vitality Score</div>
          <div className="mt-2 flex items-center gap-2 text-sm" style={{ color: C.green }}>
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: C.green, boxShadow: `0 0 10px ${C.green}` }} />
            You're ready today
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center">
          <Link to="/preorder"
            className="group relative inline-flex items-center justify-center rounded-full px-8 py-4 text-base font-medium text-[#0A1628]"
            style={{ background: `linear-gradient(120deg, ${C.blue}, ${C.purple})`, boxShadow: `0 0 40px ${C.blue}66` }}>
            <motion.span
              className="absolute inset-0 rounded-full"
              animate={{ opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.4, repeat: Infinity }}
              style={{ boxShadow: `0 0 0 8px ${C.blue}33` }}
            />
            <span className="relative">Pre-order Now</span>
          </Link>
          <p className="mt-4 text-xs md:text-sm text-white/50">Free app included with every ring · Ships Q3 2026</p>
        </div>

        {/* scroll indicator */}
        <motion.div className="mx-auto mt-12 mb-8 flex justify-center" animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="h-10 w-6 rounded-full border border-white/30 flex justify-center pt-1.5">
            <motion.div className="h-1.5 w-1 rounded-full bg-white/70" animate={{ y: [0, 14, 0] }} transition={{ duration: 2, repeat: Infinity }} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Section 2 — The Problem
   ───────────────────────────────────────────── */
function ProblemSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const lines = [
    { l: "You feel tired.", i: false },
    { l: "You don't know why.", i: true },
    { l: "You're working hard.", i: false },
    { l: "You're not recovering.", i: true },
    { l: "You're stressed.", i: false },
    { l: "You can't see what it's doing.", i: true },
  ];
  return (
    <section ref={ref} id="problem" className="relative overflow-hidden py-32 md:py-48" style={{ background: C.navy }}>
      <ParticleField density={50} opacity={0.25} />
      {/* ECG line */}
      <svg viewBox="0 0 1200 200" className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 w-full h-40 opacity-60">
        <motion.path
          d="M0,100 L200,100 L220,60 L240,140 L260,80 L280,120 L300,100 L500,100 L520,40 L540,160 L560,80 L580,110 L600,100 L900,100 L920,50 L940,150 L960,100 L1200,100"
          fill="none" stroke={C.blue} strokeWidth="2"
          initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}} transition={{ duration: 4, ease: "easeInOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${C.blue})` }}
        />
      </svg>
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="space-y-4 md:space-y-6 max-w-3xl mx-auto">
          {lines.map((ln, i) => (
            <div key={i} className={`text-2xl md:text-4xl lg:text-5xl font-extralight ${ln.i ? "text-white/60 md:pl-24" : "text-white"}`}>
              <Typewriter text={ln.l} delay={i * 600} />
            </div>
          ))}
        </div>
        <FadeUp delay={0.2} className="mt-16 max-w-2xl mx-auto text-white/60 text-base md:text-lg font-light space-y-1">
          <p>Your annual physical is once a year.</p>
          <p>Your doctor has 10 minutes.</p>
          <p>Nobody is watching.</p>
        </FadeUp>
        <FadeUp delay={0.5} className="mt-12">
          <motion.p
            className="text-3xl md:text-5xl font-light"
            style={{ color: C.blue, textShadow: `0 0 24px ${C.blue}88` }}
            animate={{ textShadow: [`0 0 24px ${C.blue}88`, `0 0 48px ${C.blue}`, `0 0 24px ${C.blue}88`] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Until now.
          </motion.p>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Section 3 — The Vitality Score
   ───────────────────────────────────────────── */
function VitalityScoreSection() {
  const orbitIcons = ["❤️", "🧠", "🌙", "🌡️"];
  return (
    <section id="how" className="relative overflow-hidden py-32 md:py-48" style={{ background: "linear-gradient(180deg, #0A1628 0%, #0F1F3A 50%, #0A1628 100%)" }}>
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left: score */}
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
                <div className="mt-1 text-xs md:text-sm text-white/50 tracking-widest">VITALITY SCORE</div>
              </div>
              {/* Orbit icons */}
              <motion.div className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
                {orbitIcons.map((ic, i) => {
                  const angle = (i / orbitIcons.length) * Math.PI * 2;
                  const x = 50 + 52 * Math.cos(angle);
                  const y = 50 + 52 * Math.sin(angle);
                  return (
                    <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border h-9 w-9 flex items-center justify-center text-base"
                      style={{ left: `${x}%`, top: `${y}%`, borderColor: `${C.blue}55`, background: "rgba(10,22,40,0.8)", boxShadow: `0 0 20px ${C.blue}33` }}>
                      {ic}
                    </div>
                  );
                })}
              </motion.div>
            </div>
            <div className="mt-8 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-white/80"><span className="h-2 w-2 rounded-full" style={{ background: C.green }} />You're ready <span className="text-white/40">(75+)</span></div>
              <div className="flex items-center gap-2 text-white/80"><span className="h-2 w-2 rounded-full" style={{ background: C.gold }} />Take it steady <span className="text-white/40">(50–74)</span></div>
              <div className="flex items-center gap-2 text-white/80"><span className="h-2 w-2 rounded-full bg-red-400" />Rest today <span className="text-white/40">(&lt; 50)</span></div>
            </div>
          </FadeUp>

          {/* Right: text */}
          <FadeUp delay={0.15}>
            <h2 className="text-4xl md:text-6xl font-extralight text-white leading-[1.05]">
              <WordStagger text="One number." /><br /><WordStagger text="Everything it means." delay={0.15} />
            </h2>
            <div className="mt-8 space-y-4 text-white/70 text-lg font-light">
              <p>Heart Rate. HRV. SpO₂.<br />Sleep. Recovery. Stress.<br />Temperature.</p>
              <p>All of it — compressed into a single score that greets you every morning.</p>
              <p><span className="text-white">High score</span> — go hard.<br /><span className="text-white">Low score</span> — your body needs rest.</p>
              <p className="text-white">Now you know.</p>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Section 4 — Track · Understand · Act
   ───────────────────────────────────────────── */
function TrackUnderstandActSection() {
  const cols = [
    { title: "TRACK", body: "Every metric.\nEvery moment.\n24 hours a day.", color: C.blue },
    { title: "UNDERSTAND", body: "One daily score.\nExactly where you stand.\nEvery single morning.", color: C.purple },
    { title: "ACT", body: "One action.\nBuilt for your body.\nAssigned every morning.", color: C.green },
  ];
  return (
    <section id="app" className="relative overflow-hidden py-32 md:py-48" style={{ background: C.navy }}>
      <ParticleField density={45} opacity={0.3} />
      <div className="container mx-auto px-6 relative z-10">
        <FadeUp className="text-center">
          <p className="text-xs md:text-sm tracking-[0.35em] text-white/50 uppercase">Other rings track. aiOn acts.</p>
        </FadeUp>

        <div className="mt-16 grid md:grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-6 md:gap-2">
          {cols.map((c, idx) => (
            <Fragment key={c.title}>
              <motion.div
                className="rounded-3xl border p-8 backdrop-blur-xl"
                style={{ borderColor: `${c.color}44`, background: "rgba(10,22,40,0.55)", boxShadow: `0 0 40px ${c.color}22` }}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.15, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="mb-6 flex items-center justify-center">
                  {c.title === "TRACK" && (
                    <motion.div className="h-16 w-16 rounded-full border-2" style={{ borderColor: c.color, borderRightColor: "transparent" }}
                      animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
                  )}
                  {c.title === "UNDERSTAND" && (
                    <svg width="64" height="64" viewBox="0 0 64 64">
                      {[[16,20],[32,16],[48,22],[20,36],[32,40],[46,36],[32,52]].map(([x,y],i)=>(
                        <motion.circle key={i} cx={x} cy={y} r="3" fill={c.color}
                          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                          transition={{ delay: 0.2 + i * 0.15, duration: 0.4 }} />
                      ))}
                      {[[16,20,32,16],[32,16,48,22],[16,20,20,36],[48,22,46,36],[20,36,32,40],[32,40,46,36],[32,40,32,52]].map(([x1,y1,x2,y2],i)=>(
                        <motion.line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c.color} strokeWidth="1"
                          initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 0.6 }} viewport={{ once: true }}
                          transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }} />
                      ))}
                    </svg>
                  )}
                  {c.title === "ACT" && (
                    <motion.svg width="56" height="64" viewBox="0 0 24 24" fill={c.color}
                      animate={{ opacity: [0.6, 1, 0.6], filter: [`drop-shadow(0 0 4px ${c.color})`, `drop-shadow(0 0 20px ${c.color})`, `drop-shadow(0 0 4px ${c.color})`] }}
                      transition={{ duration: 1.8, repeat: Infinity }}>
                      <path d="M13 2L4.09 12.97a1 1 0 00.78 1.63H11l-1.99 7.42a.5.5 0 00.9.36L20 11.4a1 1 0 00-.78-1.63H13.5L15 2.6a.5.5 0 00-.9-.36z"/>
                    </motion.svg>
                  )}
                </div>
                <h3 className="text-center text-xl md:text-2xl font-light tracking-[0.3em] text-white">{c.title}</h3>
                <p className="mt-4 whitespace-pre-line text-center text-white/60 text-sm md:text-base font-light leading-relaxed">{c.body}</p>
              </motion.div>
              {idx < cols.length - 1 && (
                <div className="hidden md:flex items-center justify-center">
                  <svg width="60" height="20" viewBox="0 0 60 20">
                    <motion.path d="M0 10 L52 10" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none"
                      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 + idx * 0.2 }} />
                    <motion.path d="M46 4 L54 10 L46 16" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none"
                      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1 + idx * 0.2 }} />
                  </svg>
                </div>
              )}
              {idx < cols.length - 1 && (
                <div className="md:hidden flex justify-center text-white/30">↓</div>
              )}
            </Fragment>
          ))}
        </div>

        <FadeUp delay={0.3} className="mt-16 text-center">
          <p className="text-xl md:text-2xl font-extralight text-white/80 max-w-2xl mx-auto">
            Most wearables stop at the data.<br /><span className="text-white">aiOn starts there.</span>
          </p>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Section 5 — Today's Quest
   ───────────────────────────────────────────── */
function QuestSection() {
  const quests = [
    { tag: "TODAY'S QUEST · HRV", title: "Box breathing", sub: "3 minutes · Activates your vagus nerve", progress: 0.4, metric: "🧠 HRV" },
    { tag: "TODAY'S QUEST · SLEEP", title: "No caffeine after 2pm", sub: "Improves deep sleep by up to 20%", progress: 0, metric: "🌙 Sleep" },
    { tag: "TODAY'S QUEST · STRESS", title: "10-minute walk outside", sub: "Cuts cortisol, clears your head", progress: 0.5, metric: "⚡ Stress" },
  ];
  return (
    <section className="relative overflow-hidden py-32 md:py-48" style={{ background: C.navy }}>
      {/* constellation */}
      <svg viewBox="0 0 1200 600" className="pointer-events-none absolute inset-0 h-full w-full opacity-30">
        {[[100,120],[300,80],[500,200],[750,120],[950,180],[1100,90],[200,400],[420,500],[680,420],[900,500],[1100,420]].map(([x,y],i)=>(
          <motion.circle key={i} cx={x} cy={y} r="2" fill={C.blue}
            initial={{ opacity: 0 }} whileInView={{ opacity: 0.8 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} />
        ))}
        {[[100,120,300,80],[300,80,500,200],[500,200,750,120],[750,120,950,180],[950,180,1100,90],[200,400,420,500],[420,500,680,420],[680,420,900,500]].map(([x1,y1,x2,y2],i)=>(
          <motion.line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.blue} strokeWidth="0.5"
            initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.5, delay: 0.4 + i * 0.15 }} />
        ))}
      </svg>

      <div className="container mx-auto px-6 relative z-10">
        <FadeUp className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-extralight text-white leading-[1.05]">
            <WordStagger text="The one thing you should do today." />
          </h2>
          <p className="mt-6 text-white/60 text-base md:text-lg font-light">
            Every morning, aiOn reads your last 7 days and assigns you one single health quest — built for your body, your metrics, your exact moment.
          </p>
        </FadeUp>

        <div className="mt-14 flex md:grid md:grid-cols-3 gap-5 overflow-x-auto md:overflow-visible snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
          {quests.map((q, i) => (
            <motion.div key={i}
              className="min-w-[85%] md:min-w-0 snap-center rounded-3xl border p-6 backdrop-blur-xl group cursor-pointer"
              style={{ borderColor: "rgba(79,179,255,0.25)", background: "rgba(10,22,40,0.55)" }}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.12 }}
              whileHover={{ y: -4, boxShadow: `0 0 60px ${C.blue}44` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] tracking-[0.25em] text-white/50">{q.tag}</span>
                <span className="rounded-full border px-2 py-0.5 text-[10px]" style={{ borderColor: `${C.gold}55`, color: C.gold }}>+50 XP</span>
              </div>
              <h3 className="mt-4 text-2xl font-light text-white">{q.title}</h3>
              <p className="mt-2 text-sm text-white/60">{q.sub}</p>
              <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${C.blue}, ${C.purple})` }}
                  initial={{ width: 0 }} whileInView={{ width: `${q.progress * 100}%` }} viewport={{ once: true }} transition={{ duration: 1.4, delay: 0.4 + i * 0.1 }} />
              </div>
              <div className="mt-4 flex justify-end">
                <Chip>{q.metric}</Chip>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Streak */}
        <FadeUp delay={0.2} className="mt-12 flex flex-col items-center">
          <div className="flex gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <motion.div key={i}
                className="h-4 w-4 rounded-full border"
                style={{ borderColor: `${C.blue}55` }}
                initial={{ background: "transparent" }}
                whileInView={{ background: i < 5 ? C.blue : "transparent", boxShadow: i < 5 ? `0 0 12px ${C.blue}` : "none" }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
              />
            ))}
          </div>
          <p className="mt-4 text-sm" style={{ color: C.gold }}>🔥 12-day streak</p>
        </FadeUp>

        <FadeUp delay={0.4} className="mt-16 text-center">
          <p className="italic text-lg md:text-xl text-white/70">This is health coaching.<br />Without the coach.</p>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Section 6 — XP & Levels
   ───────────────────────────────────────────── */
function XPLevelsSection() {
  const levels = ["Beginner", "Explorer", "Vitalist", "Optimizer", "Achiever", "Champion", "Elite", "Legend", "Immortal"];
  return (
    <section className="relative overflow-hidden py-32 md:py-48" style={{ background: "linear-gradient(180deg, #0A1628 0%, #0D1A32 100%)" }}>
      <ParticleField density={40} opacity={0.25} />
      <div className="container mx-auto px-6 relative z-10">
        <FadeUp className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-extralight text-white leading-[1.05]">
            <WordStagger text="Your health." /><br /><WordStagger text="Now with progress." delay={0.15} />
          </h2>
        </FadeUp>

        <div className="mt-16 grid md:grid-cols-2 gap-12 items-center">
          <FadeUp>
            <div className="rounded-3xl border p-6 backdrop-blur-xl" style={{ borderColor: `${C.purple}44`, background: "rgba(10,22,40,0.55)" }}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white">Level 8 · <span style={{ color: C.gold }}>ACHIEVER</span></span>
                <span className="text-white/60">2,340 XP</span>
              </div>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${C.blue}, ${C.purple})` }}
                  initial={{ width: 0 }} whileInView={{ width: "72%" }} viewport={{ once: true }} transition={{ duration: 2, ease: "easeOut" }} />
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-white/50">
                <span>→ Level 9 · PERFORMER</span>
                <span>488 XP away</span>
              </div>
            </div>
            <div className="mt-6 flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {levels.map((lv, i) => (
                <motion.div key={lv}
                  className="shrink-0 rounded-2xl border px-4 py-3 text-center min-w-[110px]"
                  style={{ borderColor: `${i === 4 ? C.gold : C.blue}55`, background: "rgba(10,22,40,0.6)" }}
                  initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1, boxShadow: `0 0 20px ${i === 4 ? C.gold : C.blue}33` }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
                >
                  <div className="text-xs text-white/50">LVL {i + 1}</div>
                  <div className="mt-1 text-sm text-white">{lv}</div>
                </motion.div>
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.15}>
            <div className="space-y-4 text-lg text-white/70 font-light">
              <p>Complete your daily quest.<br />Build your streak.<br />Level up.</p>
              <p className="text-white">Not just your score — your entire relationship with your health.</p>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Section 7 — Preventive Health
   ───────────────────────────────────────────── */
function PreventiveSection() {
  return (
    <section className="relative overflow-hidden py-32 md:py-56" style={{ background: C.navy }}>
      {/* sine wave background */}
      <svg viewBox="0 0 1200 400" className="pointer-events-none absolute inset-0 w-full h-full opacity-20">
        <motion.path
          d="M0,200 Q150,80 300,200 T600,200 T900,200 T1200,200"
          fill="none" stroke={C.blue} strokeWidth="1.5"
          animate={{ x: [0, -300, 0] }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        />
        <motion.path
          d="M-300,200 Q-150,80 0,200 T300,200 T600,200 T900,200"
          fill="none" stroke={C.blue} strokeWidth="1.5"
          animate={{ x: [0, 300, 0] }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        />
      </svg>

      <div className="container mx-auto px-6 relative z-10 text-center max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-extralight text-white leading-tight">
          <Typewriter text="Most health problems don't start on the day you feel them." speed={35} />
        </h2>
        <FadeUp delay={0.3} className="mt-14 space-y-4 text-white/60 text-lg font-light">
          <p>They start weeks before.</p>
          <p>In a HRV that quietly drops.<br />In a heart rate that slowly climbs.<br />In sleep that gets a little worse<br /><span className="text-white/40">— each night —</span><br />until one morning you feel it.</p>
        </FadeUp>
        <FadeUp delay={0.6} className="mt-14">
          <p className="text-2xl md:text-4xl font-light" style={{ color: C.blue, textShadow: `0 0 24px ${C.blue}66` }}>
            aiOn sees the pattern<br />before you feel the symptom.
          </p>
        </FadeUp>

        {/* Trend graph with alert */}
        <FadeUp delay={0.4} className="mt-16">
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
              ⚠️ Your HRV has dropped 22% this week
            </motion.div>
          </div>
        </FadeUp>

        <p className="mt-10 text-[10px] text-white/30 tracking-wider">
          Blood Pressure (EST) and Blood Glucose (EST) are estimates — not for medical diagnosis.
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Section 8 — Who It's For
   ───────────────────────────────────────────── */
function WhoItsForSection() {
  const cards = [
    { bg: "#0A1628", accent: C.blue, img: lifestyle4, text: "You're running hard. You want to know if your body is keeping up." },
    { bg: "#1A0A2E", accent: C.purple, img: lifestyle6, text: "You track everything. You want an AI that tells you what it means." },
    { bg: "#062929", accent: C.green, img: lifestyle8, text: "You don't want to be caught off guard by your own health." },
  ];
  return (
    <section className="relative overflow-hidden py-32 md:py-48" style={{ background: "linear-gradient(180deg, #0A1628 0%, #0E1B34 100%)" }}>
      <div className="container mx-auto px-6 relative z-10">
        <FadeUp>
          <p className="text-center text-xs md:text-sm tracking-[0.35em] text-white/50 uppercase">Built for you if —</p>
        </FadeUp>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {cards.map((c, i) => (
            <motion.div key={i}
              className="group relative h-[440px] overflow-hidden rounded-3xl border cursor-pointer"
              style={{ borderColor: `${c.accent}44`, background: c.bg }}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.12 }}
              whileHover={{ scale: 1.02, boxShadow: `0 0 60px ${c.accent}55` }}
            >
              <img src={c.img} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
              <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${c.bg}22 0%, ${c.bg}cc 65%, ${c.bg} 100%)` }} />
              <div className="relative flex h-full flex-col justify-end p-8">
                <p className="text-2xl md:text-3xl font-light text-white leading-snug">{c.text}</p>
                <p className="mt-6 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ color: c.accent }}>Sound like you?</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Section 9 — 12 Health Signals
   ───────────────────────────────────────────── */
function SignalsSection() {
  const signals = [
    { i: "❤️", l: "Heart Rate" }, { i: "🧠", l: "HRV" }, { i: "🫁", l: "SpO₂" }, { i: "🌡️", l: "Body Temp" },
    { i: "🌙", l: "Sleep" }, { i: "⚡", l: "Recovery" }, { i: "😮‍💨", l: "Stress Level" }, { i: "✨", l: "Vitality" },
    { i: "🩸", l: "BP (EST)", prem: true }, { i: "🍬", l: "Glucose (EST)", prem: true }, { i: "📉", l: "ECG", prem: true }, { i: "🤖", l: "AI Coach", prem: true },
  ];
  return (
    <section className="relative overflow-hidden py-32 md:py-48" style={{ background: C.navy }}>
      <ParticleField density={45} opacity={0.25} />
      <div className="container mx-auto px-6 relative z-10">
        <FadeUp className="text-center">
          <h2 className="text-4xl md:text-6xl font-extralight text-white leading-[1.05]">
            <WordStagger text="12 health signals." /><br /><WordStagger text="One ring." delay={0.15} />
          </h2>
        </FadeUp>
        <div className="mt-14 grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-5">
          {signals.map((s, i) => (
            <motion.div key={i}
              className="rounded-2xl border p-4 md:p-6 text-center backdrop-blur-xl group"
              style={{ borderColor: `${s.prem ? C.purple : C.blue}44`, background: "rgba(10,22,40,0.6)" }}
              initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ boxShadow: `0 0 40px ${s.prem ? C.purple : C.blue}55`, y: -3 }}
            >
              <div className="text-2xl md:text-3xl">{s.i}</div>
              <div className="mt-2 text-xs md:text-sm text-white/80 font-light">{s.l}</div>
              {s.prem && <div className="mt-1 text-[9px] tracking-widest" style={{ color: C.purple }}>PREMIUM</div>}
            </motion.div>
          ))}
        </div>
        <FadeUp delay={0.3} className="mt-8 text-center">
          <p className="text-[11px] text-white/40">* Premium plan · EST readings are not for medical diagnosis</p>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Section 10 — The Plans (no prices)
   ───────────────────────────────────────────── */
function PlansSection() {
  const plans = [
    { tag: "FREE WITH EVERY RING", name: "aiOn Vitals", accent: C.blue, features: ["Heart Rate · HRV", "SpO₂ · Temperature", "Sleep · Recovery", "Stress · Vitality Score", "Daily Quest · XP", "aiOn Vitals app"] },
    { tag: "MOST POPULAR", name: "aiOn Vitals + Insights", accent: C.purple, highlight: true, features: ["Everything in Vitals", "Insights · Trends", "Sleep Coaching", "Goal Tracking", "Full History"] },
    { tag: "MOST COMPLETE", name: "aiOn Vitals + Insights + Premium", accent: C.gold, features: ["Everything in Insights", "AI Coach", "Preventive Alerts", "BP (EST) · Glucose (EST)", "ECG", "Priority Support"] },
  ];
  return (
    <section className="relative overflow-hidden py-32 md:py-48" style={{ background: "linear-gradient(180deg, #0A1628 0%, #0F1F3A 50%, #0A1628 100%)" }}>
      <div className="container mx-auto px-6 relative z-10">
        <FadeUp className="text-center max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-extralight text-white leading-[1.05]">
            <WordStagger text="Start free." /><br /><WordStagger text="Unlock more when you're ready." delay={0.15} />
          </h2>
        </FadeUp>
        <div className="mt-16 grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((p, i) => (
            <motion.div key={i}
              className={`relative rounded-3xl border p-8 backdrop-blur-xl flex flex-col ${p.highlight ? "md:scale-105" : ""}`}
              style={{ borderColor: `${p.accent}66`, background: "rgba(10,22,40,0.6)", boxShadow: p.highlight ? `0 0 60px ${p.accent}44` : `0 0 20px ${p.accent}22` }}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.7 }}
            >
              <span className="self-start rounded-full border px-3 py-1 text-[10px] tracking-widest" style={{ borderColor: `${p.accent}88`, color: p.accent }}>{p.tag}</span>
              <h3 className="mt-4 text-2xl font-light text-white">{p.name}</h3>
              <ul className="mt-6 space-y-2 text-sm text-white/70 font-light flex-1">
                {p.features.map((f, j) => <li key={j} className="flex gap-2"><span style={{ color: p.accent }}>·</span>{f}</li>)}
              </ul>
              <Link to="/preorder" className="mt-8 inline-flex items-center justify-center rounded-full py-3 text-sm font-medium text-[#0A1628]"
                style={{ background: p.highlight ? `linear-gradient(120deg, ${C.blue}, ${C.purple})` : "rgba(255,255,255,0.9)" }}>
                Pre-order Now
              </Link>
            </motion.div>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-white/40">30-day free trial on all paid plans</p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Section 11 — The Ring (sticky scroll reveal)
   ───────────────────────────────────────────── */
function RingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const positions = [
    { title: "Titanium. PVD Coated.", body: "Built to last." },
    { title: "IP68 waterproof.", body: "Wear it everywhere." },
    { title: "The sensor that never stops.", body: "Heart Rate. HRV. SpO₂. Temperature. ECG." },
    { title: "Sizes 6 through 13.", body: "Find your fit." },
    { title: "5-day battery.", body: "Magnetic charging dock. Always ready." },
    { title: "Midnight Black.", body: "More colors and matte finish coming." },
  ];
  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      const idx = Math.min(positions.length - 1, Math.floor(v * positions.length));
      setActiveIdx(idx);
    });
  }, [scrollYProgress]);
  const rot = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const [selectedSize, setSelectedSize] = useState(9);

  return (
    <section id="ring" ref={ref} className="relative" style={{ background: "linear-gradient(180deg, #0A1628 0%, #0E1B34 100%)", height: `${positions.length * 90}vh` }}>
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <ParticleField density={40} opacity={0.2} />
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-10 items-center relative z-10">
          <motion.div className="relative mx-auto aspect-square w-[min(80vw,500px)]" style={{ rotate: rot }}>
            <div className="absolute inset-0 rounded-full" style={{ boxShadow: `0 0 100px ${C.blue}44` }} />
            <img src={ringProduct} alt="aiOn ring" className="h-full w-full rounded-full object-cover" style={{ mixBlendMode: "screen", filter: "drop-shadow(0 0 30px rgba(79,179,255,0.5))" }} />
          </motion.div>
          <div>
            <p className="text-xs tracking-[0.35em] text-white/40 uppercase">The Ring · {activeIdx + 1} / {positions.length}</p>
            <AnimatePresence mode="wait">
              <motion.div key={activeIdx}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}
              >
                <h3 className="mt-4 text-3xl md:text-5xl font-extralight text-white">{positions[activeIdx].title}</h3>
                <p className="mt-4 text-lg text-white/60 font-light">{positions[activeIdx].body}</p>
                {activeIdx === 3 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {[6,7,8,9,10,11,12,13].map(s => (
                      <button key={s} onClick={() => setSelectedSize(s)}
                        className="h-10 w-10 rounded-full border text-sm transition"
                        style={{
                          borderColor: selectedSize === s ? C.blue : "rgba(255,255,255,0.25)",
                          background: selectedSize === s ? `${C.blue}33` : "transparent",
                          color: selectedSize === s ? C.blue : "rgba(255,255,255,0.7)",
                          boxShadow: selectedSize === s ? `0 0 20px ${C.blue}66` : "none",
                        }}>{s}</button>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            {/* progress dots */}
            <div className="mt-8 flex gap-2">
              {positions.map((_, i) => (
                <div key={i} className="h-1 flex-1 rounded-full overflow-hidden bg-white/10">
                  <div className="h-full transition-all duration-500" style={{ width: i <= activeIdx ? "100%" : "0%", background: C.blue }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Section 12 — Credibility
   ───────────────────────────────────────────── */
function CredibilitySection() {
  return (
    <section className="relative overflow-hidden py-32 md:py-48" style={{ background: C.navy }}>
      {/* network graph */}
      <svg viewBox="0 0 1200 600" className="pointer-events-none absolute inset-0 h-full w-full opacity-20">
        {Array.from({ length: 20 }).map((_, i) => {
          const x = (i * 137) % 1200;
          const y = (i * 89) % 600;
          return <motion.circle key={i} cx={x} cy={y} r="2" fill={C.blue}
            initial={{ opacity: 0 }} whileInView={{ opacity: 0.6 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} />;
        })}
        {Array.from({ length: 15 }).map((_, i) => {
          const x1 = (i * 137) % 1200, y1 = (i * 89) % 600;
          const x2 = ((i + 3) * 137) % 1200, y2 = ((i + 3) * 89) % 600;
          return <motion.line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.blue} strokeWidth="0.3"
            initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.5, delay: 0.3 + i * 0.08 }} />;
        })}
      </svg>
      <div className="container mx-auto px-6 relative z-10 text-center max-w-3xl">
        <FadeUp>
          <h2 className="text-3xl md:text-5xl font-extralight text-white leading-tight">
            <WordStagger text="Built by people who know what's possible." />
          </h2>
        </FadeUp>
        <FadeUp delay={0.2} className="mt-8 space-y-4 text-white/60 font-light text-lg">
          <p>A healthcare technology team with over a decade of experience in AI, health systems, and platforms serving millions of patients.</p>
          <p>We built aiOn because we know what health data looks like when it's used well.</p>
          <p>And what's lost when it isn't.</p>
        </FadeUp>
        <FadeUp delay={0.4} className="mt-12">
          <p className="text-xs text-white/40 tracking-widest">aiOn Health Science LLC · Ashburn, Virginia</p>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Section 13 — Final CTA
   ───────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-32 md:py-56 min-h-[90svh] flex items-center" style={{ background: C.navy }}>
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
          <p className="mt-6 text-xs md:text-sm text-white/50">
            Free aiOn Vitals app · Sizes 6–13 · Ships Q3 2026 · Midnight Black · More colors coming
          </p>
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
        <ProblemSection />
        <VitalityScoreSection />
        <TrackUnderstandActSection />
        <QuestSection />
        <XPLevelsSection />
        <PreventiveSection />
        <WhoItsForSection />
        <SignalsSection />
        <PlansSection />
        <RingSection />
        <CredibilitySection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
