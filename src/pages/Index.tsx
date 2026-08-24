import { useEffect, useRef, useState, ReactNode } from "react";
import { motion, AnimatePresence, useInView, useMotionValue, useSpring } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ringHero from "@/assets/ring-hero-v2.png";
import ringProduct from "@/assets/ring-product.jpg";
import heroFingerRing from "@/assets/hero-finger-ring.png";
import heroFingerVideo from "@/assets/hero-finger-ring-video.mp4.asset.json";
import appScreenVitality from "@/assets/app-screen-vitality.png";
import appScreenQuest from "@/assets/app-screen-quest.png";
import appScreenSleep from "@/assets/app-screen-sleep.png";
import videoMorning from "@/assets/video-life-morning-new.mp4.asset.json";
import videoWalk from "@/assets/video-life-walk-new.mp4.asset.json";
import videoFocus from "@/assets/video-life-focus-silver.mp4.asset.json";
import ringMidnight from "@/assets/ring-finish-midnight.png";
import ringSilver from "@/assets/ring-finish-silver.png";
import ringRose from "@/assets/ring-finish-rose.png";
import videoEvening from "@/assets/video-life-evening-new.mp4.asset.json";
import natureSunrise from "@/assets/nature-sunrise-ridge.jpg";
import natureForest from "@/assets/nature-forest-trail.jpg";
import natureWater from "@/assets/nature-calm-water.jpg";
import natureNight from "@/assets/nature-restful-night.jpg";
import videoRunTrail from "@/assets/video-run-trail.mp4.asset.json";


/* ─────────────────────────────────────────────
   Brand reveal — "ai · O(ring) · n" draws itself in
   ───────────────────────────────────────────── */
function BrandReveal() {
  const letter = {
    hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)" },
  };
  return (
    <motion.div
      className="mb-8 flex flex-col items-center md:mb-10"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.18, delayChildren: 0.15 } } }}
    >
      <div className="flex items-center gap-[0.06em] text-5xl font-extralight tracking-[-0.02em] text-ink sm:text-6xl md:text-7xl">
        <motion.span variants={letter} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          ai
        </motion.span>

        {/* The O is the ring — drawn stroke + soft pulse */}
        <span className="relative inline-block" style={{ width: "0.86em", height: "0.86em" }}>
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <linearGradient id="brandRevealRing" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00A9E0" />
                <stop offset="55%" stopColor="#1878E0" />
                <stop offset="100%" stopColor="#6D28D9" />
              </linearGradient>
            </defs>
            <motion.circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="url(#brandRevealRing)"
              strokeWidth="8"
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
          <motion.span
            className="absolute inset-0 rounded-full"
            animate={{ opacity: [0.35, 0, 0.35], scale: [1, 1.12, 1] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
            style={{ boxShadow: "0 0 32px 6px rgba(24,120,224,0.28)" }}
          />
        </span>

        <motion.span variants={letter} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          n
        </motion.span>
      </div>

      <motion.span
        className="mt-3 text-[10px] uppercase tracking-[0.42em] text-ink-muted sm:text-xs"
        initial={{ opacity: 0, letterSpacing: "0.9em" }}
        animate={{ opacity: 1, letterSpacing: "0.42em" }}
        transition={{ duration: 1.4, delay: 1.5, ease: [0.22, 1, 0.36, 1] }}
      >
        Vital · Life · Force
      </motion.span>
    </motion.div>
  );
}


/* ─────────────────────────────────────────────
   Brand tokens (inline, no CSS var changes)
   ───────────────────────────────────────────── */
const C = {
  navy: "#0A1628",
  blue: "#1878E0",
  purple: "#6D28D9",
  green: "#22B07D",
  gold: "#B4870B",
};

/* Rotating insight line over the hero video */
function HeroInsightTicker() {
  const lines = [
    "Recovery is trending up — your body is ready for more today.",
    "Resting heart rate steady overnight. Nice consistency.",
    "Sleep quality improved 12% this week.",
    "Breathing regularity high — a calm night of rest.",
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((p) => (p + 1) % lines.length), 3800);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1 backdrop-blur-sm sm:px-4 sm:py-1.5">
      <AnimatePresence mode="wait">
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.5 }}
          className="whitespace-nowrap text-[10px] sm:text-xs"
          style={{ color: "rgba(255,255,255,0.82)" }}
        >
          {lines[i]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Shared rhythm tokens
   ───────────────────────────────────────────── */
const SECTION = "py-20 md:py-32";

/* Video that only plays while visible — saves CPU and battery */
function LazyVideo({
  src,
  poster,
  className = "",
  style,
  label,
  autoPlay = false,
}: {
  src: string;
  poster?: string;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
  autoPlay?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.15 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      autoPlay={autoPlay}
      muted
      loop
      playsInline
      preload={autoPlay ? "metadata" : "none"}
      aria-label={label}
      className={className}
      style={style}
    />
  );
}

/* Monoline icon set — one consistent visual language, no emoji */
const GLYPHS: Record<string, ReactNode> = {
  heart: <path d="M12 20s-7-4.4-7-9.3A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 7 3.3C19 15.6 12 20 12 20z" />,
  moon: <path d="M20 14.4A8 8 0 1 1 9.6 4 6.5 6.5 0 0 0 20 14.4z" />,
  cycle: (
    <>
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20 4v4h-4" />
    </>
  ),
  bolt: <path d="M13 3 5.8 13.6H11l-.8 7.4 8-10.9h-5.4z" />,
  waves: <path d="M3 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0" />,
  drop: <path d="M12 3.4s6 6.4 6 9.9a6 6 0 0 1-12 0c0-3.5 6-9.9 6-9.9z" />,
  hex: <path d="M12 3.2 20 7.6v8.8L12 20.8 4 16.4V7.6z" />,
  battery: (
    <>
      <rect x="3" y="8" width="15" height="8" rx="2" />
      <path d="M21 11v2" />
    </>
  ),
  signal: (
    <>
      <path d="M8.5 15a5 5 0 0 1 7 0" />
      <path d="M5.5 12a9 9 0 0 1 13 0" />
      <circle cx="12" cy="18" r="0.8" />
    </>
  ),
  ruler: (
    <>
      <path d="M4 14.5 14.5 4 20 9.5 9.5 20z" />
      <path d="M9 9.5 10.8 11.3M12 6.5l1.8 1.8M6.5 12l1.8 1.8" />
    </>
  ),
  finishes: (
    <>
      <circle cx="8" cy="12" r="4" />
      <circle cx="16" cy="12" r="4" />
    </>
  ),
  water: (
    <>
      <path d="M3 15c2.2-2 4.3-2 6.5 0s4.3 2 6.5 0 4.3-2 5 -.6" />
      <path d="M3 19c2.2-2 4.3-2 6.5 0s4.3 2 6.5 0 4.3-2 5 -.6" />
      <path d="M12 3v6" />
    </>
  ),
};

function Glyph({ name, className = "h-6 w-6", color = C.blue }: { name: string; className?: string; color?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke={color}
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {GLYPHS[name]}
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Particle field — slow drifting stars
   ───────────────────────────────────────────── */
function ParticleField({ density = 60, opacity = 0.35, tone = "dark" }: { density?: number; opacity?: number; tone?: "dark" | "light" }) {
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
        ctx.fillStyle = tone === "light" ? `rgba(230, 240, 255, ${p.a * opacity})` : `rgba(24, 60, 110, ${p.a * opacity})`;
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
  }, [density, opacity, tone]);
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
function GridOverlay({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const line = tone === "light" ? "rgba(255,255,255,0.6)" : "rgba(10,22,40,0.08)";
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.5]"
      style={{
        backgroundImage:
          `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
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
function Chip({ children, className = "", variant = "dark" }: { children: ReactNode; className?: string; variant?: "dark" | "light" }) {
  const isDark = variant === "dark";
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs sm:text-sm font-light backdrop-blur-md ${className}`}
      style={{
        borderColor: isDark ? "rgba(79,179,255,0.35)" : "rgba(24,120,224,0.22)",
        background: isDark ? "rgba(10,22,40,0.55)" : "rgba(255,255,255,0.72)",
        boxShadow: isDark ? `0 0 24px rgba(79,179,255,0.15)` : `0 4px 20px rgba(10,22,40,0.06)`,
        color: isDark ? "#e6f2ff" : "#0A1628",
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Nature layer — organic backdrops & bands
   ───────────────────────────────────────────── */
function NatureBackdrop({
  src,
  opacity = 0.18,
  position = "center",
  tone = "light",
}: { src: string; opacity?: number; position?: string; tone?: "light" | "dark" }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <img
        src={src}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover"
        style={{ objectPosition: position, opacity, filter: "saturate(0.85)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            tone === "light"
              ? "linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.80) 40%, rgba(255,255,255,0.94) 100%)"
              : "linear-gradient(180deg, rgba(10,22,40,0.86) 0%, rgba(10,22,40,0.72) 45%, rgba(10,22,40,0.92) 100%)",
        }}
      />
    </div>
  );
}

function NatureBand({
  src,
  eyebrow,
  title,
  line,
  position = "center",
}: { src: string; eyebrow: string; title: string; line: string; position?: string }) {
  return (
    <section className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden">
      <div className="relative h-[62vh] md:h-[78vh]">
        <motion.img
          src={src}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: position }}
          initial={{ scale: 1.08 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(10,22,40,0.55) 0%, rgba(10,22,40,0.10) 60%, rgba(10,22,40,0) 75%), linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(10,22,40,0.20) 26%, rgba(10,22,40,0.45) 70%, rgba(255,255,255,0.96) 100%)",
          }}
        />
        <div className="relative z-10 flex h-full items-center justify-center px-6">
          <FadeUp className="text-center max-w-2xl">
            <p className="text-[11px] tracking-[0.38em] uppercase text-white/70">{eyebrow}</p>
            <h2 className="mt-4 text-3xl md:text-5xl font-extralight text-white leading-[1.1]" style={{ textShadow: "0 4px 40px rgba(10,22,40,0.55)" }}>
              {title}
            </h2>
            <p className="mt-5 text-base md:text-lg font-light text-white/80">{line}</p>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}


/* ─────────────────────────────────────────────
   Hero
   ───────────────────────────────────────────── */
function Hero() {
  const vitals = [
    { l: "HR", v: "62 bpm" },
    { l: "HRV", v: "74 ms" },
    { l: "SpO₂", v: "98%" },
    { l: "Temp", v: "36.7°" },
    { l: "Sleep", v: "87" },
  ];
  const finishes = [
    { src: ringMidnight, name: "Midnight" },
    { src: ringSilver, name: "Silver" },
    { src: ringRose, name: "Rose Gold" },
  ];

  return (
    <section className="relative overflow-hidden bg-canvas">
      {/* Luminous light washes */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 45% at 50% 0%, rgba(24,120,224,0.10) 0%, transparent 60%), radial-gradient(ellipse 55% 40% at 12% 78%, rgba(0,169,224,0.07) 0%, transparent 60%)`,
        }}
      />
      <GridOverlay tone="dark" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pt-28 pb-20 md:pt-36 md:pb-28">
        {/* Brand reveal */}
        <BrandReveal />

        {/* Headline */}
        <div className="mx-auto max-w-4xl text-center">
          <motion.h1
            className="text-4xl font-extralight leading-[1.06] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.16 } } }}
          >
            <motion.span
              variants={{ hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="block text-ink"
            >
              Your body has been talking.
            </motion.span>
            <motion.span
              variants={{ hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="block bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(120deg, ${C.blue}, ${C.purple})` }}
            >
              You just couldn't hear it.
            </motion.span>
          </motion.h1>
          <motion.p
            className="mx-auto mt-6 max-w-xl text-base font-light text-ink-soft md:text-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
          >
            A titanium smart ring that turns sleep, recovery and stress into one clear answer
            each morning.
          </motion.p>
        </div>

        {/* CTA — placed above the fold, before the cinematic proof */}
        <motion.div
          className="mt-9 flex flex-col items-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          <Link
            to="/preorder"
            className="group relative inline-flex items-center justify-center rounded-full px-10 py-4 text-base font-medium text-white transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ background: `linear-gradient(120deg, ${C.blue}, ${C.purple})`, boxShadow: `0 14px 40px -10px ${C.blue}66` }}
          >
            Pre-order Now
          </Link>
          <p className="mt-3 text-xs text-ink-muted md:text-sm">Free aiOn app included · No subscription required</p>
        </motion.div>

        {/* Cinematic proof — one video, edge-blended, no frame */}
        <motion.div
          className="relative mt-12 w-full md:mt-16"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative overflow-hidden rounded-[28px]">
            <LazyVideo
              autoPlay
              src={heroFingerVideo.url}
              poster={heroFingerRing}
              label="Close-up of a hand wearing the aiOn smart ring, sensors glowing"
              className="h-[260px] w-full object-cover sm:h-[360px] md:h-[460px] lg:h-[540px]"
              style={{ filter: "contrast(1.04) saturate(1.03)" }}
            />

            {/* Soft edge blend into the light page — removes the "box" */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `
                  linear-gradient(to bottom, hsl(var(--canvas)) 0%, transparent 16%, transparent 80%, hsl(var(--canvas)) 100%),
                  linear-gradient(to right, hsl(var(--canvas)) 0%, transparent 10%, transparent 90%, hsl(var(--canvas)) 100%)
                `,
              }}
            />

            {/* Live vitals rail */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 px-4 pb-4 sm:gap-x-8 md:pb-6">
              {vitals.map((m, i) => (
                <motion.span
                  key={m.l}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1, duration: 0.6 }}
                  className="flex items-baseline gap-1.5 text-[11px] tracking-wide sm:text-sm"
                >
                  <span style={{ color: "rgba(255,255,255,0.72)" }}>{m.l}</span>
                  <span style={{ color: "#fff", fontVariantNumeric: "tabular-nums" }}>{m.v}</span>
                </motion.span>
              ))}
            </div>

            {/* Rotating insight line */}
            <div className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 sm:top-6">
              <HeroInsightTicker />
            </div>
          </div>
        </motion.div>

        {/* Three finishes — colour balance right at the top */}
        <motion.div
          className="mt-10 flex items-center justify-center gap-8 sm:gap-12"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          {finishes.map((f) => (
            <a key={f.name} href="#ring" className="group flex flex-col items-center">
              <img
                src={f.src}
                alt={`aiOn ring, ${f.name} finish`}
                loading="lazy"
                className="h-14 w-14 object-contain transition-transform duration-500 group-hover:scale-110 sm:h-16 sm:w-16"
              />
              <span className="mt-2 text-[10px] uppercase tracking-[0.24em] text-ink-muted">{f.name}</span>
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Section 2}

/* ─────────────────────────────────────────────
   Section 2 — One Number
   ───────────────────────────────────────────── */
function VitalityScoreSection() {
  return (
    <section id="how" className={`relative overflow-hidden bg-white ${SECTION}`}>
      <NatureBackdrop src={natureSunrise} opacity={0.3} position="center 40%" />
      <div className="container mx-auto px-6 relative z-10">

        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <FadeUp>
            <div className="relative mx-auto h-72 w-72 md:h-96 md:w-96">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="44" stroke="rgba(10,22,40,0.10)" strokeWidth="3" fill="none" />
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
                <div className="text-6xl md:text-7xl font-extralight text-ink"><CountUp to={84} /></div>
                <div className="mt-1 text-xs md:text-sm text-ink-muted tracking-widest">YOUR VITALITY SCORE</div>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-ink-soft">
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
            <h2 className="text-4xl md:text-6xl font-extralight text-ink leading-[1.05]">
              <WordStagger text="Wake up knowing" /><br /><WordStagger text="your number." delay={0.15} />
            </h2>
            <div className="mt-8 space-y-3 text-ink-soft text-lg font-light">
              <p>Heart Rate. HRV. Sleep.<br />Stress. Recovery. SpO₂.</p>
              <p className="text-ink font-normal">One score. Every morning.</p>
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
    <section id="approach" className={`relative overflow-hidden bg-canvas ${SECTION}`}>
      <ParticleField density={45} opacity={0.18} tone="dark" />
      <div className="container mx-auto px-6 relative z-10">
        <FadeUp className="text-center">
          <div className="mx-auto mb-4 h-3 w-3 rounded-full" style={{ background: C.blue, boxShadow: `0 0 24px ${C.blue}, 0 0 60px ${C.blue}88` }} />
          <p className="text-xs md:text-sm tracking-[0.35em] text-ink-muted uppercase">
            Other rings track. aiOn acts.
          </p>
        </FadeUp>

        <div className="mt-14 grid md:grid-cols-3 gap-6 md:gap-4 items-stretch relative">
          {cols.map((c, idx) => (
            <div key={c.title} className="relative flex">
              <motion.div
                className="w-full rounded-3xl border backdrop-blur-xl p-8 md:p-10 text-center flex flex-col items-center"
                style={{ borderColor: "#E3E9F2", background: "#FFFFFF", boxShadow: `0 20px 50px -20px ${c.color}33` }}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.15, ease: [0.22, 1, 0.36, 1] }}
              >
                <div style={{ filter: `drop-shadow(0 0 12px ${c.color}88)` }}>{c.icon}</div>
                <h3 className="mt-6 text-2xl md:text-3xl font-light tracking-[0.35em] text-ink">
                  {c.title}
                </h3>
                <div className="mt-6 space-y-1 text-ink-muted text-sm md:text-base font-light">
                  {c.lines.map((l, i) => <p key={i}>{l}</p>)}
                </div>
              </motion.div>
              {idx < cols.length - 1 && (
                <motion.div
                  aria-hidden
                  className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 items-center justify-center text-ink-muted"
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
          <p className="text-xl md:text-2xl font-extralight text-ink-soft leading-relaxed">
            Most wearables stop at the data.<br />
            <span className="text-ink font-light">aiOn starts there.</span>
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
    <section className={`relative overflow-hidden bg-white ${SECTION}`}>
      <ParticleField density={30} opacity={0.12} tone="dark" />
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
                className={`relative text-3xl md:text-5xl font-extralight leading-tight ${l.strong ? "text-ink" : "text-ink-muted"}`}
              >
                {l.text}
              </p>
            </motion.div>
          ))}
        </div>

        <FadeUp delay={0.4} className="mt-20 space-y-2 text-ink-muted text-sm md:text-base font-light">
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
    { icon: "❤️", name: "Heart & Circulation", line: "Resting HR · HRV · Rhythm insight · BP trend (EST)", bullets: [
      "HRV — a simple daily read on stress and resilience",
      "Heart rhythm insight — wellness awareness, on demand",
      "BP trend (EST) — general direction, not a reading",
    ]},
    { icon: "🌙", name: "Sleep", line: "Stages · SpO₂ · Breathing · Temperature", bullets: [
      "Deep, REM, Light — every stage, every night",
      "Breathing rate trends while you sleep",
      "7 hours in bed is not 7 hours of sleep",
    ]},
    { icon: "🌸", name: "Women's Health", line: "Cycle · Ovulation · Phase coaching", bullets: [
      "Automatic cycle tracking from temperature and HRV",
      "Each phase has different energy and recovery needs",
      "aiOn's quests adapt to where you are",
    ]},
    { icon: "💪", name: "Active & Recovery", line: "Recovery · Strain · VO₂ Max", bullets: [
      "Know when to go hard and when to rest",
      "Training load awareness before you feel drained",
      "The workout doesn't make you stronger. Recovery does.",
    ]},
    { icon: "🧠", name: "Stress & Balance", line: "Daily stress · HRV · Recovery balance", bullets: [
      "See how a busy day shows up in your body",
      "Spot the weeks you've been pushing too hard",
      "Stress is easy to ignore until you can see it",
    ]},
    { icon: "🩸", name: "Metabolic Wellness", line: "Glucose trend (EST) · BP trend (EST)", bullets: [
      "Follow long-term lifestyle trends, not single numbers",
      "EST trends show direction — they are not measurements",
      "Build habits around how your body responds",
    ]},
  ];
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="signals" className="relative overflow-hidden py-16 md:py-48 bg-canvas">
      <NatureBackdrop src={natureForest} opacity={0.22} position="center 55%" />
      <ParticleField density={35} opacity={0.12} tone="dark" />
      <div className="container mx-auto px-6 relative z-10">
        <FadeUp className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-extralight text-ink leading-[1.05]">
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
                  borderColor: isOpen ? C.blue : "#E3E9F2",
                  background: "#FFFFFF",
                  boxShadow: isOpen ? `0 20px 50px -20px ${C.blue}55` : "0 1px 2px rgba(10,22,40,0.04)",
                }}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.06 }}
                whileHover={{ y: -3, boxShadow: `0 20px 50px -20px ${C.blue}44` }}
              >
                <div className="text-3xl">{p.icon}</div>
                <h3 className="mt-3 text-xl font-light text-ink">{p.name}</h3>
                <p className="mt-2 text-sm text-ink-muted font-light">{p.line}</p>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.ul
                      className="mt-4 space-y-2 text-sm text-ink-soft font-light overflow-hidden"
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
                <p className="mt-4 text-[10px] tracking-widest text-ink-muted">
                  {isOpen ? "TAP TO CLOSE" : "TAP TO EXPAND"}
                </p>
              </motion.button>
            );
          })}
        </div>
        <p className="mt-10 text-center text-[11px] text-ink-muted max-w-xl mx-auto">
          aiOn Ring is intended for general wellness purposes only and is not a medical device.
          Blood Pressure (EST) and Blood Glucose (EST) are non-medical wellness estimates and are
          not intended to diagnose, treat, cure, or prevent any disease or medical condition.
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
    <section className="relative overflow-hidden py-16 md:py-48 bg-white">
      <NatureBackdrop src={natureWater} opacity={0.24} position="center 60%" />
      <div className="container mx-auto px-6 relative z-10">
        <FadeUp className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-extralight text-ink leading-[1.05]">
            <WordStagger text="The one thing" /><br /><WordStagger text="you should do today." delay={0.15} />
          </h2>
          <p className="mt-6 text-ink-soft text-base md:text-lg font-light">
            Every morning. Built for your body.<br />Based on your last 7 days.
          </p>
        </FadeUp>

        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {quests.map((q, i) => (
            <motion.div key={i}
              className="rounded-3xl border p-6 backdrop-blur-xl"
              style={{ borderColor: "#E3E9F2", background: "#FFFFFF", boxShadow: "0 20px 50px -25px rgba(10,22,40,0.25)" }}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.12 }}
            >
              <span className="text-[10px] tracking-[0.25em] text-ink-muted">TODAY'S QUEST · {q.tag}</span>
              <h3 className="mt-4 text-2xl font-light text-ink">{q.title}</h3>
              <div className="mt-6 flex justify-end">
                <Chip>{q.metric}</Chip>
              </div>
            </motion.div>
          ))}
        </div>

        <FadeUp delay={0.3} className="mt-12 text-center">
          <p className="text-base md:text-lg text-ink-soft font-light">
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
    <section id="the-app" className="relative overflow-hidden py-16 md:py-40 bg-canvas">
      <ParticleField density={30} opacity={0.12} tone="dark" />
      <div className="container mx-auto px-6 relative z-10">
        <FadeUp className="text-center max-w-3xl mx-auto">
          <p className="text-xs md:text-sm tracking-[0.35em] text-ink-muted uppercase">The app</p>
          <h2 className="mt-4 text-4xl md:text-6xl font-extralight text-ink leading-[1.05]">
            Your body, on screen.
          </h2>
          <p className="mt-6 text-ink-soft text-base md:text-lg font-light">
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
              <p className="mt-6 text-sm md:text-base text-ink-muted font-light tracking-wide">
                {s.caption}
              </p>
            </motion.div>
          ))}
        </div>

        <FadeUp delay={0.3} className="mt-14 text-center">
          <p className="text-sm md:text-base text-ink-muted font-light">
            Free with every ring. iOS &amp; Android.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   In life — lifestyle video strip
   ───────────────────────────────────────────── */
function InLifeSection() {
  const clips = [
    { src: (videoMorning as { url: string }).url, label: "Morning", caption: "Gentle start" },
    { src: (videoFocus as { url: string }).url, label: "Focus", caption: "Slow mornings" },
    { src: (videoEvening as { url: string }).url, label: "Rest", caption: "Wind down" },
  ];
  return (
    <section id="in-life" className="relative overflow-hidden py-16 md:py-32 bg-canvas">
      <NatureBackdrop src={natureNight} opacity={0.16} position="center 45%" />
      <div className="container mx-auto px-6 relative z-10">
        <FadeUp className="text-center max-w-3xl mx-auto">
          <p className="text-xs md:text-sm tracking-[0.35em] text-ink-muted uppercase">In life</p>
          <h2 className="mt-4 text-4xl md:text-6xl font-extralight text-ink leading-[1.05]">
            Worn, not watched.
          </h2>
          <p className="mt-6 text-ink-soft text-base md:text-lg font-light">
            From the first run to the last hour of sleep — aiOn simply stays with you.
          </p>
        </FadeUp>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {clips.map((c, i) => (
            <motion.figure
              key={c.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-2xl md:rounded-3xl"
              style={{ boxShadow: "0 24px 60px -30px rgba(10,22,40,0.18)" }}
            >
              <video
                src={c.src}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={`${c.caption} — person wearing the aiOn ring`}
                className="w-full h-[300px] md:h-[380px] object-cover transition-transform duration-[1200ms] group-hover:scale-[1.03]"
                style={{ filter: "contrast(1.03) saturate(0.95)" }}
              />
              <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,22,40,0) 50%, rgba(10,22,40,0.55) 100%)" }} />
              <figcaption className="absolute bottom-5 left-5 right-5 flex items-baseline justify-between">
                <span className="text-white text-lg font-light tracking-wide">{c.label}</span>
                <span className="text-white/75 text-xs tracking-[0.2em] uppercase">{c.caption}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Section 6 — Trends
   ───────────────────────────────────────────── */
function PreventiveSection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-40" style={{ background: "#FFFFFF" }}>
      <div className="container mx-auto px-6 relative z-10 text-center max-w-3xl">
        <FadeUp>
          <div className="relative rounded-3xl border p-6 backdrop-blur-xl mx-auto max-w-2xl" style={{ borderColor: `${C.blue}22`, background: "linear-gradient(180deg,#0A1628,#0E1B34)", boxShadow: "0 30px 70px -35px rgba(10,22,40,0.45)" }}>
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
              style={{ borderColor: `${C.gold}66`, background: "rgba(10,22,40,0.92)", color: C.gold }}
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 2.5, duration: 0.6 }}
            >
              Your HRV trend is 22% below your usual range
            </motion.div>
          </div>
        </FadeUp>
        <FadeUp delay={0.4} className="mt-14">
          <h2 className="text-3xl md:text-5xl font-extralight text-ink leading-tight">
            The trend showed on Day 11.<br />
            <span className="text-ink-muted">You noticed on Day 14.</span>
          </h2>
          <p className="mt-6 text-lg md:text-xl font-light" style={{ color: C.blue, textShadow: `0 0 24px ${C.blue}66` }}>
            Wellness trends, made visible.
          </p>
          <p className="mt-4 text-xs text-ink-muted max-w-md mx-auto">
            Trend information is for general wellness and informational purposes only.
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
    { icon: "◍", label: "3 finishes" },
  ];
  return (
    <section id="ring" className="relative overflow-hidden py-16 md:py-24" style={{ background: "linear-gradient(180deg,#FFFFFF 0%, #F6F8FC 100%)" }}>
      <div className="container mx-auto px-6 relative z-10">
        <FadeUp className="text-center mb-8 md:mb-12">
          <p className="text-xs tracking-[0.3em] text-ink-muted uppercase">The Ring</p>
        </FadeUp>
      </div>

      {/* Full-bleed lifestyle ring image — no frame, no border */}
      <FadeUp>
        <div className="relative w-screen left-1/2 -translate-x-1/2">
          <img
            src={ringProduct}
            alt="aiOn ring"
            className="w-full h-[55vh] sm:h-[65vh] md:h-[75vh] object-cover object-center"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 65%, rgba(255,255,255,0.92) 100%)`,
            }}
          />
        </div>
      </FadeUp>

      <div className="container mx-auto px-6 relative z-10">
        <div className="relative mt-10 md:mt-14 grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6 max-w-4xl mx-auto">
          {specs.map((s, i) => (
            <motion.div key={i}
              className="text-center"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <div className="text-3xl md:text-4xl">{s.icon}</div>
              <div className="mt-2 text-xs md:text-sm text-ink-soft font-light">{s.label}</div>
            </motion.div>
          ))}
        </div>
        {/* Three finishes */}
        <div className="relative mt-16 md:mt-24 max-w-5xl mx-auto">
          <FadeUp className="text-center">
            <p className="text-xs tracking-[0.3em] text-ink-muted uppercase">Finishes</p>
            <h3 className="mt-3 text-3xl md:text-4xl font-extralight text-ink">Three ways to wear it.</h3>
          </FadeUp>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10">
            {[
              { src: ringMidnight, name: "Midnight", note: "Matte titanium" },
              { src: ringSilver, name: "Silver", note: "Brushed titanium" },
              { src: ringRose, name: "Rose Gold", note: "Warm PVD" },
            ].map((f, i) => (
              <motion.figure
                key={f.name}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
              >
                <div className="relative mx-auto w-full aspect-square flex items-center justify-center">
                  <div
                    className="pointer-events-none absolute inset-6 rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(10,22,40,0.07) 0%, rgba(10,22,40,0) 70%)" }}
                  />
                  <img
                    src={f.src}
                    alt={`aiOn ring in ${f.name} finish with engraved aiOn wordmark`}
                    loading="lazy"
                    className="relative w-[78%] h-[78%] object-contain transition-transform duration-700 hover:scale-[1.05]"
                  />
                </div>
                <figcaption className="mt-2">
                  <div className="text-lg font-light text-ink">{f.name}</div>
                  <div className="text-xs tracking-[0.2em] uppercase text-ink-muted mt-1">{f.note}</div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
          <p className="mt-10 text-center text-sm text-ink-muted font-light">
            Same ring. Same sensors. Your finish.
          </p>
        </div>
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
    { tag: "MOST COMPLETE", name: "aiOn Vitals + Insights + Premium", tease: "AI coaching. Deeper trends.", accent: C.gold, features: ["Everything in Insights", "AI Wellness Coach", "Wellness Trend Alerts", "BP trend (EST) · Glucose trend (EST)", "Heart Rhythm Insight", "Priority Support"] },
  ];
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="relative overflow-hidden py-16 md:py-48" style={{ background: "linear-gradient(180deg,#F6F8FC 0%, #FFFFFF 100%)" }}>
      <div className="container mx-auto px-6 relative z-10">
        <FadeUp className="text-center max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-extralight text-ink leading-[1.05]">
            <WordStagger text="Start free." /><br /><WordStagger text="Unlock more when ready." delay={0.15} />
          </h2>
        </FadeUp>
        <div className="mt-16 grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((p, i) => {
            const isOpen = open === i;
            return (
              <motion.div key={i}
                className={`relative rounded-3xl border p-8 backdrop-blur-xl flex flex-col ${p.highlight ? "md:scale-105" : ""}`}
                style={{ borderColor: p.highlight ? `${p.accent}55` : "#E3E9F2", background: "#FFFFFF", boxShadow: p.highlight ? `0 30px 70px -30px ${p.accent}55` : "0 1px 2px rgba(10,22,40,0.04), 0 18px 40px -28px rgba(10,22,40,0.25)" }}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.7 }}
              >
                {p.tag && (
                  <span className="self-start rounded-full border px-3 py-1 text-[10px] tracking-widest" style={{ borderColor: `${p.accent}88`, color: p.accent }}>{p.tag}</span>
                )}
                <h3 className="mt-4 text-2xl font-light text-ink">{p.name}</h3>
                <p className="mt-3 text-base text-ink-soft font-light">{p.tease}</p>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="mt-4 self-start text-[11px] tracking-widest text-ink-muted hover:text-ink transition"
                >
                  {isOpen ? "HIDE FEATURES" : "SEE FEATURES"}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.ul
                      className="mt-4 space-y-2 text-sm text-ink-soft font-light overflow-hidden"
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
                <Link to="/preorder" className={`mt-8 inline-flex items-center justify-center rounded-full py-3 text-sm font-medium transition ${p.highlight ? "text-white" : "text-ink"}`}
                  style={{ background: p.highlight ? `linear-gradient(120deg, ${C.blue}, ${C.purple})` : "#F1F5FA", border: p.highlight ? "none" : "1px solid #E3E9F2" }}>
                  Pre-order Now
                </Link>
              </motion.div>
            );
          })}
        </div>
        <p className="mt-8 text-center text-xs text-ink-muted">30-day free trial on paid plans</p>
        <p className="mt-3 text-center text-[11px] text-ink-muted/80 max-w-xl mx-auto">
          All plans provide general wellness and fitness features only. No plan provides medical
          advice, diagnosis, or treatment.
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Section 9 — Final CTA
   ───────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-16 md:py-32 min-h-[90svh] flex items-center bg-canvas">
      <NatureBackdrop src={natureForest} opacity={0.12} position="center 30%" />
      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          className="mx-auto relative w-full max-w-5xl overflow-hidden rounded-2xl md:rounded-[32px]"
          initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1.2 }}
          style={{ boxShadow: "0 30px 90px -40px rgba(10,22,40,0.16)" }}
        >
          <video
            src={videoRunTrail.url}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Woman running on a mountain trail wearing the aiOn Ring"
            className="h-[50vh] md:h-[66vh] w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(10,22,40,0.28) 0%, rgba(10,22,40,0) 40%, rgba(10,22,40,0.45) 100%)" }} />
        </motion.div>

        <FadeUp delay={0.3} className="mt-10 md:mt-14">
          <h2 className="text-4xl md:text-7xl font-extralight text-ink leading-[1.05]">
            Your body has answers.
          </h2>
          <p className="mt-4 text-2xl md:text-4xl font-extralight bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(120deg, ${C.blue}, ${C.purple})` }}>
            aiOn helps you hear them.
          </p>
        </FadeUp>
        <FadeUp delay={0.5} className="mt-10">
          <Link to="/preorder"
            className="relative inline-flex items-center justify-center rounded-full px-10 py-5 text-lg font-medium text-white"
            style={{ background: `linear-gradient(120deg, ${C.blue}, ${C.purple})`, boxShadow: `0 20px 50px -15px ${C.blue}55` }}>
            <motion.span className="absolute inset-0 rounded-full"
              animate={{ boxShadow: [`0 0 0 0 ${C.blue}44`, `0 0 0 20px transparent`] }}
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
   Wellness disclaimer
   ───────────────────────────────────────────── */
const FAQS: { q: string; a: string }[] = [
  {
    q: "Is the aiOn Ring a medical device?",
    a: "No. aiOn Ring is a general wellness product. It is not a medical device and is not cleared or approved to diagnose, treat, cure, or prevent any disease or medical condition.",
  },
  {
    q: "Can aiOn detect a heart condition, sleep disorder, or diabetes?",
    a: "No. aiOn shows trends and patterns in your everyday wellness signals. It cannot detect, screen for, or rule out any condition. If something feels off, speak with a qualified healthcare professional.",
  },
  {
    q: "What does “(EST)” mean on Blood Pressure and Glucose?",
    a: "Those are non-medical wellness estimates that illustrate general directional trends only. They are not measurements and must never be used for any health or treatment decision.",
  },
  {
    q: "Should I change medication or treatment based on aiOn insights?",
    a: "Never. All insights are informational only. Do not start, stop, or adjust any medication, therapy, or treatment without consulting your healthcare professional.",
  },
  {
    q: "How accurate are the readings?",
    a: "Signals are captured for wellness and lifestyle awareness, not clinical accuracy. Results can vary with fit, activity, skin, and environment, and should not be compared to medical-grade equipment.",
  },
  {
    q: "Can I share my data with my doctor?",
    a: "You can export your data and share it if you choose. It is context for a conversation with your healthcare professional — not a diagnostic report, and it does not replace professional evaluation.",
  },
  {
    q: "What should I do in an emergency?",
    a: "Do not rely on aiOn. Contact your local emergency services or a qualified healthcare professional immediately.",
  },
];

function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative py-16 md:py-24" style={{ background: "#F6F8FC" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
      <div className="container mx-auto px-6">
        <FadeUp className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Questions, answered</p>
          <h2 className="mt-4 text-3xl md:text-5xl font-extralight tracking-tight text-ink">
            What aiOn is — and what it isn’t
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm md:text-base font-light text-ink-soft">
            A wellness companion. Informational only. Never a substitute for professional care.
          </p>
        </FadeUp>

        <div className="mx-auto mt-10 max-w-3xl space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <FadeUp key={f.q} delay={i * 0.04}>
                <div
                  className="rounded-2xl border backdrop-blur-xl overflow-hidden"
                  style={{
                    borderColor: isOpen ? "rgba(24,120,224,0.35)" : "#E3E9F2",
                    background: "#FFFFFF",
                    boxShadow: isOpen ? "0 22px 50px -30px rgba(24,120,224,0.45)" : "0 1px 2px rgba(10,22,40,0.04)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 md:px-6 md:py-5 text-left"
                  >
                    <span className="text-[15px] md:text-base font-light text-ink">{f.q}</span>
                    <span
                      className="shrink-0 text-xl font-extralight text-ink-muted transition-transform duration-300"
                      style={{ transform: isOpen ? "rotate(45deg)" : "none" }}
                    >
                      +
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <p className="px-5 pb-5 md:px-6 md:pb-6 text-sm md:text-[15px] font-light leading-relaxed text-ink-soft">
                          {f.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeUp>
            );
          })}
        </div>

        <FadeUp delay={0.1}>
          <p className="mx-auto mt-8 max-w-2xl text-center text-xs md:text-[13px] font-light leading-relaxed text-ink-muted">
            All aiOn results are informational only and are not intended to diagnose, treat, cure, or
            prevent any disease or medical condition. Always consult a qualified healthcare
            professional regarding any medical concerns or before making healthcare decisions.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}

function WellnessDisclaimerSection() {
  return (
    <section className="relative py-14 md:py-20" style={{ background: "#FFFFFF" }}>
      <div className="container mx-auto px-6">
        <div
          className="mx-auto max-w-3xl rounded-3xl border p-7 md:p-9 text-center backdrop-blur-xl"
          style={{ borderColor: "#E3E9F2", background: "#F6F8FC" }}
        >
          <p className="eyebrow">General wellness product</p>
          <div className="mt-4 space-y-3 text-sm md:text-[15px] font-light text-ink-soft leading-relaxed">
            <p>aiOn Ring is intended for general wellness purposes only and is not a medical device.</p>
            <p>
              The information provided by aiOn Ring is for informational purposes only and is not
              intended to diagnose, treat, cure, or prevent any disease or medical condition.
            </p>
            <p>
              Always consult a qualified healthcare professional regarding any medical concerns or
              before making healthcare decisions.
            </p>
          </div>
        </div>
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
          style={{ background: "#F6F8FC" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-7xl font-extralight tracking-tight text-ink">
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
    <div className="min-h-screen text-ink" style={{ background: "#F6F8FC" }}>
      <IntroOverlay />
      <GlowCursor />
      <Header />
      <main>
        <Hero />
        <VitalityScoreSection />
        <TrackUnderstandActSection />
        <BodyTalkingSection />
        <NatureBand
          src={natureForest}
          eyebrow="Movement · Activity"
          title="Health doesn't live in a dashboard."
          line="It lives in morning trails, fresh air and the steps you actually take."
          position="center 60%"
        />

        <PillarsSection />
        <QuestSection />
        <TheAppSection />
        <InLifeSection />
        <NatureBand
          src={natureNight}
          eyebrow="Sleep · Recovery"
          title="The quietest hours shape the loudest days."
          line="aiOn follows your sleep and recovery patterns, gently, all night."
          position="center 50%"
        />
        <PreventiveSection />
        <NatureBand
          src={natureSunrise}
          eyebrow="Wellness · Every morning"
          title="Wake with the light, and with your number."
          line="Heart rate, HRV, SpO₂, stress and rest — understood, not just recorded."
          position="center 45%"
        />

        <RingSection />
        <PlansSection />
        <FinalCTA />
        <FAQSection />
        <WellnessDisclaimerSection />
      </main>
      <Footer />
    </div>
  );
}
