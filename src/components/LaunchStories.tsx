import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Volume2, VolumeX } from "lucide-react";
import film from "@/assets/campaign/aion-ring-launch-film.mp4.asset.json";
import poster from "@/assets/campaign/aion-ring-launch-film-poster.jpg.asset.json";
import holiday from "@/assets/campaign/aion-holiday-gift.jpg.asset.json";
import reveal from "@/assets/campaign/aion-launch-reveal.jpg.asset.json";
import mens from "@/assets/campaign/aion-mens-morning.jpg.asset.json";
import fitness from "@/assets/campaign/aion-fitness-kettlebell.jpg.asset.json";
import professional from "@/assets/campaign/aion-professional-woman.jpg.asset.json";
import sleep from "@/assets/campaign/aion-sleep-recovery.jpg.asset.json";
import everyday from "@/assets/campaign/aion-everyday-wellness.jpg.asset.json";

const photos = [
  { src: reveal.url, label: "The launch", alt: "The black aiOn Ring on a dark stone stand" },
  { src: mens.url, label: "Mornings", alt: "A man's hand wearing the aiOn Ring beside a journal and espresso" },
  { src: professional.url, label: "At work", alt: "A woman's hand wearing the aiOn Ring on a laptop in a boardroom" },
  { src: fitness.url, label: "Training", alt: "A hand wearing the aiOn Ring gripping a kettlebell" },
  { src: sleep.url, label: "Sleep", alt: "A resting hand wearing the aiOn Ring on dark bedsheets" },
  { src: everyday.url, label: "Everyday", alt: "A hand wearing the aiOn Ring holding green tea by a window" },
  { src: holiday.url, label: "Holidays", alt: "A hand wearing the aiOn Ring on a navy gift box" },
];

export function LaunchStories() {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) v.play().catch(() => {});
  };
  return (
    <section id="stories" className="relative overflow-hidden bg-canvas py-16 md:py-24">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs md:text-sm tracking-[0.35em] text-ink-muted uppercase">Launching soon</p>
          <h2 className="mt-4 text-4xl md:text-6xl font-extralight text-ink leading-[1.05]">A day with aiOn.</h2>
          <p className="mt-4 text-ink-soft text-base md:text-lg font-light">Morning to night, quietly on your hand.</p>
        </div>
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[minmax(0,360px)_1fr] gap-5 items-start">
          <div className="relative mx-auto w-full max-w-[360px] overflow-hidden rounded-[28px] bg-ink">
            <video ref={ref} src={film.url} poster={poster.url} autoPlay muted loop playsInline preload="metadata"
              aria-label="A short film of a day wearing the aiOn Ring" className="w-full aspect-[9/16] object-cover" />
            <button type="button" onClick={toggle} aria-label={muted ? "Turn sound on" : "Turn sound off"}
              className="absolute bottom-4 right-4 rounded-full bg-background/80 p-3 text-foreground backdrop-blur">
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {photos.map((p) => (
              <figure key={p.label} className="relative overflow-hidden rounded-[20px]">
                <img src={p.src} alt={p.alt} loading="lazy" width={900} height={900} className="w-full aspect-square object-cover" />
                <figcaption className="absolute bottom-3 left-4 text-sm font-light tracking-wide text-primary-foreground drop-shadow">{p.label}</figcaption>
              </figure>
            ))}
            <Link to="/preorder" className="flex aspect-square flex-col items-center justify-center rounded-[20px] bg-primary p-4 text-center text-primary-foreground">
              <span className="text-xs tracking-[0.3em] uppercase opacity-80">Be first</span>
              <span className="mt-2 text-xl font-light">Pre-order the aiOn Ring</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
