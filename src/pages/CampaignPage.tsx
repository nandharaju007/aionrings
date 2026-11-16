import { useState } from "react";
import { Download } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { campaignMedia } from "@/lib/campaign-media";

export default function CampaignPage() {
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const download = async (url: string, filename: string) => {
    setSaving(filename);
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Download unavailable");
      const blob = await response.blob();
      if (!blob.type.startsWith("video/") && !blob.type.startsWith("image/")) throw new Error("Download unavailable");
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    } catch {
      setError(filename);
    } finally {
      setSaving(null);
    }
  };
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <SEO title="aiOn Launch Campaign | Videos & Photos" description="Explore the aiOn Ring launch films and wellness stories. Download campaign videos and photos." path="/campaign" image="/og-image.jpg" />
      <Header />
      <main className="container mx-auto px-6 pt-28 pb-20">
        <p className="text-sm uppercase text-ink-muted">Launching soon</p>
        <h1 className="mt-3 text-4xl md:text-6xl font-light">aiOn launch campaign</h1>
        {(["video", "image"] as const).map(kind => (
          <section key={kind} className="mt-12" aria-label={kind === "video" ? "Campaign videos" : "Campaign photos"}>
            <h2 className="text-2xl font-light">{kind === "video" ? "Launch films & wellness stories" : "Campaign photos"}</h2>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaignMedia.filter(item => item.kind === kind).map(item => (
                <article key={item.filename} className="overflow-hidden rounded-lg border border-border bg-card">
                  {kind === "video" ? (
                    <video src={item.url} controls playsInline preload="none" aria-label={item.title} className="w-full aspect-[9/16] object-contain bg-background" />
                  ) : (
                    <img src={item.url} alt={`${item.title} — aiOn Ring launch`} loading="lazy" width="1080" height="1080" className="w-full aspect-square object-cover" />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-light">{item.title}</h3>
                    <Button className="mt-3" variant="outline" disabled={saving !== null} onClick={() => download(item.url, item.filename)}>
                      <Download />{saving === item.filename ? "Saving…" : kind === "video" ? "Download video" : "Download photo"}
                    </Button>
                    {error === item.filename && <p role="alert" className="mt-3 text-sm text-destructive">Unable to save this file. Please try again.</p>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
        <p className="mt-12 text-sm text-ink-muted">General wellness product. Not intended to diagnose, treat or prevent medical conditions.</p>
      </main>
      <Footer />
    </div>
  );
}