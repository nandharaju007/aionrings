import { useState } from 'react';
import { ExternalLink, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VIDEO_ID = 'U6xW-hTZOCw';
const WATCH_URL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;

export function MeasurementVideo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4 border-t border-border pt-4">
      <div className="flex items-center justify-between gap-2">
        <Button type="button" variant="outline" onClick={() => setOpen(true)} className="h-11 whitespace-normal text-left hover:bg-secondary hover:text-foreground"><Play />Watch paper-strip measurement</Button>
        {open && <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close measurement video" title="Close video"><X /></Button>}
      </div>
      {open ? <>
        <iframe src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?rel=0&playsinline=1`} title="How to measure ring size at home — filmed tutorial by Brilliant Earth" className="mt-3 aspect-video w-full rounded-lg border border-border bg-secondary" allow="encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Filmed by Brilliant Earth, not aiOn. Use paper, then enter your measurements in millimetres above; confirm aiOn fit with a physical sizing kit.</p>
        <Button asChild variant="link" className="h-auto whitespace-normal px-0 py-2 text-xs"><a href={WATCH_URL} target="_blank" rel="noopener noreferrer">Open on YouTube<ExternalLink /></a></Button>
      </> : <p className="mt-2 text-xs text-muted-foreground">By Brilliant Earth · YouTube loads only when you choose to watch.</p>}
    </div>
  );
}