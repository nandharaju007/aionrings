import { useRef, useState } from 'react';
import { Upload, Ruler, RotateCcw, CreditCard, X } from 'lucide-react';
import handCardSample from '@/assets/hand-card-sample-palm.jpg';
import { Button } from '@/components/ui/button';

const FINGERS = ['index', 'middle', 'ring'] as const;

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ring-sizer`;

type SizeResult = {
  ok?: boolean;
  us_size?: string | null;
  inner_diameter_mm?: number | null;
  confidence?: string | null;
  note?: string;
  error?: string;
};

export function RingSizer({ compact = false, collapsible = false }: { compact?: boolean; collapsible?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(!collapsible);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [finger, setFinger] = useState<(typeof FINGERS)[number]>('index');
  const [result, setResult] = useState<SizeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickFile = (selected: File | undefined) => {
    if (!selected) return;
    if (!selected.type.startsWith('image/')) {
      setError('Please choose a photo file.');
      return;
    }
    if (selected.size > 12 * 1024 * 1024) {
      setError('Please choose a photo under 12 MB.');
      return;
    }
    setError(null);
    setResult(null);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const run = async () => {
    if (!file || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const form = new FormData();
    form.append('image', file, file.name || 'hand.jpg');
    form.append('finger', finger);

    try {
      const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
      const res = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        body: form,
      });
      const data = (await res.json()) as SizeResult;
      if (!res.ok) throw new Error(data.error || 'Could not estimate your size.');
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not estimate your size. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const close = () => {
    reset();
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <article className="flex h-full flex-col border-t-2 border-primary bg-card p-6 shadow-card sm:p-8">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Ruler className="h-5 w-5" />
        </span>
        <span className="eyebrow mt-6">Photo Sizing</span>
        <h3 className="mt-2 text-2xl font-light text-ink">Find my size with a photo</h3>
        <p className="mt-3 flex-1 text-[14px] leading-relaxed text-ink-soft">
          Use one photo of your open hand and a bank card to get an estimated US ring size.
        </p>
        <Button type="button" onClick={() => setIsOpen(true)} className="mt-6 min-h-12 w-full rounded-full">
          <Ruler className="h-4 w-4" />
          Estimate my size
        </Button>
      </article>
    );
  }

  return (
    <div className={`${compact ? '' : 'surface-card bg-white p-6 sm:p-8'} relative`}>
      {collapsible && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={close}
          aria-label="Close photo sizing"
          title="Close photo sizing"
          className="absolute right-4 top-4 z-10 rounded-full sm:right-6 sm:top-6"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      {!compact && <span className="eyebrow">Photo Sizing</span>}
      <h3 className={`${compact ? 'text-[15px] font-medium' : 'mt-2 pr-12 text-2xl font-extralight sm:text-3xl'} text-ink`}>
        Measure your size from a photo
      </h3>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
        Hold your open hand palm-up with any bank card resting flat in the center of your palm, then take a
        straight-on photo from above. The card&apos;s exact width lets us measure your finger and match it to a ring
        size.
      </p>
      <ul className="mt-3 space-y-1 text-xs text-ink-muted">
        <li className="flex items-start gap-2">
          <CreditCard className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Keep the entire card visible, with your fingers slightly open and relaxed around it, card details can be hidden.
        </li>
        <li>Fingers slightly apart, good light, camera straight above the hand.</li>
      </ul>

      <figure className="mt-4 flex items-center gap-4">
        <img
          src={handCardSample}
          alt="Example: open hand with the palm facing upward and a bank card resting flat in its center, photographed straight from above"
          className="h-24 w-24 shrink-0 rounded-xl border border-border object-cover"
          loading="lazy"
        />
        <figcaption className="text-xs leading-relaxed text-ink-muted">
          Take it like this: palm fully visible, card flat in the center, camera directly above.
        </figcaption>
      </figure>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-canvas transition-colors hover:border-primary"
          >
            {preview ? (
              <img src={preview} alt="Your uploaded hand with a card" className="h-full w-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-2 text-ink-muted">
                <Upload className="h-5 w-5" />
                <span className="text-sm">Upload hand + card photo</span>
                <span className="text-xs">JPG or PNG, up to 12 MB</span>
              </span>
            )}
          </button>

          <div className="mt-4">
            <p className="mb-2 text-[11px] uppercase tracking-wider text-ink-muted">Finger</p>
            <div className="flex flex-wrap gap-2">
              {FINGERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFinger(f)}
                  className={`rounded-full border px-4 py-2 text-sm capitalize transition-colors ${
                    finger === f
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-ink-soft hover:border-primary/40'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={run}
              disabled={!file || loading}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Ruler className="h-4 w-4" />
              {loading ? 'Measuring…' : 'Estimate my size'}
            </button>
            {(file || result) && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm text-ink-soft"
              >
                <RotateCcw className="h-4 w-4" />
                Start over
              </button>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-canvas p-5">
          {loading && <p className="text-sm text-ink-muted">Reading your photo, this takes a few seconds.</p>}

          {!loading && !result && !error && (
            <p className="text-sm text-ink-muted">Your estimated size appears here.</p>
          )}

          {result && result.ok && result.us_size && (
            <div>
              <div className="text-[11px] uppercase tracking-[3px] text-ink-muted">Estimated size</div>
              <div className="mt-1 text-4xl font-light text-ink">US {result.us_size}</div>
              {typeof result.inner_diameter_mm === 'number' && (
                <div className="mt-1 text-sm text-ink-soft">
                  ≈ {result.inner_diameter_mm.toFixed(1)} mm inner diameter
                </div>
              )}
              {result.confidence && (
                <div className="mt-2 text-xs capitalize text-ink-muted">Confidence: {result.confidence}</div>
              )}
              {result.note && <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">{result.note}</p>}
            </div>
          )}

          {result && !result.ok && (
            <p className="text-sm text-ink-soft">
              {result.note || 'We could not measure that photo. Please retake it with the card flat against your hand.'}
            </p>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <p className="mt-4 text-xs leading-relaxed text-ink-muted">
            Photo-based sizing is a helpful estimate, not an exact measurement, it can be off by a size. A
            free sizing kit ships before your ring, and you can change your size before dispatch.
          </p>
        </div>
      </div>
    </div>
  );
}
