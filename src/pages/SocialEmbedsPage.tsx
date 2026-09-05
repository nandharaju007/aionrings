import SocialMediaEmbed from "@/components/SocialMediaEmbed";
import SEO from "@/components/SEO";

const SAMPLES: { label: string; url: string }[] = [
  { label: "YouTube video", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
  { label: "YouTube Short", url: "https://www.youtube.com/shorts/tPEE9ZwTmy0" },
  { label: "YouTube short link", url: "https://youtu.be/dQw4w9WgXcQ" },
  { label: "Instagram post", url: "https://www.instagram.com/p/CzlA1ZBrLXF/" },
  { label: "Instagram Reel", url: "https://www.instagram.com/reel/C1Xz0kEIcaB/" },
  { label: "Facebook post", url: "https://www.facebook.com/aionrings/posts/pfbid0000000000" },
  { label: "Facebook video", url: "https://www.facebook.com/watch/?v=10153231379946729" },
];

export default function SocialEmbedsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16">
      <SEO
        title="Social Media Embeds | aiOn"
        description="Preview of embedded aiOn social media content across YouTube, Instagram and Facebook."
        path="/social-embeds"
        image="/og-image.jpg"
        noindex
      />
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">Social media embeds</h1>
      <div className="flex flex-col gap-12">
        {SAMPLES.map((s) => (
          <section key={s.label} className="flex flex-col gap-3">
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{s.label}</h2>
            <SocialMediaEmbed url={s.url} />
          </section>
        ))}
      </div>
    </main>
  );
}
