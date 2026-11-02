import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Ruler, RotateCcw, X, Camera } from 'lucide-react';
import handCardSample from '@/assets/hand-card-sample-palm.jpg';
import { Button } from '@/components/ui/button';
import { CardAligner, defaultCorners, type Point } from '@/components/CardAligner';
import { CameraCapture } from '@/components/CameraCapture';
import { isPhoneDevice } from '@/lib/phone-camera';

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
  const [corners, setCorners] = useState<Point[] | null>(null);
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraSession, setCameraSession] = useState(0);
  const [cornersTouched, setCornersTouched] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [phoneCamera] = useState(() => isPhoneDevice(navigator));

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
    setCorners(null);
    setImgSize(null);
    setAdjusting(false);
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
    let size = imgSize;
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
    if (corners && imgSize && cornersTouched) {
      form.append(
        'card_corners',
        JSON.stringify({ width: imgSize.w, height: imgSize.h, corners: corners.map((p) => [p.x, p.y]) }),
      );
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
    setCorners(null);
    setImgSize(null);
    setCornersTouched(false);
    setAdjusting(false);
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
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Ruler className="h-5 w-5" />
        </span>
        <span className="eyebrow mt-6">Photo Sizing</span>
        <h3 className="mt-2 text-2xl font-light text-ink">Check my finger with a photo</h3>
        <p className="mt-3 flex-1 text-[14px] leading-relaxed text-ink-soft">
          Remove all rings, then use one photo of your open hand and a bank card to check visible finger width. Confirm your US size with a physical sizer.
        </p>
        <Button type="button" onClick={() => setIsOpen(true)} className="mt-6 min-h-12 w-full rounded-full">
          <Ruler className="h-4 w-4" />
          Check my photo
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
        Photo sizing · confirmation required
      </h3>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
        Remove all rings, then take one photo of your open palm with a bank card. A photo cannot reliably confirm your ring size.
      </p>
      <Link to="/faq" className="mt-2 inline-block text-xs text-primary underline underline-offset-4">Sizing questions? Read the FAQ</Link>

      <figure className="mt-4">
        <img
          src={handCardSample}
          alt="Example: open hand with the palm facing upward and a bank card resting flat in its center, photographed straight from above"
          className="mx-auto aspect-square w-full max-w-[280px] rounded-2xl border border-border object-cover shadow-card sm:max-w-[340px]"
          loading="lazy"
        />
        <figcaption className="mt-2 text-center text-xs text-ink-muted">
          Palm up, no rings, card flat in the center of your palm, all fingers visible, camera directly above.
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
          {preview ? (
            <div>
              <CardAligner
                src={preview}
                corners={adjusting ? corners : null}
                onChange={(c) => {
                  setCorners(c);
                  setCornersTouched(true);
                }}
                onImageLoad={(w, h) => {
                  setImgSize({ w, h });
                  setCorners(defaultCorners(w / h));
                  setCornersTouched(false);
                }}
              />
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                {adjusting
                  ? 'Place each dot precisely on an outer card corner.'
                  : 'We find the card in your photo automatically. Tap "Check my photo" to check visible finger width, not US size.'}
              </p>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="text-xs text-primary underline-offset-2 hover:underline"
                >
                  Use a different photo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (adjusting) setCornersTouched(false);
                    setAdjusting(!adjusting);
                  }}
                  className="text-xs text-ink-muted underline-offset-2 hover:underline"
                >
                  {adjusting ? 'Skip, detect the card for me' : 'Optional: mark the card myself'}
                </button>
              </div>
            </div>
          ) : cameraOn && phoneCamera ? (
            <CameraCapture
              key={cameraSession}
              onCapture={(f) => {
                setCameraOn(false);
                pickFile(f);
              }}
              onClose={() => setCameraOn(false)}
            />
          ) : (
            <div className="grid gap-3">
              {phoneCamera ? <Button
                type="button"
                onClick={openCamera}
                variant="outline"
                className="flex h-auto aspect-[4/3] w-full items-center justify-center overflow-hidden whitespace-normal rounded-2xl border-2 border-dashed border-primary/50 bg-canvas transition-colors hover:border-primary"
              >
                <span className="flex flex-col items-center gap-2 text-ink-muted">
                  <Camera className="h-5 w-5 text-primary" />
                  <span className="text-sm text-ink">Use my camera</span>
                  <span className="text-xs">Opens full screen on your phone</span>
                </span>
              </Button> : <p className="text-sm text-ink-muted">Camera sizing is available on phones only.</p>}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm text-ink-soft hover:border-primary/40"
              >
                <Upload className="h-4 w-4" />
                Upload a photo instead (JPG or PNG, up to 12 MB)
              </button>
            </div>
          )}

          <div className="mt-4">
            <p className="mb-2 text-[11px] uppercase tracking-wider text-ink-muted">Finger</p>
            <div className="flex flex-wrap gap-2">
              {FINGERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => { setFinger(f); setResult(null); setError(null); }}
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
            <Button
              type="button"
              onClick={run}
              disabled={!file || loading}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Ruler className="h-4 w-4" />
              {loading ? 'Checking photo…' : 'Check my photo'}
            </Button>
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
            <p className="text-sm text-ink-muted">Confirm your ring size with the sizing kit or a physical ring sizer. Photo sizing is not validated for choosing a size.</p>
          )}

          {result && (
            <div role="status" aria-live="polite">
              <p className="text-sm font-medium text-ink">
                {typeof result.projected_width_mm === 'number' ? 'Photo checked — confirm your fit' : 'No reliable width reading'}
              </p>
              {typeof result.projected_width_mm === 'number' && (
                <p className="mt-2 text-sm text-ink-soft">Visible finger width: ≈ {result.projected_width_mm.toFixed(1)} mm (not ring diameter)</p>
              )}
              <p className="mt-2 text-sm text-ink-soft">
                {typeof result.projected_width_mm === 'number'
                  ? 'Your photo was processed. This is not a camera error: visible finger width cannot be converted reliably into a US ring size.'
                  : 'We could not reliably measure this photo. Retaking it may improve the width reading, but will not provide a confirmed US ring size.'}
              </p>
              <p className="mt-2 text-sm text-ink-soft">Use a physical ring sizer or the sizing kit to confirm your fit, then compare your measurement with the size chart.</p>
              <Button asChild variant="outline" className="mt-4 gap-2">
                <Link to="/size-chart"><Ruler className="h-4 w-4" />View US size chart</Link>
              </Button>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <p className="mt-4 text-xs leading-relaxed text-ink-muted">
            Photo errors can exceed one ring size. Do not choose your size from a photo result.
            Confirm with the free sizing kit before your ring is dispatched.
          </p>
        </div>
      </div>
    </div>
  );
}
