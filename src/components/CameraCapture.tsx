import { useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { HandLandmarker } from '@mediapipe/tasks-vision';

// Guide box: centered, 56% of the preview width, bank-card aspect ratio.
const BOX_W = 0.56;
const MAX_BOX_W = 420; // Must match the max-w cap on the rendered guide box below.
const CARD_ASPECT = 85.6 / 53.98;
const HOLD_FRAMES = 8; // ~1 second of steady, correct framing
// Must match the installed package version, otherwise the detector fails to load silently.
const WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';
const MODEL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

type Status = { ok: boolean; msg: string };

// Load the hand detector once and keep it for the whole visit. Closing and re-creating it
// on "Start over" often fails silently on phones, which stopped auto-capture the second time.
let detectorPromise: Promise<HandLandmarker> | null = null;
function getDetector() {
  if (!detectorPromise) {
    detectorPromise = (async () => {
      const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision');
      const fileset = await FilesetResolver.forVisionTasks(WASM);
      const make = (delegate: 'GPU' | 'CPU') =>
        HandLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL, delegate },
          runningMode: 'IMAGE',
          numHands: 1,
          minHandDetectionConfidence: 0.3,
          minHandPresenceConfidence: 0.3,
        });
      try { return await make('GPU'); } catch { return await make('CPU'); }
    })().catch((e) => { detectorPromise = null; throw e; });
  }
  return detectorPromise;
}

export function CameraCapture({ onCapture, onClose }: { onCapture: (f: File) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const detectorFallbackRef = useRef(false);
  const doneRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<Status>({ ok: false, msg: 'Line up the card inside the box, palm up' });
  const [progress, setProgress] = useState(0);
  const [autoAvailable, setAutoAvailable] = useState(true);

  useEffect(() => {
    let cancelled = false;
    doneRef.current = false;
    landmarkerRef.current = null;
    detectorFallbackRef.current = false;
    streamRef.current = null;
    setError(null);
    setReady(false);
    setProgress(0);
    setAutoAvailable(true);
    setStatus({ ok: false, msg: 'Line up the card inside the box, palm up' });

    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1440 } },
          audio: false,
        });
        if (cancelled) return stream.getTracks().forEach((t) => t.stop());
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
          if (!cancelled && videoRef.current.videoWidth) setReady(true);
        }
      } catch {
        setError('We could not open your camera. Please allow camera access, or upload a photo instead.');
      }
    })();
    // Load the hand detector in the background; manual capture still works if it fails.
    (async () => {
      try {
        const lm = await getDetector();
        if (cancelled) return;
        landmarkerRef.current = lm;
      } catch {
        if (!cancelled) {
          detectorFallbackRef.current = true;
          setAutoAvailable(true);
        }
      }
    })();
    // Some phones take a long time to initialise MediaPipe, or block its model download.
    // Card detection can still auto-capture a correctly framed photo in that case.
    const fallbackTimer = window.setTimeout(() => {
      if (!cancelled) detectorFallbackRef.current = true;
    }, 4000);
    return () => {
      cancelled = true;
      window.clearTimeout(fallbackTimer);
      const stream = streamRef.current;
      streamRef.current = null;
      stream?.getTracks().forEach((t) => t.stop());
      landmarkerRef.current = null;
      doneRef.current = false;
    };
  }, []);

  const capture = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth || doneRef.current) return;
    doneRef.current = true;
    const c = document.createElement('canvas');
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const context = c.getContext('2d');
    if (!context) {
      doneRef.current = false;
      setError('We could not take the photo. Please try again.');
      return;
    }
    context.drawImage(v, 0, 0);
    c.toBlob(
      (b) => {
        if (!b) {
          doneRef.current = false;
          setError('We could not take the photo. Please try again.');
          return;
        }
        streamRef.current?.getTracks().forEach((t) => t.stop());
        onCapture(new File([b], 'hand-camera.jpg', { type: 'image/jpeg' }));
      },
      'image/jpeg',
      0.92,
    );
  };

  // Auto-detection loop (~8 checks per second).
  useEffect(() => {
    if (!ready || error) return;
    const small = document.createElement('canvas');
    let streak = 0;
    const id = window.setInterval(() => {
      const v = videoRef.current;
      const lm = landmarkerRef.current;
      const box = boxRef.current?.parentElement;
      if (!v || !box || !v.videoWidth || doneRef.current) return;
      if (!lm && !detectorFallbackRef.current) {
        setStatus({ ok: false, msg: 'Getting auto-capture ready…' });
        return;
      }
      const s = check(v, box, small, lm, detectorFallbackRef.current);
      // Forgive a single shaky frame instead of restarting the countdown.
      streak = s.ok ? streak + 1 : Math.max(0, streak - 2);
      setStatus(s.ok ? { ok: true, msg: 'Perfect, hold still…' } : s);
      setProgress(Math.min(1, streak / HOLD_FRAMES));
      if (streak >= HOLD_FRAMES) {
        window.clearInterval(id);
        capture();
      }
    }, 125);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, error]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-foreground" style={{ height: '100dvh' }}>
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <video
          ref={videoRef}
          playsInline
          muted
          onLoadedMetadata={() => setReady(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {!error && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <div
              ref={boxRef}
              className={`aspect-[85.6/53.98] w-[56%] max-w-[420px] rounded-lg border-2 shadow-[0_0_0_9999px_hsl(var(--foreground)/0.25)] transition-colors ${
                status.ok ? 'border-solid border-primary' : 'border-dashed border-primary-foreground/90'
              }`}
            />
            <p className="mt-3 max-w-[90%] rounded-full bg-foreground/60 px-3 py-1 text-center text-xs text-primary-foreground">
              {status.msg}
            </p>
            {progress > 0 && (
              <div className="mt-2 h-1 w-32 overflow-hidden rounded-full bg-primary-foreground/30">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress * 100}%` }} />
              </div>
            )}
          </div>
        )}
        {error && <p className="absolute inset-0 flex items-center p-6 text-center text-sm text-primary-foreground">{error}</p>}
      </div>
      <div className="shrink-0 bg-foreground px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <p className="text-center text-xs text-primary-foreground/70">
          {autoAvailable
            ? 'The photo is taken automatically once your hand and card are lined up. You can also tap "Take photo".'
            : 'Tap "Take photo" when the card is inside the box.'}
        </p>
        <div className="mt-3 flex items-center justify-center gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button type="button" onClick={capture} disabled={!ready || !!error} className="rounded-full">
            <Camera className="h-4 w-4" />
            Take photo
          </Button>
        </div>
      </div>
    </div>
  );
}

// Draw the visible (object-cover) part of the video into a small canvas, then check hand + card.
function check(
  v: HTMLVideoElement,
  container: HTMLElement,
  c: HTMLCanvasElement,
  lm: HandLandmarker | null,
  allowCardFallback: boolean,
): Status {
  const cw = container.clientWidth, ch = container.clientHeight;
  const W = 320, H = Math.round((W * ch) / cw);
  c.width = W; c.height = H;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { ok: false, msg: 'Getting auto-capture ready…' };
  const scale = Math.max(cw / v.videoWidth, ch / v.videoHeight);
  const sw = cw / scale, sh = ch / scale;
  ctx.drawImage(v, (v.videoWidth - sw) / 2, (v.videoHeight - sh) / 2, sw, sh, 0, 0, W, H);

  // Guide box in canvas pixels, capped exactly like the rendered box (max-w-[420px]).
  const bw = W * Math.min(BOX_W, MAX_BOX_W / container.clientWidth), bh = bw / CARD_ASPECT;
  const bx = (W - bw) / 2, by = (H - bh) / 2;

  // Card: look for its edges near the guide, rather than requiring them to sit on
  // the guide's exact pixels. This works with patterned and dark bank cards too.
  const img = ctx.getImageData(0, 0, W, H).data;
  const lum = (x: number, y: number) => {
    const i = (Math.round(y) * W + Math.round(x)) * 4;
    return 0.299 * img[i] + 0.587 * img[i + 1] + 0.114 * img[i + 2];
  };
  const cardScore = (x: number, y: number, width: number) => {
    const height = width / CARD_ASPECT;
    const band = Math.max(3, width * 0.055);
    let hits = 0, samples = 0;
    for (let t = 0.12; t <= 0.88; t += 0.08) {
      const pairs: [number, number, number, number][] = [
        [x + width * t, y + band, x + width * t, y - band],
        [x + width * t, y + height - band, x + width * t, y + height + band],
        [x + band, y + height * t, x - band, y + height * t],
        [x + width - band, y + height * t, x + width + band, y + height * t],
      ];
      for (const [ix, iy, ox, oy] of pairs) {
        if (ix < 0 || iy < 0 || ox < 0 || oy < 0 || ix >= W || iy >= H || ox >= W || oy >= H) continue;
        samples++;
        if (Math.abs(lum(ix, iy) - lum(ox, oy)) > 14) hits++;
      }
    }
    return samples ? hits / samples : 0;
  };
  let bestCardScore = 0;
  for (const size of [0.72, 0.84, 0.96, 1.06]) {
    for (const dx of [-0.08, 0, 0.08]) {
      for (const dy of [-0.08, 0, 0.08]) {
        const width = bw * size;
        bestCardScore = Math.max(bestCardScore, cardScore(bx + (bw - width) / 2 + bw * dx, by + (bh - width / CARD_ASPECT) / 2 + bh * dy, width));
      }
    }
  }
  // Prefer hand landmarks when available. The tolerances deliberately allow a
  // card to cover part of the palm, which otherwise makes open hands look closed.
  if (lm) {
    let res;
    try { res = lm.detect(c); } catch { res = null; }
    const hand = res?.landmarks?.[0];
    if (!hand) {
      if (allowCardFallback && bestCardScore >= 0.12) return { ok: true, msg: '' };
      return { ok: false, msg: 'Show your open hand, palm up' };
    }

    if (bestCardScore < 0.08) return { ok: false, msg: 'Place the card flat inside the box' };

    const px = hand.map((p) => ({ x: p.x * W, y: p.y * H }));
    if (hand.some((p) => p.x < 0.01 || p.x > 0.99 || p.y < 0.01 || p.y > 0.99))
      return { ok: false, msg: 'Move back so your whole hand is in view' };

    const d = (a: number, b: number) => Math.hypot(px[a].x - px[b].x, px[a].y - px[b].y);
    const openCount = [[8, 6], [12, 10], [16, 14], [20, 18]].filter(([tip, pip]) => d(tip, 0) > d(pip, 0) * 1.04).length;
    if (openCount < 3) return { ok: false, msg: 'Open your fingers a little' };

    const ratio = d(5, 17) / bw;
    if (ratio < 0.42) return { ok: false, msg: 'Move closer' };
    if (ratio > 1.6) return { ok: false, msg: 'Move a little farther away' };

    const pc = [0, 5, 9, 13, 17].reduce((a, i) => ({ x: a.x + px[i].x / 5, y: a.y + px[i].y / 5 }), { x: 0, y: 0 });
    if (pc.x < bx - bw * 0.3 || pc.x > bx + bw * 1.3 || pc.y < by - bh * 0.65 || pc.y > by + bh * 1.65)
      return { ok: false, msg: 'Center your palm under the box' };
  } else if (bestCardScore < 0.12) {
    return { ok: false, msg: 'Place the card flat inside the box' };
  }

  return { ok: true, msg: '' };
}
