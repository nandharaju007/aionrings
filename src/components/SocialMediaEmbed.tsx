import { useEffect, useMemo, useRef, useState } from "react";
import { Facebook, Instagram, Youtube, ExternalLink, AlertCircle } from "lucide-react";
import { parseSocialUrl, type SocialPlatform } from "@/lib/social-embed";

export type { SocialPlatform };
export { parseSocialUrl, getYouTubeVideoId, getYouTubeEmbedUrl } from "@/lib/social-embed";

const PLATFORM_META: Record<SocialPlatform, { label: string; Icon: typeof Youtube }> = {
  youtube: { label: "YouTube", Icon: Youtube },
  instagram: { label: "Instagram", Icon: Instagram },
  facebook: { label: "Facebook", Icon: Facebook },
};

function Fallback({
  url,
  platform,
  thumbnail,
  title,
}: {
  url: string;
  platform?: SocialPlatform;
  thumbnail?: string;
  title?: string;
}) {
  const meta = platform ? PLATFORM_META[platform] : null;
  const Icon = meta?.Icon ?? AlertCircle;
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {thumbnail && (
        <img
          src={thumbnail}
          alt={title || `${meta?.label ?? "Social"} content preview`}
          loading="lazy"
          className="aspect-video w-full object-cover"
        />
      )}
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon className="h-4 w-4" aria-hidden="true" />
          <span>{meta?.label ?? "Social media"}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {title || "This video cannot be played directly here."}
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          referrerPolicy="no-referrer"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Watch on {meta?.label ?? "the original site"}
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
        <span className="break-all text-xs text-muted-foreground/70">{url}</span>
      </div>
    </div>
  );
}

interface SocialMediaEmbedProps {
  url: string;
  title?: string;
  className?: string;
}

export function SocialMediaEmbed({ url, title, className }: SocialMediaEmbedProps) {
  const parsed = useMemo(() => parseSocialUrl(url), [url]);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const timerRef = useRef<number | null>(null);

  // If the frame never loads (blocked by the platform or the network), fall back.
  useEffect(() => {
    if (!parsed || loaded || failed) return;
    timerRef.current = window.setTimeout(() => setFailed(true), 9000);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [parsed, loaded, failed]);

  if (!parsed || failed) {
    return (
      <div className={className}>
        <Fallback url={url} platform={parsed?.platform} thumbnail={parsed?.thumbnail} title={title} />
      </div>
    );
  }

  const portrait = parsed.aspect < 1;
  const frameStyle = parsed.fixedHeight
    ? { height: `${parsed.fixedHeight}px` }
    : { aspectRatio: `${parsed.aspect}` };

  return (
    <div className={className}>
      <div
        className={`relative mx-auto w-full max-w-full overflow-hidden rounded-2xl border border-border bg-muted${
          portrait ? " max-w-[420px]" : ""
        }`}
        style={frameStyle}
      >
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" aria-label="Loading" />
          </div>
        )}
        <iframe
          src={parsed.embedUrl}
          title={title || `${PLATFORM_META[parsed.platform].label} ${parsed.kind}`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          scrolling="no"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    </div>
  );
}

export default SocialMediaEmbed;
