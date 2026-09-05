/**
 * Canonical social-media URL → embed URL logic.
 * NOTHING in the app may pass a raw social URL into an <iframe src>.
 */

export type SocialPlatform = "youtube" | "instagram" | "facebook";

export type ParsedEmbed = {
  platform: SocialPlatform;
  kind: string;
  embedUrl: string;
  /** width / height */
  aspect: number;
  /** Fixed-height embeds (Instagram / Facebook posts) don't use aspect ratio */
  fixedHeight?: number;
  thumbnail?: string;
};

const YT_HOSTS = [
  "youtube.com",
  "youtu.be",
  "youtube-nocookie.com",
];
const IG_HOSTS = ["instagram.com"];
const FB_HOSTS = ["facebook.com", "fb.watch"];

function hostMatches(host: string, list: string[]) {
  return list.some((h) => host === h || host.endsWith(`.${h}`));
}

export function safeUrl(raw: string): URL | null {
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

const ID_RE = /^[A-Za-z0-9_-]{6,20}$/;

/**
 * Extract a YouTube video id from watch, youtu.be, shorts, embed or live URLs,
 * tolerating extra query parameters.
 */
export function getYouTubeVideoId(url: string | URL): string | null {
  const u = typeof url === "string" ? safeUrl(url) : url;
  if (!u) return null;
  const host = u.hostname.toLowerCase();
  if (!hostMatches(host, YT_HOSTS)) return null;

  const parts = u.pathname.split("/").filter(Boolean);

  if (host.endsWith("youtu.be")) {
    return parts[0] && ID_RE.test(parts[0]) ? parts[0] : null;
  }

  const v = u.searchParams.get("v");
  if (v && ID_RE.test(v)) return v;

  const idx = parts.findIndex((p) => ["shorts", "embed", "live", "v"].includes(p));
  if (idx >= 0 && parts[idx + 1] && ID_RE.test(parts[idx + 1])) return parts[idx + 1];

  return null;
}

export function isYouTubeShort(url: string | URL): boolean {
  const u = typeof url === "string" ? safeUrl(url) : url;
  return !!u && u.pathname.toLowerCase().includes("/shorts/");
}

/** Always returns a youtube-nocookie player URL, or null when unparseable. */
export function getYouTubeEmbedUrl(url: string | URL): string | null {
  const id = getYouTubeVideoId(url);
  if (!id) return null;
  const u = typeof url === "string" ? safeUrl(url) : url;
  const params = new URLSearchParams({ rel: "0", modestbranding: "1", playsinline: "1" });
  const start = u?.searchParams.get("t") || u?.searchParams.get("start");
  if (start) params.set("start", String(parseInt(start, 10) || 0));
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

export function parseSocialUrl(raw: string): ParsedEmbed | null {
  const url = safeUrl(raw);
  if (!url) return null;
  const host = url.hostname.toLowerCase();

  // ---------- YouTube ----------
  if (hostMatches(host, YT_HOSTS)) {
    const id = getYouTubeVideoId(url);
    const embedUrl = getYouTubeEmbedUrl(url);
    if (!id || !embedUrl) return null;
    const shorts = isYouTubeShort(url);
    return {
      platform: "youtube",
      kind: shorts ? "short" : "video",
      embedUrl,
      aspect: shorts ? 9 / 16 : 16 / 9,
      // thumbnail served from the image CDN, never from www.youtube.com
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }

  // ---------- Instagram ----------
  if (hostMatches(host, IG_HOSTS)) {
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
  if (hostMatches(host, FB_HOSTS)) {
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
