import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Ruler, RotateCcw, X, Camera, ArrowLeft, Check, Loader2 } from 'lucide-react';
import handCardSample from '@/assets/hand-card-sample-palm.jpg';
import { Button } from '@/components/ui/button';
import { CameraCapture } from '@/components/CameraCapture';
import { isPhoneDevice } from '@/lib/phone-camera';
import { FLAG_HELP, formatUs } from '@/lib/sizing-flags';

const FINGERS = ['index', 'middle', 'ring'] as const;

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ring-sizer`;

type SizeResult = {
  ok?: boolean;
  us_size?: string | null;
  inner_diameter_mm?: number | null;
  confidence?: string | null;
  projected_width_mm?: number | null;
  requires_physical_confirmation?: boolean;
  note?: string;
  error?: string;
  quality_flags?: string[];
  sizes_enabled?: boolean;
  estimate?: { us: number; low: number; high: number } | null;
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
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraSession, setCameraSession] = useState(0);
  const [phoneCamera] = useState(() => isPhoneDevice(navigator));

  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const openCamera = () => {
    if (!phoneCamera) return;
    setError(null);
    setResult(null);
    setCameraSession((session) => session + 1);
    setCameraOn(true);
  };

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
    let size: { w: number; h: number } | null = null;
    if (!size) {
      try {
        const bmp = await createImageBitmap(file);
        size = { w: bmp.width, h: bmp.height };
        bmp.close();
      } catch { size = null; }
    }
    if (size) {
      form.append('img_width', String(size.w));
      form.append('img_height', String(size.h));
    }

    try {
      const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
      const res = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        body: form,
      });
      const data = (await res.json()) as SizeResult;
      if (!res.ok) throw new Error(data.error || 'Could not check your photo.');
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not check your photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setCameraOn(false);
    setCameraSession((session) => session + 1);
    if (inputRef.current) inputRef.current.value = '';
  };

  const close = () => {
    reset();
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <article className="flex h-full flex-col border-t-2 border-primary bg-card p-6 shadow-card sm:p-8">
        <Camera className="h-6 w-6 text-primary" />
        <span className="eyebrow mt-6">Photo check</span>
        <h3 className="mt-2 text-2xl font-light text-ink">Start with a photo</h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
          Check visible finger width, then confirm your US size with a physical sizer.
        </p>
        <Button type="button" onClick={() => setIsOpen(true)} className="mt-6 min-h-12 w-full">
          <Camera />Start photo check
        </Button>
      </article>
    );
  }

  const step = result ? 3 : file ? 2 : 1;

  return (
    <div className={`${compact ? '' : 'bg-card p-6 sm:p-8'} relative min-w-0 text-ink`}>
      {collapsible && (
        <Button type="button" variant="ghost" size="icon" onClick={close} disabled={loading}
          aria-label="Close photo sizing" title="Close photo sizing" className="absolute right-3 top-3">
          <X />
        </Button>
      )}
      <h3 className="pr-10 text-xl font-medium">Your photo check</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Photos check finger width, not US ring size. Confirm fit with a physical sizer.
      </p>
      <ol aria-label="Photo check progress" className="mt-5 grid grid-cols-3 border-b border-border pb-4 text-xs">
        {['Photo', 'Check', 'Confirm fit'].map((label, i) => (
          <li key={label} aria-current={step === i + 1 ? 'step' : undefined}
            className={`flex items-center gap-2 ${step === i + 1 ? 'font-medium text-primary' : 'text-ink-muted'}`}>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current">
              {step > i + 1 ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>
      <input ref={inputRef} type="file" accept="image/*" className="sr-only" aria-label="Upload hand photo"
        onChange={(e) => { pickFile(e.target.files?.[0]); e.target.value = ''; }} />

      {!file && (
        <div className="mt-5">
          <figure>
            <img src={handCardSample} alt="Open palm with a bank card flat in its center and all fingers visible"
              className="mx-auto aspect-square w-full max-w-[280px] rounded-lg border border-border object-cover" loading="lazy" />
            <figcaption className="mt-3 text-center text-sm leading-relaxed text-ink-soft">
              No rings. Card flat on your palm. All fingers visible.<br />Hold your phone straight above.
            </figcaption>
          </figure>
          <div className="mt-5 grid gap-2">
            {phoneCamera && (
              <Button type="button" onClick={openCamera} className="h-12 w-full"><Camera />Take a photo</Button>
            )}
            <Button type="button" variant={phoneCamera ? 'outline' : 'default'} onClick={() => inputRef.current?.click()}
              className="h-12 w-full"><Upload />{phoneCamera ? 'Choose an existing photo' : 'Upload a photo'}</Button>
          </div>
          <p className="mt-2 text-center text-xs text-ink-muted">
            {phoneCamera ? 'JPG or PNG · up to 12 MB' : 'Camera is phone-only · upload JPG or PNG, up to 12 MB'}
          </p>
        </div>
      )}

      {file && !result && (
        <div className="mt-5">
          <img src={preview ?? undefined} alt="Your hand photo" className="mx-auto max-h-[320px] w-full rounded-lg object-contain" />
          <fieldset disabled={loading} className="mt-4">
            <legend className="mb-2 text-sm font-medium">Which finger will you wear it on?</legend>
            <div className="grid grid-cols-3 gap-2">
              {FINGERS.map((f) => (
                <Button key={f} type="button" variant={finger === f ? 'default' : 'outline'} aria-pressed={finger === f}
                  onClick={() => { setFinger(f); setError(null); }}
                  className={`h-11 capitalize ${finger === f ? 'hover:bg-primary' : 'hover:bg-background hover:text-foreground'}`}>{f}</Button>
              ))}
            </div>
          </fieldset>
          <Button type="button" onClick={run} disabled={loading} className="mt-5 h-12 w-full">
            {loading ? <Loader2 className="animate-spin" /> : <Ruler />}
            {loading ? 'Checking your photo…' : 'Check photo'}
          </Button>
          <Button type="button" variant="ghost" onClick={reset} disabled={loading} className="mt-2 w-full">
            <RotateCcw />Use another photo
          </Button>
        </div>
      )}

      {result && (
        <div className="mt-5" role="status" aria-live="polite">
          {result.quality_flags && result.quality_flags.length > 0 ? (
            <>
              <p className="text-lg font-medium">Let’s fix the photo</p>
              <ul className="mt-2 space-y-2 text-sm text-ink-soft">
                {result.quality_flags.map((f) => (
                  <li key={f}><span className="font-medium text-ink">{FLAG_HELP[f]?.title ?? f}.</span> {FLAG_HELP[f]?.fix}</li>
                ))}
              </ul>
              <Button type="button" variant="outline" onClick={reset} className="mt-4 h-12 w-full"><RotateCcw />Retake photo</Button>
            </>
          ) : result.sizes_enabled && result.estimate ? (
            <>
              <p className="text-lg font-medium">Estimated size: US {formatUs(result.estimate.low)}–{formatUs(result.estimate.high)}</p>
              <p className="mt-2 text-sm text-ink-soft">A photo estimate, not a fitting. Confirm with the sizing kit before ordering.</p>
            </>
          ) : (
            <>
              <p className="text-lg font-medium">Photo received — no size yet</p>
              <p className="mt-2 text-sm text-ink-soft">This isn't an error. Photo sizes are still being tested for accuracy, so we don't show a US size yet. Use the free sizing kit to be sure of your size.</p>
            </>
          )}
          <div className="mt-5 border-t border-border pt-4">
            <h4 className="font-medium">Next: confirm your US size</h4>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">Use the free sizing kit or a physical ring sizer, then match your confirmed measurement to the size chart.</p>
            <Button asChild className="mt-4 h-12 w-full"><Link to="/size-chart"><Ruler />View US size chart</Link></Button>
            <Button type="button" variant="ghost" onClick={reset} className="mt-2 w-full"><ArrowLeft />Start again</Button>
          </div>
        </div>
      )}
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
      <Link to="/faq" className="mt-4 inline-block text-xs text-primary underline underline-offset-4">Sizing questions?</Link>
      {cameraOn && phoneCamera && (
        <CameraCapture key={cameraSession} onCapture={(f) => { setCameraOn(false); pickFile(f); }} onClose={() => setCameraOn(false)} />
      )}
    </div>
  );
}
