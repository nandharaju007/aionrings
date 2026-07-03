import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AionLogo } from '@/components/AionLogo';
import ringHeroImg from '@/assets/ring-hero.jpg';
import ringProductImg from '@/assets/ring-product.jpg';

const GRADIENT = 'linear-gradient(135deg,#00C6FF,#4FB3FF,#7C3AED)';

/* ---------- Reveal on scroll ---------- */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 600ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 600ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ---------- Hero particles ---------- */
function Particles() {
  const dots = Array.from({ length: 25 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((_, i) => {
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const delay = Math.random() * 8;
        const dur = 12 + Math.random() * 8;
        return (
          <span
            key={i}
            className="absolute h-[2px] w-[2px] rounded-full"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              background: 'rgba(79,179,255,0.2)',
              animation: `particleDrift ${dur}s ease-in-out ${delay}s infinite`,
            }}
          />
        );
      })}
    </div>
  );
}

/* ---------- Hero Ring (SVG) ---------- */
function HeroRing() {
  return (
    <div className="relative mx-auto mt-16 w-full max-w-[640px]">
      <div
        className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl"
        style={{
          boxShadow: '0 0 120px -20px rgba(79,179,255,0.4)',
        }}
      >
        <img
          src={ringHeroImg}
          alt="aiOn Ring — the AI-native smart health ring"
          className="h-full w-full object-cover"
          style={{ animation: 'floatC 6s ease-in-out infinite' }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 40%, #0A1628 90%)',
          }}
        />
        <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2">
          <AionLogo width={90} />
        </div>
      </div>

      {/* Floating cards */}
      <div
        className="absolute -left-2 top-8 hidden rounded-2xl border border-[#1E3A5F] bg-[#16243B]/90 p-3 backdrop-blur sm:block"
        style={{ animation: 'floatA 4s ease-in-out infinite', animationDelay: '400ms' }}
      >
        <div className="flex items-center gap-2 text-[11px] text-[#8B9DAF]">
          <span className="text-[#EF4444]">❤</span>
          <span className="uppercase tracking-widest">Resting HR</span>
        </div>
        <div className="mt-1 text-[20px] font-bold text-white">62 bpm</div>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-[#4ADE80]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]" /> Live · optimal
        </div>
      </div>

      <div
        className="absolute right-2 top-6 hidden rounded-2xl border border-[#1E3A5F] bg-[#16243B]/90 p-3 backdrop-blur sm:block"
        style={{ animation: 'floatB 4.2s ease-in-out infinite', animationDelay: '600ms' }}
      >
        <div className="flex items-center gap-2 text-[11px] text-[#8B9DAF]">
          <span className="text-[#FACC15]">⚡</span>
          <span className="uppercase tracking-widest">Vitality</span>
        </div>
        <div className="mt-1 text-[20px] font-bold text-white">78</div>
        <div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-[#1E3A5F]">
          <div className="h-full w-[70%]" style={{ background: GRADIENT }} />
        </div>
      </div>

      <div
        className="mx-auto mt-4 max-w-md rounded-2xl bg-[#0F1B2D] p-4"
        style={{
          borderTop: '2px solid transparent',
          backgroundImage: `linear-gradient(#0F1B2D,#0F1B2D), ${GRADIENT}`,
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
          animation: 'floatC 3.8s ease-in-out infinite',
          animationDelay: '800ms',
        }}
      >
        <div className="text-[12px] text-[#5A6B7E]">AI Insight · 6:47am</div>
        <div className="mt-1 text-[15px] leading-relaxed text-white">
          Your HRV is low after Friday's late workout. Easy session today — you'll recover faster.
        </div>
      </div>
    </div>
  );
}

/* ---------- Story cards ---------- */
const storyMoments = [
  { time: '2:14 am', text: 'Your heart rate quietly shifted.', color: '#EF4444' },
  { time: '3:30 am', text: 'Something changed in your recovery signal.', color: '#EF4444' },
  { time: '4:05 am', text: 'Your body temperature rose slightly.', color: '#EF4444' },
  { time: '6:47 am', text: 'aiOn told you before you felt anything.', color: '#4ADE80' },
];

/* ---------- Benefits ---------- */
const benefits = [
  { icon: '❤', bg: GRADIENT, title: 'You stop wondering why you\u2019re tired.', body: 'You know. aiOn explains the exact reason — not just a number, but the cause.' },
  { icon: '💡', bg: '#4FB3FF', title: 'Your numbers finally make sense.', body: 'Not HRV: 27ms. But why it\u2019s low, what caused it, and what to do right now.' },
  { icon: '😴', bg: '#7C3AED', title: 'Sleep becomes something you understand.', body: 'Every night analysed. Every morning explained. What changed, and why you feel how you feel.' },
  { icon: '⚡', bg: '#FACC15', title: 'You train on the right days.', body: 'aiOn tells you when to push and when to hold back — before you even lace up.' },
  { icon: '🧠', bg: '#EF4444', title: 'Stress doesn\u2019t sneak up on you.', body: 'Caught early. Explained clearly. Before it peaks.' },
  { icon: '🏆', bg: '#4ADE80', title: 'You get a health briefing every morning.', body: 'Plain English. What happened overnight. What to do today. Before you open an app.' },
];

/* ---------- Proactive signals aiOn watches ---------- */
const signals = [
  {
    icon: '😴',
    tag: 'SLEEP',
    title: 'Sleep you can actually feel.',
    body: 'aiOn maps every stage of your night — deep, REM, light — and connects it to how you woke up. Restless nights get a reason.',
    quote: 'You lost 42 min of deep sleep. Try dimming screens by 10pm tonight.',
    glow: '#7C3AED',
  },
  {
    icon: '🧠',
    tag: 'STRESS',
    title: 'Stress caught before it stacks.',
    body: 'Continuous HRV and skin response reveal tension building in real time — not hours later, when you already feel wrecked.',
    quote: 'Stress load rising since 2pm. A 4-minute breath session can bring it back.',
    glow: '#EF4444',
  },
  {
    icon: '❤',
    tag: 'HEART',
    title: 'Heart rhythm, always in view.',
    body: 'aiOn watches resting HR, HRV, and rhythm patterns 24/7 — flagging days your heart is doing more than usual.',
    quote: 'Resting HR is 8 bpm above your baseline this week. Consider a lighter session.',
    glow: 'linear-gradient(135deg,#EF4444,#7C3AED)',
  },
  {
    icon: '🩸',
    tag: 'BLOOD PRESSURE',
    title: 'BP trends, no cuff, no fuss.',
    body: 'Pulse waveform analysis surfaces long-term shifts in vascular tone — so you spot patterns weeks earlier than an annual check-up.',
    quote: 'Vascular tone trending upward for 12 days. Time to hydrate and slow down salt.',
    glow: '#00C6FF',
  },
  {
    icon: '🍬',
    tag: 'GLUCOSE RESPONSE',
    title: 'Feel what food does to you.',
    body: 'aiOn correlates your meals, heart rate, and sleep to reveal how your body handles what you eat — even without a CGM.',
    quote: 'Your evening carbs spiked HR for 90 min. Try earlier dinners this week.',
    glow: '#FACC15',
  },
  {
    icon: '🌿',
    tag: 'ANEMIA & OXYGEN',
    title: 'Low energy, finally explained.',
    body: 'Overnight SpO₂, resting HR, and perfusion trends help surface early signs of low iron or oxygen delivery — the kind labs miss between visits.',
    quote: 'SpO₂ ran 2% below baseline for 5 nights. Worth a check-in with your doctor.',
    glow: '#4ADE80',
  },
  {
    icon: '🔥',
    tag: 'ENERGY & CALORIES',
    title: 'Calories that mean something.',
    body: 'aiOn uses continuous heart rate, temperature, and motion to model true energy burn — not a generic step-based guess.',
    quote: 'You burned 2,340 kcal today — 320 above your average. Refuel with protein.',
    glow: '#FACC15',
  },
  {
    icon: '✨',
    tag: 'DAILY HEALTH',
    title: 'One score. The whole picture.',
    body: 'Your Vitality Score fuses recovery, strain, sleep, and stress into a single, honest read of how ready you are for today.',
    quote: 'Vitality 78 — Strong. You have room for one hard session before recovery.',
    glow: 'linear-gradient(135deg,#00C6FF,#4FB3FF,#7C3AED)',
  },
];

/* ---------- Phone frame ---------- */
function PhoneFrame({ children, tilt = 0, forward = false }: { children: React.ReactNode; tilt?: number; forward?: boolean }) {
  return (
    <div
      className="relative shrink-0"
      style={{
        width: 290,
        height: 580,
        transform: `rotateY(${tilt}deg) scale(${forward ? 1.05 : 0.95})`,
        transformStyle: 'preserve-3d',
      }}
    >
      <div
        className="relative h-full w-full overflow-hidden rounded-[44px] bg-[#0A0A14]"
        style={{
          boxShadow: '0 0 0 1px #2A3A52, 0 32px 64px rgba(0,0,0,0.5)',
        }}
      >
        <div className="absolute left-1/2 top-2 z-10 h-[30px] w-[120px] -translate-x-1/2 rounded-[20px] bg-black" />
        <div className="absolute inset-2 overflow-hidden rounded-[38px] bg-[#0A1628] p-5 pt-10">
          {children}
        </div>
      </div>
    </div>
  );
}

function VitalityRing({ pct = 78 }: { pct?: number }) {
  const r = 55;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <svg viewBox="0 0 140 140" className="mx-auto h-[140px] w-[140px]">
      <defs>
        <linearGradient id="vrg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00C6FF" />
          <stop offset="50%" stopColor="#4FB3FF" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <circle cx="70" cy="70" r={r} fill="none" stroke="#1E3A5F" strokeWidth="10" />
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke="url(#vrg)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`}
        transform="rotate(-90 70 70)"
      />
      <text x="70" y="58" textAnchor="middle" fill="#8B9DAF" fontSize="9" letterSpacing="2">
        VITALITY
      </text>
      <text x="70" y="82" textAnchor="middle" fill="#FFFFFF" fontSize="30" fontWeight="700">
        {pct}
      </text>
      <text x="70" y="98" textAnchor="middle" fill="#4ADE80" fontSize="9" letterSpacing="1">
        STRONG
      </text>
    </svg>
  );
}

/* ---------- Ring product ---------- */
function ProductRing({ color }: { color: string }) {
  return (
    <div
      className="relative w-full max-w-[420px] overflow-hidden rounded-3xl"
      style={{
        boxShadow: '0 0 100px -20px rgba(79,179,255,0.35)',
      }}
    >
      <img
        src={ringProductImg}
        alt="aiOn Ring product view"
        className="aspect-square w-full object-cover transition-all duration-500"
        style={{
          filter:
            color === '#C0C0CC'
              ? 'hue-rotate(180deg) brightness(1.6) saturate(0.4)'
              : color === '#B76E79'
              ? 'hue-rotate(-70deg) brightness(1.15) saturate(1.3)'
              : 'none',
        }}
      />
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2">
        <AionLogo width={90} />
      </div>
    </div>
  );
}

/* ---------- Waitlist form ---------- */
function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <div className="mx-auto mt-12 max-w-[480px]">
      {sent ? (
        <div className="text-center transition-opacity duration-300">
          <p className="text-[20px] text-[#4ADE80]">✓ You're on the list.</p>
          <p className="mt-1 text-[15px] text-[#8B9DAF]">We'll reach out before launch.</p>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email) setSent(true);
          }}
          className="flex overflow-hidden rounded-2xl border border-[#1E3A5F] bg-[#16243B]"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 bg-transparent px-5 py-4 text-[16px] text-white placeholder:text-[#5A6B7E] focus:outline-none"
            aria-label="Email address"
          />
          <button
            type="submit"
            className="px-6 py-4 text-[15px] font-semibold text-white transition-all duration-150 hover:brightness-110"
            style={{ background: GRADIENT }}
          >
            Join Waitlist →
          </button>
        </form>
      )}
      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[14px] text-[#5A6B7E]">
        <span>🔒 No spam ever</span>
        <span>·</span>
        <span>📦 Ships 2026</span>
        <span>·</span>
        <span>↩ 30-day returns</span>
      </div>
    </div>
  );
}

/* ================= PAGE ================= */
const finishes = [
  { name: 'Midnight Black', hex: '#0A0A14' },
  { name: 'Silver', hex: '#C0C0CC' },
  { name: 'Rose Gold', hex: '#B76E79' },
];

const Index = () => {
  const [finish, setFinish] = useState(finishes[0]);
  const [showScrollHint, setShowScrollHint] = useState(true);

  useEffect(() => {
    const onScroll = () => setShowScrollHint(window.scrollY < 80);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A1628] text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes sensorPulse { 0%,100%{opacity:0.75} 50%{opacity:1} }
        @keyframes ppgPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.3)} }
        @keyframes floatA { 0%,100%{transform:translateY(-6px)} 50%{transform:translateY(6px)} }
        @keyframes floatB { 0%,100%{transform:translateY(-6px)} 50%{transform:translateY(6px)} }
        @keyframes floatC { 0%,100%{transform:translateY(-4px)} 50%{transform:translateY(4px)} }
        @keyframes particleDrift {
          0%,100% { transform: translate(0,0); opacity:0.2 }
          50% { transform: translate(20px,-30px); opacity:0.6 }
        }
        @keyframes scrollBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
        @keyframes ppgLive { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>

      <Header />

      {/* ============ HERO ============ */}
      <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-6 pt-24">
        <Particles />

        {/* Live ring vitals ticker */}
        <div
          className="pointer-events-none absolute left-1/2 top-20 z-20 -translate-x-1/2"
          aria-hidden="true"
          style={{ animation: 'fadeInUp 900ms cubic-bezier(0.16,1,0.3,1) 200ms both' }}
        >
          <div
            className="flex items-center gap-4 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 text-[11px] font-medium uppercase tracking-[2px] text-[#B8C5D3] backdrop-blur-xl sm:gap-6 sm:text-[12px]"
            style={{ boxShadow: '0 8px 40px -12px rgba(0,198,255,0.25)' }}
          >
            <span className="flex items-center gap-2">
              <span
                className="h-1.5 w-1.5 rounded-full bg-[#00C6FF]"
                style={{ animation: 'ppgLive 1.4s ease-in-out infinite', boxShadow: '0 0 8px #00C6FF' }}
              />
              <span className="text-white/90">Live</span>
            </span>
            <span className="hidden h-3 w-px bg-white/10 sm:block" />
            <span><span className="text-white/90">62</span> <span className="text-[9px] tracking-[1.5px]">bpm</span></span>
            <span className="hidden sm:inline"><span className="text-white/90">74</span> <span className="text-[9px] tracking-[1.5px]">hrv</span></span>
            <span><span className="text-white/90">98%</span> <span className="text-[9px] tracking-[1.5px]">spo₂</span></span>
            <span className="hidden sm:inline"><span className="text-white/90">36.7°</span> <span className="text-[9px] tracking-[1.5px]">temp</span></span>
            <span className="hidden md:inline"><span className="text-white/90">87</span> <span className="text-[9px] tracking-[1.5px]">sleep</span></span>
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-[680px] text-center">
          <span
            className="inline-block bg-clip-text text-[11px] font-semibold uppercase tracking-[3px] text-transparent"
            style={{ backgroundImage: GRADIENT }}
          >
            AI-NATIVE SMART HEALTH RING
          </span>
          <h1 className="mt-6 text-[56px] font-extrabold leading-[1] tracking-tight text-white sm:text-[72px] lg:text-[88px]">
            Your body is always
            <br />
            talking.
          </h1>
          <h2 className="mt-2 text-[56px] font-extrabold leading-[1] tracking-tight sm:text-[72px] lg:text-[88px]">
            <span className="text-white">aiOn </span>
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRADIENT }}>
              listens.
            </span>
          </h2>
          <p className="mx-auto mt-8 max-w-[480px] text-[18px] leading-[1.7] text-[#B8C5D3]">
            The first smart ring that doesn't just track your health — it understands it. Every
            morning you wake up knowing exactly how your body is doing and what to do about it.
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() =>
                document.querySelector('#waitlist')?.scrollIntoView({ behavior: 'smooth' })
              }
              className="rounded-full px-9 py-4 text-[17px] font-semibold text-white transition-all duration-150 hover:brightness-110 hover:scale-[1.03]"
              style={{ background: GRADIENT }}
            >
              Join the Waitlist · Free
            </button>
            <button
              onClick={() =>
                document.querySelector('#how')?.scrollIntoView({ behavior: 'smooth' })
              }
              className="rounded-full border border-[#8B9DAF] px-9 py-4 text-[17px] font-medium text-[#B8C5D3] transition-colors hover:border-white hover:text-white"
            >
              See How It Works ↓
            </button>
          </div>
          <p className="mt-6 text-[14px] text-[#5A6B7E]">
            No credit card · Ships 2026 · 30-day returns
          </p>

          <HeroRing />
        </div>

        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-500"
          style={{
            opacity: showScrollHint ? 1 : 0,
            animation: 'scrollBounce 0.8s ease-in-out infinite',
          }}
        >
          <ChevronDown className="h-7 w-7 text-[#4FB3FF]" />
        </div>
      </section>

      {/* ============ STORY ============ */}
      <section id="how" className="px-6 py-[140px]">
        <div className="mx-auto max-w-[700px] text-center">
          <Reveal>
            <p className="text-[28px] font-normal italic leading-relaxed text-white">
              "Most mornings, you wake up and check your phone. You have no idea what happened
              inside your body while you slept."
            </p>
          </Reveal>

          <div className="mt-16 space-y-4 text-left">
            {storyMoments.map((m, i) => (
              <Reveal key={i} delay={i * 200}>
                <div
                  className="flex items-center gap-6 rounded-xl border border-[#1E3A5F] bg-[#16243B] px-6 py-4"
                  style={{ borderLeft: `2px solid ${m.color}` }}
                >
                  <span className="w-20 text-[14px] text-[#8B9DAF]">{m.time}</span>
                  <span className="text-[16px] text-white">{m.text}</span>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <h3
              className="mt-16 bg-clip-text text-[32px] font-bold leading-tight text-transparent"
              style={{ backgroundImage: GRADIENT }}
            >
              Twenty-four hours before you felt it.
              <br />
              aiOn already knew.
            </h3>
            <p className="mt-4 text-[18px] text-[#8B9DAF]">
              This is what wearing aiOn actually feels like.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ WHAT CHANGES ============ */}
      <section className="px-6 py-[120px]">
        <div className="mx-auto max-w-[1100px]">
          <div className="text-center">
            <Reveal>
              <p className="text-[11px] font-semibold uppercase tracking-[3px] text-[#8B9DAF]">
                WHAT CHANGES WHEN YOU WEAR IT
              </p>
              <h2 className="mt-4 text-[40px] font-bold leading-[1.1] text-white sm:text-[52px]">
                Six things that feel
                <br />
                different. Immediately.
              </h2>
            </Reveal>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="group h-full rounded-2xl border border-[#1E3A5F] bg-[#16243B] p-7 transition-all duration-200 hover:-translate-y-1 hover:border-[#4FB3FF]">
                  <div
                    className="mb-5 flex h-12 w-12 items-center justify-center rounded-full text-[20px]"
                    style={{ background: b.bg }}
                  >
                    {b.icon}
                  </div>
                  <h3 className="text-[18px] font-semibold leading-snug text-white">{b.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-[#B8C5D3]">{b.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW AION HELPS ============ */}
      <section className="px-6 py-[120px]">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center">
            <Reveal>
              <p className="text-[11px] font-semibold uppercase tracking-[3px] text-[#8B9DAF]">
                PROACTIVE, NOT REACTIVE
              </p>
              <h2 className="mt-4 text-[40px] font-bold leading-[1.1] text-white sm:text-[52px]">
                Eight signals aiOn watches
                <br />
                so you don't have to.
              </h2>
              <p className="mx-auto mt-6 max-w-[560px] text-[18px] leading-[1.7] text-[#B8C5D3]">
                aiOn quietly reads your body all day. When something changes, it explains what,
                why, and what to do — long before you'd notice on your own.
              </p>
            </Reveal>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {signals.map((s, i) => (
              <Reveal key={s.title} delay={i * 80}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-[#1E3A5F] bg-[#16243B] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#4FB3FF]">
                  <div
                    className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
                    style={{ background: s.glow }}
                  />
                  <div
                    className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl text-[22px]"
                    style={{ background: s.glow, color: '#0A1628' }}
                  >
                    {s.icon}
                  </div>
                  <div className="text-[11px] font-semibold uppercase tracking-[2px] text-[#8B9DAF]">
                    {s.tag}
                  </div>
                  <h3 className="mt-1 text-[18px] font-semibold text-white">{s.title}</h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-[#B8C5D3]">{s.body}</p>
                  <div
                    className="mt-5 rounded-lg bg-[#0F1B2D] p-3 text-[12px] italic text-[#B8C5D3]"
                    style={{ borderLeft: '2px solid #4FB3FF' }}
                  >
                    "{s.quote}"
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <p className="mx-auto mt-12 max-w-[600px] text-center text-[13px] text-[#5A6B7E]">
              aiOn shares wellness insights based on signal trends. It is not a medical device and
              does not diagnose, treat, or prevent any condition.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ THE APP ============ */}
      <section id="app" className="px-6 py-[120px]">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center">
            <Reveal>
              <p className="text-[11px] font-semibold uppercase tracking-[3px] text-[#8B9DAF]">
                THE APP
              </p>
              <h2 className="mt-4 text-[40px] font-bold leading-[1.1] text-white sm:text-[52px]">
                The app that thinks
                <br />
                for you.
              </h2>
              <p className="mx-auto mt-6 max-w-[520px] text-[18px] leading-[1.7] text-[#B8C5D3]">
                Not a dashboard. Not a data dump. A morning briefing, written just for you.
              </p>
            </Reveal>
          </div>

          <div
            className="mt-16 flex snap-x snap-mandatory items-center justify-start gap-6 overflow-x-auto pb-6 md:justify-center md:overflow-visible"
            style={{ perspective: '1400px' }}
          >
            <Reveal delay={0}>
              <div className="snap-center">
                <PhoneFrame tilt={8}>
                  <div className="mb-2 flex justify-between text-[11px] text-white">
                    <span>9:41</span>
                    <span>••• 100%</span>
                  </div>
                  <div className="text-[17px] font-bold text-white">Good morning</div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-[#4ADE80]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]" /> aion ring · live
                  </div>
                  <div className="mt-6">
                    <VitalityRing pct={78} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-[#16243B] p-3 text-[11px]">
                      <div className="text-[#8B9DAF]">🧬 Health Age</div>
                      <div className="mt-0.5 font-semibold text-white">
                        32 <span className="text-[#4ADE80]">−3 yrs</span>
                      </div>
                    </div>
                    <div className="rounded-xl bg-[#16243B] p-3 text-[11px]">
                      <div className="text-[#8B9DAF]">
                        <span
                          className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#EF4444] align-middle"
                          style={{ animation: 'ppgLive 1.2s ease-in-out infinite' }}
                        />
                        Live HR
                      </div>
                      <div className="mt-0.5 font-semibold text-white">72 bpm</div>
                    </div>
                  </div>
                  <div
                    className="mt-4 rounded-xl bg-[#16243B] p-3"
                    style={{ borderLeft: '2px solid #4FB3FF' }}
                  >
                    <div className="text-[11px] font-semibold text-[#4FB3FF]">WHY 78 TODAY ✦</div>
                    <div className="mt-1 text-[12px] leading-snug text-[#B8C5D3]">
                      Your recovery stayed strong despite yesterday's session. Sleep efficiency was 92%.
                    </div>
                  </div>
                </PhoneFrame>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="snap-center">
                <PhoneFrame forward>
                  <div className="mb-4 flex justify-between text-[11px] text-white">
                    <span>9:41</span>
                    <span>••• 100%</span>
                  </div>
                  <div className="text-[18px] font-bold text-white">Insights</div>
                  <div
                    className="mt-5 rounded-xl bg-[#1A1020] p-4"
                    style={{ border: '1px solid #EF4444' }}
                  >
                    <span className="inline-block rounded-full bg-[#EF4444]/20 px-2 py-0.5 text-[10px] font-semibold text-[#EF4444]">
                      NEEDS ATTENTION
                    </span>
                    <div className="mt-2 text-[16px] font-bold text-white">HRV down this week</div>
                    <div className="mt-1 text-[13px] text-[#B8C5D3]">
                      Consistent training load is showing — your body needs recovery time.
                    </div>
                  </div>
                  <div className="mt-6 text-[10px] font-semibold uppercase tracking-widest text-[#8B9DAF]">
                    Also worth knowing
                  </div>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between rounded-lg bg-[#16243B] p-3">
                      <span className="text-[12px] text-white">😴 Sleep debt easing</span>
                      <span className="text-[#5A6B7E]">›</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-[#16243B] p-3">
                      <span className="text-[12px] text-white">🌡 Temp trending up 0.3°</span>
                      <span className="text-[#5A6B7E]">›</span>
                    </div>
                  </div>
                </PhoneFrame>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="snap-center">
                <PhoneFrame tilt={-8}>
                  <div className="mb-4 flex justify-between text-[11px] text-white">
                    <span>9:41</span>
                    <span>••• 100%</span>
                  </div>
                  <div className="text-[18px] font-bold text-white">Ask aiOn</div>
                  <div className="mt-5 space-y-3">
                    <div className="ml-auto max-w-[80%] rounded-2xl bg-[#1E3A5F] px-3 py-2 text-[13px] text-white">
                      Why is my HRV low today?
                    </div>
                    <div
                      className="max-w-[85%] rounded-2xl bg-[#16243B] px-3 py-2 text-[13px] text-[#B8C5D3]"
                      style={{ borderLeft: '2px solid #4FB3FF' }}
                    >
                      Your HRV of 27ms is below your baseline. This is likely from Friday's late
                      workout. Light activity today will help you recover faster.
                    </div>
                    <div className="ml-auto max-w-[80%] rounded-2xl bg-[#1E3A5F] px-3 py-2 text-[13px] text-white">
                      What time should I work out tomorrow?
                    </div>
                  </div>
                  <div className="absolute inset-x-5 bottom-5 flex items-center gap-2 rounded-full bg-[#16243B] px-4 py-2">
                    <span className="flex-1 text-[12px] text-[#5A6B7E]">
                      Ask anything about your health…
                    </span>
                    <span className="text-[#4FB3FF]">🎤</span>
                  </div>
                </PhoneFrame>
              </div>
            </Reveal>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <span className="rounded-full border border-[#1E3A5F] px-5 py-2 text-[13px] text-[#B8C5D3]">
              App Store · Coming 2026
            </span>
            <span className="rounded-full border border-[#1E3A5F] px-5 py-2 text-[13px] text-[#B8C5D3]">
              Google Play · Coming 2026
            </span>
          </div>
        </div>
      </section>

      {/* ============ THE RING ============ */}
      <section id="ring" className="px-6 py-[120px]">
        <div className="mx-auto max-w-[1100px]">
          <div className="text-center">
            <Reveal>
              <p className="text-[11px] font-semibold uppercase tracking-[3px] text-[#8B9DAF]">
                THE RING
              </p>
              <h2 className="mt-4 text-[40px] font-bold leading-[1.1] text-white sm:text-[52px]">
                Engineered to
                <br />
                disappear.
              </h2>
              <p className="mx-auto mt-6 max-w-[520px] text-[18px] leading-[1.7] text-[#B8C5D3]">
                You'll forget it's there. Until it tells you something important.
              </p>
            </Reveal>
          </div>

          <div className="mt-16 grid grid-cols-1 items-center gap-16 md:grid-cols-2">
            <Reveal>
              <div className="flex flex-col items-center">
                <ProductRing color={finish.hex} />
                <div className="mt-6 flex items-center gap-4">
                  {finishes.map((f) => (
                    <button
                      key={f.name}
                      onClick={() => setFinish(f)}
                      aria-label={f.name}
                      className="h-10 w-10 rounded-full transition-all duration-300"
                      style={{
                        background: f.hex,
                        boxShadow:
                          finish.name === f.name
                            ? '0 0 0 2px #4FB3FF, 0 0 0 4px #0A1628'
                            : '0 0 0 1px #1E3A5F',
                      }}
                    />
                  ))}
                </div>
                <p className="mt-3 text-[13px] text-[#8B9DAF]">{finish.name}</p>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div>
                <div className="space-y-4">
                  {[
                    { label: 'Material', value: 'Medical-grade Titanium' },
                    { label: 'Battery', value: 'Up to 7 days' },
                    { label: 'Water', value: 'IP68 · Swim-safe' },
                  ].map((r) => (
                    <div
                      key={r.label}
                      className="flex items-center justify-between rounded-xl border border-[#1E3A5F] bg-[#16243B] px-5 py-4"
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-[3px] text-[#8B9DAF]">
                        {r.label}
                      </span>
                      <span className="text-[15px] font-medium text-white">{r.value}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-[13px] text-[#8B9DAF]">
                  Sizes US 6–13 · Free sizing kit before you commit
                </p>

                <div className="mt-8 flex items-baseline gap-3">
                  <span className="text-[36px] font-bold text-white">$149</span>
                  <span className="text-[18px] text-[#5A6B7E] line-through">$179</span>
                  <span className="text-[13px] text-[#FACC15]">Launch pricing</span>
                </div>

                <button
                  onClick={() =>
                    document.querySelector('#waitlist')?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="mt-6 w-full rounded-2xl py-4 text-[16px] font-semibold text-white transition-all duration-150 hover:brightness-110 hover:scale-[1.02]"
                  style={{ background: GRADIENT }}
                >
                  Join the Waitlist →
                </button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ WAITLIST ============ */}
      <section id="waitlist" className="relative overflow-hidden px-6 py-[140px]">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, #0F1B2D 0%, #0A1628 70%)',
          }}
        />
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ opacity: 0.04 }}>
          <AionLogo width={300} />
        </div>
        <div className="relative mx-auto max-w-[560px] text-center">
          <Reveal>
            <h2 className="text-[44px] font-bold leading-[1.05] text-white sm:text-[56px]">
              Be first.
              <br />
              Feel the difference.
            </h2>
            <p className="mt-4 text-[18px] leading-[1.7] text-[#B8C5D3]">
              Join the waitlist for launch pricing and early access. No credit card. No obligation.
            </p>
            <WaitlistForm />
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
