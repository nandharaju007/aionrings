import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { AionLogo } from "@/components/AionLogo";
import { motion } from "framer-motion";

const APP_STORE_URL = "https://apps.apple.com/us/app/aionrings/id6787938002";
const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=com.aion.myring";

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

  // iPhone / iPad / iPod / Apple devices
  if (/iPhone|iPad|iPod/i.test(ua) || /iPhone|iPad|iPod/.test(platform)) {
    return "ios";
  }

  // iPad Pro and newer iPads sometimes report as Macintosh with touch
  if (/MacIntel|Mac OS X/i.test(ua) && maxTouchPoints > 1) {
    return "ios";
  }

  // Android
  if (/Android/i.test(ua)) {
    return "android";
  }

  return "desktop";
}

function appendQueryParams(baseUrl: string, search: string) {
  if (!search) return baseUrl;
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}${search.slice(1)}`;
}

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
  variant,
}: {
  href: string;
  label: string;
  sublabel: string;
  icon: typeof AppleIcon;
  variant: "dark" | "light";
}) {
  const isDark = variant === "dark";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        group flex items-center gap-3 rounded-xl px-5 py-3.5 transition-all duration-200
        hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2
        ${isDark ? "bg-[#0A1628] text-white hover:bg-[#141f33] focus:ring-[#1878E0]" : "bg-white text-[#0A1628] border border-[#0A1628]/10 hover:border-[#0A1628]/20 focus:ring-[#1878E0] shadow-sm"}
      `}
      aria-label={label}
    >
      <Icon className="h-7 w-7 shrink-0" />
      <div className="flex flex-col items-start leading-tight">
        <span className={`text-[10px] font-medium tracking-wide ${isDark ? "text-white/70" : "text-[#5A6B80]"}`}>
          {sublabel}
        </span>
        <span className="text-[15px] font-semibold">{label}</span>
      </div>
    </a>
  );
}

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 text-[15px] text-[#3F5068]">
      <span
        className="h-1.5 w-1.5 rounded-full shrink-0"
        style={{ background: "linear-gradient(135deg,#00A9E0,#1878E0,#6D28D9)" }}
      />
      {children}
    </li>
  );
}

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
        const finalUrl = appendQueryParams(storeUrl, window.location.search);
        window.location.href = finalUrl;
      }
    }
  }, []);

  // While detecting the device, show a minimal branded loader.
  if (device === null) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
        <SEO
          title="Download the aiOn App | aiOn Smart Ring"
          description="Download the aiOn app for iPhone or Android and connect your aiOn Smart Ring to your daily wellness experience."
          path="/app"
          image="/og-image.jpg"
        />
        <div className="flex flex-col items-center gap-4">
          <AionLogo width={120} />
          <p className="text-sm text-[#6B7A8C]">Detecting your device…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <SEO
        title="Download the aiOn App | aiOn Smart Ring"
        description="Download the aiOn app for iPhone or Android and connect your aiOn Smart Ring to your daily wellness experience."
        path="/app"
        image="/og-image.jpg"
      />
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-28 pb-16 md:pt-32 md:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md text-center"
        >
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#6B7A8C]">
            aiOn Smart Ring
          </p>

          <h1 className="text-[34px] font-semibold leading-[1.1] tracking-[-0.02em] text-[#0A1628] sm:text-[42px]">
            GET THE aiOn APP
          </h1>

          <p className="mt-4 text-lg font-light text-[#3F5068] sm:text-xl">
            One Ring. One App.
          </p>
          <p className="mt-1 text-lg font-light text-[#3F5068] sm:text-xl">
            Your Wellness, Connected.
          </p>

          <p className="mt-6 text-[15px] leading-relaxed text-[#5A6B80]">
            Connect your aiOn Smart Ring with the aiOn app to understand your daily wellness.
          </p>

          <ul className="mt-8 flex flex-col items-start gap-3 mx-auto w-fit">
            <FeatureItem>Vitals &amp; Insights</FeatureItem>
            <FeatureItem>Sleep &amp; Recovery</FeatureItem>
            <FeatureItem>Stress</FeatureItem>
            <FeatureItem>Activities &amp; Workouts</FeatureItem>
            <FeatureItem>Women&apos;s Health</FeatureItem>
            <FeatureItem>Nutrition</FeatureItem>
          </ul>

          <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            <StoreBadge
              href={APP_STORE_URL}
              label="Download on the App Store"
              sublabel="Download on the"
              icon={AppleIcon}
              variant="dark"
            />
            <StoreBadge
              href={GOOGLE_PLAY_URL}
              label="Get it on Google Play"
              sublabel="Get it on"
              icon={PlayIcon}
              variant="light"
            />
          </div>

          <p className="mt-8 text-[13px] text-[#6B7A8C]">
            Available on iOS &amp; Android
          </p>

          {redirecting && (device === "ios" || device === "android") && (
            <div className="mt-8 rounded-2xl border border-[#1878E0]/20 bg-[#1878E0]/5 px-5 py-4">
              <p className="text-sm text-[#3F5068]">
                Redirecting you to the {device === "ios" ? "App Store" : "Google Play"}…
              </p>
              <p className="mt-2 text-[13px] text-[#6B7A8C]">
                If nothing happens,{" "}
                <a
                  href={device === "ios" ? APP_STORE_URL : GOOGLE_PLAY_URL}
                  className="font-medium text-[#1878E0] underline underline-offset-2 hover:text-[#6D28D9]"
                >
                  tap here to continue
                </a>
                .
              </p>
            </div>
          )}

          <p className="mt-10 text-[13px] font-medium tracking-wide text-[#0A1628]">
            aionrings.com
          </p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
