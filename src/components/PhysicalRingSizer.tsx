import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Circle, Ruler, RotateCcw, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RingSizer } from '@/components/RingSizer';
import { MeasurementVideo } from '@/components/MeasurementVideo';
import { PrintableSizer } from '@/components/PrintableSizer';
import { physicalSize, type PhysicalMethod } from '@/lib/physical-sizing';

function MeasurementVisual({ method, step }: { method: PhysicalMethod; step: number }) {
  return (
    <svg viewBox="0 0 320 185" role="img" aria-label={method === 'diameter' ? 'Measure straight across the ring opening, from inside edge to inside edge, with a real ruler' : step === 0 ? 'Wrap a narrow strip of paper around the finger and mark where it overlaps' : 'Lay the paper flat against a real ruler and measure from the start to your mark'} className="mx-auto w-full max-w-sm text-primary">
      {method === 'diameter' ? <>
        <circle cx="160" cy="86" r="66" className="fill-background stroke-border" strokeWidth="18" />
        <circle cx="160" cy="86" r="57" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M103 86h114m-57-8v16M103 80v12m114-12v12" fill="none" stroke="currentColor" strokeWidth="2" />
        <text x="160" y="68" textAnchor="middle" className="fill-foreground text-[12px]">Inside edge → inside edge</text>
        <path d="M65 157h190M65 157v10m19-10v6m19-6v10m19-10v6m19-6v10m19-10v6m19-6v10m19-10v6m19-6v10m19-10v6m19-6v10" stroke="currentColor" fill="none" />
      </> : step === 0 ? <>
        <rect x="132" y="12" width="56" height="155" rx="28" className="fill-secondary stroke-border" strokeWidth="2" />
        <path d="M110 102c0-25 100-25 100 0v23c0 25-100 25-100 0z" className="fill-background" stroke="currentColor" strokeWidth="2" />
        <path d="M110 102c0 25 100 25 100 0m-50 19v20m-9-10h18" fill="none" stroke="currentColor" strokeWidth="2" />
        <text x="230" y="125" className="fill-foreground text-[12px]">Mark here</text>
      </> : <>
        <rect x="38" y="55" width="246" height="32" className="fill-background stroke-border" strokeWidth="2" />
        <path d="M44 48v47m194-47v47M44 115h194m-194-5v10m194-10v10" stroke="currentColor" strokeWidth="2" />
        <text x="44" y="38" textAnchor="middle" className="fill-foreground text-[12px]">Start</text>
        <text x="238" y="38" textAnchor="middle" className="fill-foreground text-[12px]">Your mark</text>
        <text x="141" y="140" textAnchor="middle" className="fill-foreground text-[12px]">Measure this length in mm</text>
        {Array.from({ length: 25 }, (_, i) => <path key={i} d={`M${44 + i * 8} 155v${i % 5 === 0 ? 14 : 7}`} stroke="currentColor" />)}
      </>}
    </svg>
  );
}

export function PhysicalRingSizer({ onSelect, selectionLabel = 'Use this size', showPhoto = true }: { onSelect?: (size: string) => void; selectionLabel?: string; showPhoto?: boolean }) {
  const [method, setMethod] = useState<PhysicalMethod | null>(null);
  const [stage, setStage] = useState(0);
  const [visualStep, setVisualStep] = useState(0);
  const [repeatStep, setRepeatStep] = useState(false);
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  const [fit, setFit] = useState(false);
  const [selected, setSelected] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const result = method && submitted ? physicalSize(method, Number(first), Number(second)) : null;
  const reset = () => { setMethod(null); setStage(0); setVisualStep(0); setRepeatStep(false); setFirst(''); setSecond(''); setFit(false); setSelected(false); setSubmitted(false); };
  return (
    <div className="min-w-0 text-foreground">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-xs text-primary"><Ruler className="h-4 w-4" />Find your fit</span>
        <span className="text-xs text-muted-foreground">About 2 minutes · real ruler needed</span>
      </div>
      <h3 className="mt-3 text-2xl font-light">Find your aiOn ring size.</h3>
      <ol aria-label="Sizing progress" className="mt-5 grid grid-cols-3 border-b border-border pb-4 text-xs">
        {['Choose', 'Measure', 'Your size'].map((label, i) => <li key={label} aria-current={stage === i ? 'step' : undefined} className={`flex items-center gap-2 ${stage === i ? 'text-primary font-medium' : 'text-muted-foreground'}`}><span className="flex h-6 w-6 items-center justify-center rounded-full border border-current">{stage > i ? <Check className="h-3 w-3" /> : i + 1}</span>{label}</li>)}
      </ol>
      {!method ? <>
        <p className="mt-5 text-sm text-muted-foreground">What would you like to measure?</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Button variant="outline" type="button" onClick={() => { setMethod('diameter'); setStage(1); }} className="h-auto min-h-24 justify-start gap-3 whitespace-normal bg-card px-4 py-5 text-left hover:bg-secondary hover:text-foreground"><Circle className="shrink-0 text-primary" /><span>A ring that fits<span className="mt-1 block text-xs font-normal text-muted-foreground">You’ll need your ring and a ruler</span></span></Button>
          <Button variant="outline" type="button" onClick={() => { setMethod('circumference'); setStage(1); }} className="h-auto min-h-24 justify-start gap-3 whitespace-normal bg-card px-4 py-5 text-left hover:bg-secondary hover:text-foreground"><Scissors className="shrink-0 text-primary" /><span>My finger<span className="mt-1 block text-xs font-normal text-muted-foreground">You’ll need paper, a pen and a ruler</span></span></Button>
        </div>
      </> : stage === 1 ? <>
        <p className="mt-5 text-sm font-medium">{repeatStep ? 'One quick double-check' : method === 'circumference' && visualStep === 0 ? 'Wrap and mark' : 'Measure with your ruler'}</p>
        <div className="mt-3 rounded-lg bg-secondary/60 p-3 motion-safe:animate-in motion-safe:fade-in">
          <MeasurementVisual method={method} step={visualStep} />
        </div>
        <p className="mt-3 text-sm font-medium">{repeatStep ? method === 'diameter' ? 'Measure the inside opening again.' : 'Wrap again, mark, then measure the new strip.' : method === 'diameter' ? 'Measure across the inside opening, not the metal.' : visualStep === 0 ? 'Wrap a 5 mm-wide paper strip. Mark where it overlaps.' : 'Lay the strip flat. Measure from the start to your mark.'}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{method === 'diameter' ? 'Choose a ring that fits your intended finger. Use a real millimetre ruler; this picture is not actual size.' : 'Remove any rings. Keep the paper snug, not tight; it should slide over your knuckle. Use a real millimetre ruler.'}</p>
        {method === 'circumference' && visualStep === 0 ? <Button type="button" onClick={() => setVisualStep(1)} className="mt-5 h-12 w-full">I’ve marked the strip<ArrowRight /></Button> : <>
          {repeatStep && <p className="mt-4 text-xs text-muted-foreground">First measurement: {first} mm</p>}
          <label className="mt-5 block text-sm font-medium">{repeatStep ? 'Second measurement (mm)' : 'Your measurement (mm)'}<input key={repeatStep ? 'repeat' : 'first'} type="number" inputMode="decimal" step="0.1" min="0" aria-label={repeatStep ? 'Second measurement (mm)' : 'Your measurement (mm)'} value={repeatStep ? second : first} placeholder={method === 'diameter' ? 'e.g. 19.0' : 'e.g. 59.5'} onChange={e => { (repeatStep ? setSecond : setFirst)(e.target.value); setSubmitted(false); }} className="mt-2 h-12 w-full rounded-md border border-input bg-background px-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring" /></label>
          {result?.error && <p role="alert" className="mt-3 text-sm text-destructive">{result.error}</p>}
          <Button type="button" disabled={repeatStep ? !second : !first} onClick={() => { if (!repeatStep) { setRepeatStep(true); return; } if (!method) return; const reading = physicalSize(method, Number(first), Number(second)); setSubmitted(true); if ('us' in reading) setStage(2); }} className="mt-5 h-12 w-full">{repeatStep ? 'Show my size' : 'Continue'}<ArrowRight /></Button>
        </>}
        <Button variant="ghost" type="button" onClick={() => { if (repeatStep) { setRepeatStep(false); setSubmitted(false); } else if (visualStep > 0) { setVisualStep(0); } else reset(); }} className="mt-2"><ArrowLeft />Back</Button>
      </> : result && 'us' in result ? <div role="status" className="pt-6">
        <p className="text-xs text-muted-foreground">Your measurement matches</p>
        <p className="mt-1 text-4xl font-light text-primary">US {result.us}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{result.between ? 'Between sizes: this is the larger whole size. Confirm with a physical sizing kit before ordering.' : 'A size-chart match, not a guaranteed aiOn fit. A wide sensor ring can fit differently from a ring you own.'}</p>
        <label className="mt-5 flex items-start gap-3 text-sm leading-relaxed"><input type="checkbox" checked={fit} onChange={e => setFit(e.target.checked)} className="mt-1 h-4 w-4 accent-primary" />I measured the same finger twice and will confirm the fit with a physical sizing kit before my ring ships.</label>
        {onSelect ? <Button type="button" disabled={!fit || selected} onClick={() => { if (result.us === undefined) return; onSelect(String(result.us)); setSelected(true); }} className="mt-5 h-12 w-full">{selected ? <><Check />Size applied</> : <>{selectionLabel}<ArrowRight /></>}</Button> : <Button asChild className="mt-5 h-12 w-full" disabled={!fit}><Link to={`/preorder?measured_size=${result.us}`} onClick={e => { if (!fit) e.preventDefault(); }} aria-disabled={!fit}>Continue with US {result.us}<ArrowRight /></Link></Button>}
        <Button type="button" variant="ghost" onClick={reset} className="mt-2 w-full"><RotateCcw />Measure again</Button>
      </div> : null}
      {stage === 1 && <MeasurementVideo />}
      <details className="mt-5 border-t border-border pt-4"><summary className="cursor-pointer text-sm text-muted-foreground">More sizing options & help</summary>
        <div className="mt-3"><PrintableSizer /></div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Measure with warm hands. If your knuckle is larger or you’re unsure, use a physical sizing kit.</p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-primary"><Link to="/size-chart" className="underline underline-offset-4">US size chart</Link><Link to="/faq" className="underline underline-offset-4">Sizing questions</Link></div>
        {showPhoto && <details className="mt-4 border-t border-border pt-4"><summary className="cursor-pointer text-xs text-muted-foreground">Camera photo check · still being validated</summary><div className="mt-4"><RingSizer compact /></div></details>}
      </details>
    </div>
  );
}