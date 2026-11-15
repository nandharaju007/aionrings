import { useState } from 'react';
import { Pencil, Ruler, X } from 'lucide-react';
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
        <Button type="button" variant="default" size="icon" aria-label={wrapping ? 'Show where to mark the paper' : 'Show how to read the ruler'} aria-expanded={open} onClick={() => setOpen(!open)} className={`absolute h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary-foreground shadow-lg ${wrapping ? 'left-[54%] top-[43%]' : 'left-[74%] top-[40%]'}`}>
          {!open && <span aria-hidden="true" className="absolute inset-0 rounded-full border-2 border-primary motion-safe:animate-ping" />}
          {open ? <X className="h-5 w-5" /> : wrapping ? <Pencil className="h-5 w-5" /> : <Ruler className="h-5 w-5" />}
        </Button>
        {open && <div role="status" className="absolute inset-x-3 bottom-3 rounded-md border border-border bg-background/95 p-3 text-sm text-foreground shadow-sm motion-safe:animate-in motion-safe:fade-in">{wrapping ? 'Draw a line where the end of the strip overlaps. Keep the paper snug, not tight.' : 'Align the start with 0, then count millimetres to your mark. Read your own strip, not this example.'}</div>}
      </div>
      <figcaption className="mt-2 text-xs text-muted-foreground">Illustrative example · use your own paper and a real ruler.</figcaption>
    </figure>
  );
}