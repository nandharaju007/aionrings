import { useState } from 'react';
import { Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import wrapPhoto from '@/assets/sizing-paper-wrap.jpg';
import rulerPhoto from '@/assets/sizing-paper-ruler.jpg';

export function PaperMeasurementVisual({ step }: { step: number }) {
  const [open, setOpen] = useState(false);
  const wrapping = step === 0;
  return (
    <figure className="overflow-hidden rounded-lg">
      <div className="relative aspect-[3/2]">
        <img src={wrapping ? wrapPhoto : rulerPhoto} alt={wrapping ? 'Close-up example of marking the overlap on a paper strip wrapped around a finger' : 'Close-up example of a marked paper strip aligned with zero on a millimetre ruler'} width={1200} height={800} loading="lazy" className="h-full w-full object-cover" />
        {wrapping && <span aria-hidden="true" className="pointer-events-none absolute left-[54%] top-[43%] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-transparent" />}
        <Button type="button" variant="ghost" size="icon" aria-label={wrapping ? 'Show where to mark the paper' : 'Show how to read the ruler'} aria-expanded={open} onClick={() => setOpen(!open)} className="absolute right-2 top-2 h-11 w-11 rounded-full hover:bg-transparent">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm">
            {open ? <X className="h-4 w-4" /> : <Info className="h-4 w-4" />}
          </span>
        </Button>
      </div>
      <figcaption className="mt-3 space-y-2">
        <ol className="space-y-1 text-sm text-foreground">
          {wrapping ? <><li>1. Wrap paper snugly around the finger you’ll wear the ring on.</li><li>2. Draw a line on the paper where its starting edge meets it.</li></> : <><li>1. Unwrap the paper. Put its starting edge at 0 on your ruler.</li><li>2. Read the distance from 0 to your pen mark.</li></>}
        </ol>
        {open && <p role="status" className="text-sm text-muted-foreground">{wrapping ? 'The small circle points to the overlap. Mark the paper underneath the starting edge, then remove and flatten the strip.' : 'Use the same edge that touched your pen mark when wrapped. Each small ruler tick is 1 mm; 1 cm is 10 mm.'}</p>}
        <p className="text-xs text-muted-foreground">Example photo only · measure your own paper with a real ruler.</p>
      </figcaption>
    </figure>
  );
}