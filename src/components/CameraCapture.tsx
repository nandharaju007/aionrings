import { useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CameraCapture({ onCapture, onClose }: { onCapture: (f: File) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
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
        }
      } catch {
        setError('We could not open your camera. Please allow camera access, or upload a photo instead.');
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const capture = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const c = document.createElement('canvas');
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d')!.drawImage(v, 0, 0);
    c.toBlob(
      (b) => {
        if (!b) return;
        streamRef.current?.getTracks().forEach((t) => t.stop());
        onCapture(new File([b], 'hand-camera.jpg', { type: 'image/jpeg' }));
      },
      'image/jpeg',
      0.92,
    );
  };

  return (
    <div>
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-border bg-foreground sm:aspect-[4/3]">
        <video
          ref={videoRef}
          playsInline
          muted
          onLoadedMetadata={() => setReady(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {!error && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <div className="aspect-[85.6/53.98] w-[42%] rounded-lg border-2 border-dashed border-primary-foreground/90 shadow-[0_0_0_9999px_hsl(var(--foreground)/0.25)]" />
            <p className="mt-3 rounded-full bg-foreground/60 px-3 py-1 text-xs text-primary-foreground">
              Line up the card inside the box, palm up
            </p>
          </div>
        )}
        {error && <p className="absolute inset-0 flex items-center p-6 text-center text-sm text-primary-foreground">{error}</p>}
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        <Button type="button" onClick={capture} disabled={!ready || !!error} className="rounded-full">
          <Camera className="h-4 w-4" />
          Take photo
        </Button>
        <Button type="button" variant="outline" onClick={onClose} className="rounded-full">
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
