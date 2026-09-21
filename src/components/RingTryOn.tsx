import { useRef, useState } from 'react';
import { Upload, Sparkles, RotateCcw, Download, X } from 'lucide-react';
import { streamImage } from '@/lib/stream-image';

const FINISHES = ['Midnight Black', 'Titanium Silver', 'Rose Gold'];

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ring-try-on`;

export function RingTryOn() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [finish, setFinish] = useState(FINISHES[0]);
  const [result, setResult] = useState<string | null>(null);
  const [isFinal, setIsFinal] = useState(false);
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
    setIsFinal(false);
    setFile(selected);
    setSourcePreview(URL.createObjectURL(selected));
  };

  const run = async () => {
    if (!file || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setIsFinal(false);

    const form = new FormData();
    form.append('image', file, file.name || 'hand.png');
    form.append('finish', finish);

    try {
      await streamImage(
        FUNCTION_URL,
        form,
        (dataUrl, final) => {
          setResult(dataUrl);
          setIsFinal(final);
        },
        undefined,
        {
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string}`,
        },
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create the preview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setSourcePreview(null);
    setResult(null);
    setIsFinal(false);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const close = () => {
    reset();
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Sparkles className="h-4 w-4" />
          See it on your hand
        </button>
      </div>
    );
  }

  return (
    <div className="surface-card relative bg-white p-6 sm:p-8">
      <button
        type="button"
        onClick={close}
        aria-label="Close virtual try-on"
        title="Close virtual try-on"
        className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:right-6 sm:top-6"
      >
        <X className="h-4 w-4" />
      </button>
      <span className="eyebrow">Virtual Try-On</span>
      <h2 className="mt-2 pr-12 text-2xl font-extralight text-ink sm:text-3xl">See it on your hand</h2>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">
        Upload a clear photo of your hand and we&apos;ll show how the aiOn ring looks on your index finger.
        Your photo is used only to create this preview and is never stored.
      </p>
      <p className="mt-2 max-w-xl text-xs leading-relaxed text-ink-muted">
        For the best placement, show your whole hand flat with fingers separated and the index finger fully visible.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mt-7">
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
            className="w-full aspect-square rounded-2xl border border-dashed border-border hover:border-primary transition-colors overflow-hidden flex items-center justify-center bg-canvas"
          >
            {sourcePreview ? (
              <img src={sourcePreview} alt="Your uploaded hand" className="w-full h-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-2 text-ink-muted">
                <Upload className="w-6 h-6" />
                <span className="text-sm">Upload a hand photo</span>
                <span className="text-xs">JPG or PNG, up to 12 MB</span>
              </span>
            )}
          </button>

          <div className="mt-5">
            <p className="text-[11px] uppercase tracking-wider text-ink-muted mb-2">Finish</p>
            <div className="flex flex-wrap gap-2">
              {FINISHES.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFinish(f)}
                  className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                    finish === f
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-ink-soft hover:border-primary/40'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              type="button"
              onClick={run}
              disabled={!file || loading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Creating preview…' : 'Preview on my hand'}
            </button>
            {(file || result) && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-border text-sm text-ink-soft"
              >
                <RotateCcw className="w-4 h-4" />
                Start over
              </button>
            )}
          </div>
        </div>

        <div>
          <div className="aspect-square rounded-2xl overflow-hidden border border-border bg-canvas flex items-center justify-center">
            {result ? (
              <img
                src={result}
                alt="Preview of the aiOn ring on your index finger"
                className={`w-full h-full object-cover transition-all duration-500 ${isFinal ? '' : 'blur-xl scale-105'}`}
              />
            ) : (
              <span className="text-sm text-ink-muted px-6 text-center">
                {loading ? 'Rendering your preview — this can take up to a minute.' : 'Your preview appears here.'}
              </span>
            )}
          </div>

          {result && isFinal && (
            <a
              href={result}
              download="aion-ring-try-on.png"
              className="inline-flex items-center gap-2 mt-4 text-sm text-primary"
            >
              <Download className="w-4 h-4" />
              Save this preview
            </a>
          )}

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          <p className="mt-4 text-xs text-ink-muted leading-relaxed">
            This is an AI-generated visualisation for illustration only — actual fit, size and finish may differ.
            Use the sizing guide before ordering.
          </p>
        </div>
      </div>
    </div>
  );
}
