import { useEffect, useMemo, useRef, useState } from "react";
import { Facebook, Instagram, Youtube, ExternalLink, AlertCircle } from "lucide-react";

export type SocialPlatform = "youtube" | "instagram" | "facebook";

type ParsedEmbed = {
  platform: SocialPlatform;
  kind: string;
  embedUrl: string;
  /** width / height */
  aspect: number;
  /** Fixed-height embeds (Instagram / Facebook posts) don't use aspect ratio */
  fixedHeight?: number;
  thumbnail?: string;
};

const YT_HOSTS = ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "www.youtu.be", "youtube-nocookie.com", "www.youtube-nocookie.com"];
const IG_HOSTS = ["instagram.com", "www.instagram.com"];
const FB_HOSTS = ["facebook.com", "www.facebook.com", "m.facebook.com", "fb.watch", "web.facebook.com"];

function safeUrl(raw: string): URL | null {
  try {
    return new URL(raw.trim());
  } catch {
    try {
      return new URL(`https://${raw.trim()}`);
    } catch {
      return null;
    }
  }
}

/** Extract a YouTube video id from watch, youtu.be, shorts, embed or live URLs. */
export function getYouTubeId(url: URL): { id: string; shorts: boolean } | null {
  const host = url.hostname.toLowerCase();
  const parts = url.pathname.split("/").filter(Boolean);

  if (host.includes("youtu.be")) {
    return parts[0] ? { id: parts[0], shorts: false } : null;
  }
  const v = url.searchParams.get("v");
  if (v) return { id: v, shorts: false };

  const idx = parts.findIndex((p) => ["shorts", "embed", "live", "v"].includes(p));
  if (idx >= 0 && parts[idx + 1]) {
    return { id: parts[idx + 1], shorts: parts[idx] === "shorts" };
  }
  return null;
}

export function parseSocialUrl(raw: string): ParsedEmbed | null {
  const url = safeUrl(raw);
  if (!url) return null;
  const host = url.hostname.toLowerCase();

  // ---------- YouTube ----------
  if (YT_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
    const found = getYouTubeId(url);
    if (!found) return null;
    const params = new URLSearchParams({ rel: "0", modestbranding: "1", playsinline: "1" });
    const start = url.searchParams.get("t") || url.searchParams.get("start");
    if (start) params.set("start", String(parseInt(start, 10) || 0));
    return {
      platform: "youtube",
      kind: found.shorts ? "short" : "video",
      embedUrl: `https://www.youtube-nocookie.com/embed/${found.id}?${params.toString()}`,
      aspect: found.shorts ? 9 / 16 : 16 / 9,
      thumbnail: `https://i.ytimg.com/vi/${found.id}/hqdefault.jpg`,
    };
  }

  // ---------- Instagram ----------
  if (IG_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
    const parts = url.pathname.split("/").filter(Boolean);
    const i = parts.findIndex((p) => ["p", "reel", "reels", "tv"].includes(p));
    if (i < 0 || !parts[i + 1]) return null;
    const kind = parts[i] === "reels" ? "reel" : parts[i];
    const path = kind === "reel" ? "reel" : kind === "tv" ? "tv" : "p";
    return {
      platform: "instagram",
      kind,
      embedUrl: `https://www.instagram.com/${path}/${parts[i + 1]}/embed/captioned/`,
      aspect: kind === "reel" ? 9 / 16 : 1,
      fixedHeight: kind === "reel" ? 720 : 620,
    };
  }

  // ---------- Facebook ----------
  if (FB_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
    const href = encodeURIComponent(url.toString());
    const path = url.pathname.toLowerCase();
    const isVideo =
      host.includes("fb.watch") ||
      path.includes("/videos/") ||
      path.includes("/reel/") ||
      path.includes("/watch");
    if (isVideo) {
      return {
        platform: "facebook",
        kind: path.includes("/reel/") ? "reel" : "video",
        embedUrl: `https://www.facebook.com/plugins/video.php?href=${href}&show_text=false&width=560`,
        aspect: path.includes("/reel/") ? 9 / 16 : 16 / 9,
      };
    }
    return {
      platform: "facebook",
      kind: "post",
      embedUrl: `https://www.facebook.com/plugins/post.php?href=${href}&show_text=true&width=560`,
      aspect: 1,
      fixedHeight: 620,
    };
  }

  return null;
}

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
          {title || "Unable to display this content here."}
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          referrerPolicy="no-referrer"
          onClick={(e) => {
            e.preventDefault();
            window.open(url, "_blank", "noopener,noreferrer");
          }}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          View on {meta?.label ?? "the original site"}
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
  const [oembedTitle, setOembedTitle] = useState<string | undefined>();
  const timerRef = useRef<number | null>(null);

  // YouTube: verify the video exists and allows embedding before showing the player.
  useEffect(() => {
    if (!parsed || parsed.platform !== "youtube") return;
    let cancelled = false;
    fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("not embeddable"))))
      .then((data) => {
        if (!cancelled) setOembedTitle(data?.title);
      })
      .catch(() => {
        /* network/CORS failures shouldn't block the player; iframe timeout handles real errors */
      });
    return () => {
      cancelled = true;
    };
  }, [parsed, url]);

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
          title={title || oembedTitle || `${PLATFORM_META[parsed.platform].label} ${parsed.kind}`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
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
