import { useEffect, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const PDF = '/downloads/aion-printable-ring-sizer.pdf';

export function PrintableSizer({ label = 'Open printable sizer (PDF)' }: { label?: string }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!open) return;
    let active = true;
    let objectUrl: string | undefined;
    setError(false);
    fetch(PDF).then(async response => {
      if (!response.ok) throw new Error('PDF unavailable');
      const bytes = await response.arrayBuffer();
      if (new TextDecoder().decode(bytes.slice(0, 4)) !== '%PDF') throw new Error('Invalid PDF');
      if (!active) return;
      objectUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
      setUrl(objectUrl);
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); setUrl(null); };
  }, [open]);
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button type="button" variant="link" className="h-auto whitespace-normal px-0 text-left"><Download />{label}</Button></DialogTrigger>
    <DialogContent className="max-w-3xl">
      <DialogTitle>Printable ring sizer</DialogTitle>
      <DialogDescription>Print at 100% / Actual size. Check the 50 mm line with a ruler before measuring.</DialogDescription>
      {url ? <>
        <iframe title="aiOn printable ring sizer" src={url} className="h-[55vh] w-full rounded-md border border-border bg-background" />
        <Button asChild><a href={url} download="aion-printable-ring-sizer.pdf"><Download />Save PDF</a></Button>
      </> : error ? <p role="alert" className="text-sm text-destructive">The sizer couldn’t load. Close this window and try again.</p> : <div className="flex h-40 items-center justify-center gap-2 text-muted-foreground" role="status"><Loader2 className="h-5 w-5 animate-spin" />Loading sizer…</div>}
    </DialogContent>
  </Dialog>;
}