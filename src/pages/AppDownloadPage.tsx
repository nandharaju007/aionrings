import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { AionLogo } from "@/components/AionLogo";
import { motion } from "framer-motion";

import appScreenVitality from "@/assets/app-screen-vitality.png";
import appScreenQuest from "@/assets/app-screen-quest.png";
import appScreenSleep from "@/assets/app-screen-sleep.png";
import appScreenWomens from "@/assets/app-screen-womens-health.png.asset.json";
import appScreenActivity from "@/assets/app-screen-activity.png.asset.json";
import appScreenInsights from "@/assets/app-screen-insights.png.asset.json";
import ringMidnight from "@/assets/ring-finish-midnight.png";
import videoLifeEarly from "@/assets/video-life-early.mp4.asset.json";
import videoRestSilver from "@/assets/video-life-rest-silver.mp4.asset.json";
import videoMoveBlack from "@/assets/video-life-move-black.mp4.asset.json";
import videoRunTrail from "@/assets/video-run-trail.mp4.asset.json";
import posterLifeEarly from "@/assets/poster-life-early.jpg";

const APP_STORE_URL = "https://apps.apple.com/us/app/aionrings/id6787938002";
const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=com.aion.myring";

const GRADIENT = "linear-gradient(135deg,#00D4FF,#1878E0 45%,#8B5CF6)";

/* ---------------- device detection (unchanged behaviour) ---------------- */

function getStoreUrl(device: "ios" | "android" | "desktop") {
  if (device === "ios") return APP_STORE_URL;
  if (device === "android") return GOOGLE_PLAY_URL;
  return null;
}

function detectDevice(): "ios" | "android" | "desktop" {
  if (typeof window === "undefined" || !window.navigator) return "desktop";
  const ua = window.navigator.userAgent || "";
  const platform = (window.navigator.platform || "").toLowerCase();
  const maxTouchPoints = window.navigator.maxTouchPoints || 0;

  if (/iPhone|iPad|iPod/i.test(ua) || /iphone|ipad|ipod/.test(platform)) return "ios";
  if (/MacIntel|Mac OS X/i.test(ua) && maxTouchPoints > 1) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

function appendQueryParams(baseUrl: string, search: string) {
  if (!search) return baseUrl;
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}${search.slice(1)}`;
}

/* ---------------- icons + badges ---------------- */

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.46 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-.06.04-2.03 1.18-2.01 3.51 0 2.76 2.4 3.69 2.45 3.71-.02.1-.38 1.32-1.12 2.62-.68 1.2-1.39 2.39-2.45 2.41-.55.01-.93-.16-1.93-.84zm-4.11-15.1c.07-2.04 1.76-3.79 3.74-3.86.29 2.32-1.93 4.5-3.74 3.86z" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3.609 1.814 20.643 11.04a1.5 1.5 0 0 1 0 2.622L3.609 22.888A1.5 1.5 0 0 1 1.5 21.572V2.828a1.5 1.5 0 0 1 2.109-1.014z" />
    </svg>
  );
}

function StoreBadge({
  href,
  label,
  sublabel,
  icon: Icon,
  variant = "light",
}: {
  href: string;
  label: string;
  sublabel: string;
  icon: typeof AppleIcon;
  variant?: "dark" | "light";
}) {
  const isLight = variant === "light";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`group flex items-center gap-3 rounded-2xl px-5 py-3.5 transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#1878E0]/40 ${
        isLight
          ? "bg-ink text-white shadow-[0_14px_34px_-16px_rgba(10,22,40,0.6)] hover:bg-[#132139]"
          : "bg-white text-ink border border-ink/10 shadow-[0_10px_28px_-18px_rgba(10,22,40,0.5)] hover:border-ink/20"
      }`}
    >
      <Icon className="h-7 w-7 shrink-0" />
      <span className="flex flex-col items-start leading-tight">
        <span className={`text-[10px] font-medium tracking-wide ${isLight ? "text-white/70" : "text-ink-muted"}`}>
          {sublabel}
        </span>
        <span className="text-[15px] font-semibold">{label === "Download on the App Store" ? "App Store" : "Google Play"}</span>
      </span>
    </a>
  );
}

function StoreBadges({ variant = "light" }: { variant?: "dark" | "light" }) {
  return (
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
      <StoreBadge
        href={APP_STORE_URL}
        label="Download on the App Store"
        sublabel="Download on the"
        icon={AppleIcon}
        variant={variant}
      />
      <StoreBadge
        href={GOOGLE_PLAY_URL}
        label="Get it on Google Play"
        sublabel="Get it on"
        icon={PlayIcon}
        variant={variant === "light" ? "dark" : "light"}
      />
    </div>
  );
}

/* ---------------- building blocks ---------------- */

function FadeUp({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Realistic iPhone frame. Renders a screenshot, or a clearly marked placeholder. */
function PhoneMock({
  src,
  alt,
  label,
  className = "",
  width = 260,
}: {
  src?: string;
  alt: string;
  label?: string;
  className?: string;
  width?: number;
}) {
  return (
    <div className={`relative ${className}`} style={{ width }}>
      <div
        className="relative rounded-[2.4rem] p-[3px]"
        style={{
          background: "linear-gradient(160deg,rgba(10,22,40,0.16),rgba(10,22,40,0.06) 40%,rgba(0,169,224,0.28))",
          boxShadow: "0 34px 70px -34px rgba(10,22,40,0.45)",
        }}
      >
        <div className="relative overflow-hidden rounded-[2.25rem] bg-[#050A14]" style={{ aspectRatio: "9 / 19.5" }}>
          {!src && <div className="absolute left-1/2 top-2 z-20 h-[18px] w-[34%] -translate-x-1/2 rounded-full bg-black/90" />}
          {src ? (
            <img
              src={src}
              alt={alt}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
              <div className="absolute inset-0 opacity-25" style={{ background: GRADIENT }} />
              <div className="relative z-10 rounded-full border border-white/25 px-3 py-1 text-[9px] uppercase tracking-[0.25em] text-white/70">
                Placeholder
              </div>
              <p className="relative z-10 text-[13px] font-light text-white/85">{alt}</p>
              <p className="relative z-10 text-[10px] text-white/50">Add the real app screenshot here</p>
            </div>
          )}
        </div>
      </div>
      {label && (
        <p className="mt-4 text-center text-[12px] uppercase tracking-[0.22em] text-ink-muted">{label}</p>
      )}
    </div>
  );
}

/** Autoplaying, muted, looping video that only loads when scrolled into view. */
function LazyVideo({
  src,
  poster,
  label,
  className = "",
}: {
  src: string;
  poster?: string;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={active ? src : undefined}
      poster={poster}
      aria-label={label}
      muted
      loop
      playsInline
      autoPlay
      preload="metadata"
      className={className}
    />
  );
}

/* ---------------- sections ---------------- */

function AppHero() {
  return (
    <section className="relative overflow-hidden bg-canvas px-6 pt-28 pb-20 md:pt-36 md:pb-28">
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[720px] w-[720px] -translate-x-1/2 rounded-full opacity-[0.13] blur-3xl"
        style={{ background: GRADIENT }}
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
        <FadeUp>
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#1878E0]">aiOn Smart Ring</p>
          <h1 className="mt-5 text-[40px] font-extralight leading-[1.05] tracking-[-0.02em] text-ink sm:text-[56px]">
            Your Health.
            <br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRADIENT }}>
              One App.
            </span>
          </h1>
          <p className="mt-6 max-w-md text-lg font-light leading-relaxed text-ink-soft">
            Turn your aiOn Ring data into meaningful daily wellness insights.
          </p>
          <div className="mt-10">
            <StoreBadges />
          </div>
          <p className="mt-6 text-[13px] text-ink-muted">Available on iOS &amp; Android</p>
        </FadeUp>

        <FadeUp delay={0.15} className="relative flex justify-center">
          <div
            className="pointer-events-none absolute inset-0 rounded-full opacity-[0.14] blur-3xl"
            style={{ background: GRADIENT }}
          />
          <div className="relative flex items-end gap-6">
            <PhoneMock src={appScreenVitality} alt="aiOn app — Today, Vitality Score" width={252} />
            <img
              src={ringMidnight}
              alt="aiOn Smart Ring in Midnight finish"
              loading="lazy"
              className="relative -mb-2 w-24 drop-shadow-[0_20px_40px_rgba(10,22,40,0.25)] sm:w-32"
            />
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

const SCREENS: { src?: string; alt: string; label: string }[] = [
  { src: appScreenVitality, alt: "aiOn app — Today / Vitality Score", label: "Today" },
  { src: appScreenInsights.url, alt: "aiOn app — Insights", label: "Insights" },
  { src: appScreenActivity.url, alt: "aiOn app — Activity", label: "Activity" },
  { src: appScreenSleep, alt: "aiOn app — Sleep", label: "Sleep" },
  { src: appScreenWomens.url, alt: "aiOn app — Women's Health", label: "Women's Health" },
  { src: appScreenQuest, alt: "aiOn app — Today's Quest", label: "Quest" },
  { alt: "aiOn app — Health Age", label: "Health Age" },
  { alt: "aiOn app — Vitals", label: "Vitals" },
  { alt: "aiOn app — Recovery", label: "Recovery" },
  { alt: "aiOn app — Nutrition", label: "Nutrition" },
];

function ExperienceSection() {
  return (
    <section className="relative overflow-hidden bg-canvas-alt py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <FadeUp className="max-w-xl">
          <p className="text-[11px] uppercase tracking-[0.34em] text-ink-muted">The experience</p>
          <h2 className="mt-4 text-3xl font-extralight text-ink md:text-5xl">Every screen, one story.</h2>
        </FadeUp>
      </div>

      <FadeUp className="mt-12">
        <div
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-6 md:px-[max(1.5rem,calc((100vw-72rem)/2))]"
          style={{ scrollbarWidth: "thin" }}
        >
          {SCREENS.map((s) => (
            <div key={s.label} className="snap-center shrink-0">
              <PhoneMock src={s.src} alt={s.alt} label={s.label} width={216} />
            </div>
          ))}
        </div>
      </FadeUp>
      <p className="mt-2 px-6 text-center text-[12px] text-ink-muted">Swipe to explore the app</p>
    </section>
  );
}

const DEMOS = [
  {
    title: "Ring → App sync",
    copy: "Your night uploads the moment you wake.",
    src: (videoLifeEarly as { url: string }).url,
    poster: posterLifeEarly,
  },
  {
    title: "Daily wellness dashboard",
    copy: "One score. One clear direction for the day.",
    src: (videoRestSilver as { url: string }).url,
  },
  {
    title: "Sleep & recovery",
    copy: "See how your night shaped your morning.",
    src: (videoMoveBlack as { url: string }).url,
  },
  {
    title: "Workouts & trends",
    copy: "Start a session, watch the pattern build.",
    src: (videoRunTrail as { url: string }).url,
  },
];

function DemoSection() {
  return (
    <section className="bg-canvas py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <FadeUp className="max-w-xl">
          <p className="text-[11px] uppercase tracking-[0.34em] text-ink-muted">In motion</p>
          <h2 className="mt-4 text-3xl font-extralight text-ink md:text-5xl">See it work.</h2>
        </FadeUp>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {DEMOS.map((d, i) => (
            <FadeUp key={d.title} delay={i * 0.05}>
              <div className="group relative overflow-hidden rounded-3xl border border-ink/[0.07] bg-white shadow-[0_20px_50px_-32px_rgba(10,22,40,0.45)]">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <LazyVideo
                    src={d.src}
                    poster={d.poster}
                    label={d.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/70 via-transparent to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-light text-ink">{d.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-muted">{d.copy}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
        <p className="mt-6 text-[12px] text-ink-muted">
          Placeholder footage — in-app screen recordings can replace these clips at any time.
        </p>
      </div>
    </section>
  );
}

const STORY = [
  { step: "01", title: "Wear aiOn", copy: "Put it on. Forget it's there." },
  { step: "02", title: "Track your wellness", copy: "Sleep, activity and vitals, all night and day." },
  { step: "03", title: "Understand your data", copy: "Plain-language insights, not raw charts." },
  { step: "04", title: "Build healthier habits", copy: "One small change at a time." },
];

function StorySection() {
  return (
    <section className="relative overflow-hidden bg-canvas-alt py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <FadeUp className="max-w-xl">
          <p className="text-[11px] uppercase tracking-[0.34em] text-ink-muted">Ring + App</p>
          <h2 className="mt-4 text-3xl font-extralight text-ink md:text-5xl">How it comes together.</h2>
        </FadeUp>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-[1fr_auto]">
          <ol className="relative space-y-10 pl-10">
            <span
              className="absolute left-[13px] top-2 bottom-2 w-px opacity-60"
              style={{ background: "linear-gradient(180deg,#00D4FF,#8B5CF6)" }}
            />
            {STORY.map((s, i) => (
              <FadeUp key={s.step} delay={i * 0.06}>
                <li className="relative">
                  <span
                    className="absolute -left-10 top-1 flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-medium text-white"
                    style={{ background: GRADIENT }}
                  >
                    {i + 1}
                  </span>
                  <h3 className="text-xl font-light text-ink">{s.title}</h3>
                  <p className="mt-1 text-sm text-ink-muted">{s.copy}</p>
                </li>
              </FadeUp>
            ))}
          </ol>

          <FadeUp delay={0.1} className="relative flex justify-center">
            <div
              className="pointer-events-none absolute inset-0 rounded-full opacity-[0.12] blur-3xl"
              style={{ background: GRADIENT }}
            />
            <div className="relative flex items-end gap-5">
              <img src={ringMidnight} alt="aiOn Ring" loading="lazy" className="w-20 sm:w-24" />
              <PhoneMock src={appScreenQuest} alt="aiOn app — daily guidance" width={216} />
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

const DISCOVERY: { kicker: string; copy: string; src?: string; alt: string }[] = [
  {
    kicker: "Sleep better",
    copy: "Understand your sleep stages, quality and recovery.",
    src: appScreenSleep,
    alt: "aiOn app — Sleep",
  },
  {
    kicker: "Move more",
    copy: "Track activities, workouts, steps, distance and calories.",
    alt: "aiOn app — Activities & Workouts",
  },
  {
    kicker: "Recover smarter",
    copy: "Understand stress, recovery and daily wellness patterns.",
    src: appScreenQuest,
    alt: "aiOn app — Recovery & Stress",
  },
  {
    kicker: "Know your vitals",
    copy: "See supported wellness measurements and trends.",
    src: appScreenVitality,
    alt: "aiOn app — Vitals",
  },
];

function DiscoverySection() {
  return (
    <section className="bg-canvas py-20 md:py-28">
      <div className="mx-auto max-w-5xl space-y-24 px-6 md:space-y-32">
        {DISCOVERY.map((d, i) => (
          <FadeUp key={d.kicker}>
            <div
              className={`grid items-center gap-10 md:grid-cols-2 ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}
            >
              <div>
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.34em] text-transparent bg-clip-text"
                  style={{ backgroundImage: GRADIENT }}
                >
                  {d.kicker}
                </p>
                <h3 className="mt-4 text-2xl font-extralight leading-snug text-ink md:text-4xl">{d.copy}</h3>
              </div>
              <div className="flex justify-center">
                <PhoneMock src={d.src} alt={d.alt} width={230} />
              </div>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}

function FinalCTA({ redirecting, device }: { redirecting: boolean; device: "ios" | "android" | "desktop" }) {
  return (
    <section className="relative overflow-hidden bg-canvas-alt px-6 py-24 md:py-32">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.12] blur-3xl"
        style={{ background: GRADIENT }}
      />
      <FadeUp className="relative mx-auto max-w-2xl text-center">
        <AionLogo width={120} className="mx-auto" />
        <h2 className="mt-8 text-3xl font-extralight leading-tight text-ink md:text-5xl">
          Your aiOn experience starts here.
        </h2>
        <div className="mt-10">
          <StoreBadges />
        </div>
        <p className="mt-6 text-[13px] text-ink-muted">Available on iOS &amp; Android</p>

        {redirecting && device !== "desktop" && (
          <div className="mx-auto mt-8 max-w-md rounded-2xl border border-ink/10 bg-white px-5 py-4">
            <p className="text-sm text-ink-soft">
              Redirecting you to the {device === "ios" ? "App Store" : "Google Play"}…
            </p>
            <p className="mt-2 text-[13px] text-ink-muted">
              If nothing happens,{" "}
              <a
                href={device === "ios" ? APP_STORE_URL : GOOGLE_PLAY_URL}
                className="font-medium text-[#1878E0] underline underline-offset-2"
              >
                tap here to continue
              </a>
              .
            </p>
          </div>
        )}

        <p className="mt-10 text-[13px] font-medium tracking-wide text-ink-muted">aionrings.com</p>
      </FadeUp>
    </section>
  );
}

/* ---------------- page ---------------- */

export default function AppDownloadPage() {
  const [device, setDevice] = useState<"ios" | "android" | "desktop" | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const detected = detectDevice();
    setDevice(detected);

    if (detected === "ios" || detected === "android") {
      const storeUrl = getStoreUrl(detected);
      if (storeUrl) {
        setRedirecting(true);
        window.location.replace(appendQueryParams(storeUrl, window.location.search));
      }
    }
  }, []);

  const seo = (
    <SEO
      title="Download the aiOn App | aiOn Smart Ring"
      description="Download the aiOn app for iPhone or Android and connect your aiOn Smart Ring to your daily wellness experience."
      path="/app"
      image="/og-image.jpg"
    />
  );

  if (device === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas">
        {seo}
        <AionLogo width={120} />
        <p className="mt-4 text-sm text-ink-muted">Detecting your device…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      {seo}
      <Header />
      <main className="flex-1">
        <AppHero />
        <ExperienceSection />
        <DemoSection />
        <StorySection />
        <DiscoverySection />
        <FinalCTA redirecting={redirecting} device={device} />
      </main>
      <Footer />
    </div>
  );
}
