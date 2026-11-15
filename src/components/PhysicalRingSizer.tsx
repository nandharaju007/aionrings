import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Camera, Check, Circle, Package, Ruler, RotateCcw, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import wrapPhoto from '@/assets/sizing-paper-wrap.jpg';
import handCardPhoto from '@/assets/hand-card-sample-palm.jpg';
import { RingSizer } from '@/components/RingSizer';
import { MeasurementVideo } from '@/components/MeasurementVideo';
import { PrintableSizer } from '@/components/PrintableSizer';
import { PaperMeasurementVisual } from '@/components/PaperMeasurementVisual';
import { SizingKitRequest } from '@/components/SizingKitRequest';
import { PHYSICAL_SIZES, measurementInMillimetres, physicalSize, type MeasurementUnit, type PhysicalMethod } from '@/lib/physical-sizing';

function MeasurementVisual({ method, step }: { method: PhysicalMethod; step: number }) {
  if (method === 'circumference') return <PaperMeasurementVisual key={step} step={step} />;
  return (
    <svg viewBox="0 0 320 185" role="img" aria-label="Measure straight across the ring opening, from inside edge to inside edge, with a real ruler" className="mx-auto w-full max-w-sm text-primary">
        <circle cx="160" cy="86" r="66" className="fill-background stroke-border" strokeWidth="18" />
        <circle cx="160" cy="86" r="57" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M103 86h114m-57-8v16M103 80v12m114-12v12" fill="none" stroke="currentColor" strokeWidth="2" />
        <text x="160" y="68" textAnchor="middle" className="fill-foreground text-[12px]">Inside edge → inside edge</text>
        <path d="M65 157h190M65 157v10m19-10v6m19-6v10m19-10v6m19-6v10m19-10v6m19-6v10m19-10v6m19-6v10m19-10v6m19-6v10" stroke="currentColor" fill="none" />
    </svg>
  );
}

export function PhysicalRingSizer({ onSelect, selectionLabel = 'Use this size', showPhoto = true }: { onSelect?: (size: string) => void; selectionLabel?: string; showPhoto?: boolean }) {
  const outcomeRef = useRef<HTMLDivElement>(null);
  const measurementRef = useRef<HTMLInputElement>(null);
  const [inputError, setInputError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [method, setMethod] = useState<PhysicalMethod | null>(null);
  const [stage, setStage] = useState(0);
  const [visualStep, setVisualStep] = useState(0);
  const [repeatStep, setRepeatStep] = useState(false);
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  const [unit, setUnit] = useState<MeasurementUnit>('mm');
  const changeUnit = (next: MeasurementUnit) => {
    const convert = (value: string) => value === '' ? '' : String(Number((measurementInMillimetres(Number(value), unit) / (next === 'cm' ? 10 : 1)).toFixed(6)));
    setFirst(convert(first)); setSecond(convert(second)); setUnit(next); setSubmitted(false);
  };
  const [fit, setFit] = useState(false);
  const [selected, setSelected] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [kitRequest, setKitRequest] = useState(false);
  const [photoCheck, setPhotoCheck] = useState(false);
  const [adjustedSize, setAdjustedSize] = useState<string | null>(null);
  const wrapSteps = [
    { title: 'Wrap & mark', text: 'Wrap a narrow paper strip around your finger. Mark where the starting end overlaps.', action: 'I’ve marked the strip' },
    { title: 'Measure', text: 'Lay the strip flat. Measure from 0 to your mark on a real ruler.', action: '' },
  ];
  const wrapStep = wrapSteps[visualStep] ?? wrapSteps[0];
  const result = method && submitted ? physicalSize(method, measurementInMillimetres(Number(first), unit), measurementInMillimetres(Number(second), unit)) : null;
  const chosenSize = adjustedSize ?? (result && 'us' in result ? String(result.us) : '');
  useEffect(() => {
    if (!submitted) return;
    outcomeRef.current?.scrollIntoView({ block: 'center', behavior: 'instant' });
    outcomeRef.current?.focus({ preventScroll: true });
  }, [submitted, stage, attempt]);
  const reset = () => { setMethod(null); setKitRequest(false); setPhotoCheck(false); setAdjustedSize(null); setUnit('mm'); setStage(0); setVisualStep(0); setRepeatStep(false); setFirst(''); setSecond(''); setFit(false); setSelected(false); setSubmitted(false); };
  return (
    <div className="min-w-0 text-foreground">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-xs text-primary"><Ruler className="h-4 w-4" />Find your fit</span>
        <span className="text-xs text-muted-foreground">Three ways to find your fit</span>
      </div>
      <h3 className="mt-3 text-2xl font-light">Find your aiOn ring size.</h3>
      {method && <ol aria-label="Sizing progress" className="mt-5 grid grid-cols-3 border-b border-border pb-4 text-xs">
        {(method === 'circumference' ? ['Wrap & mark', 'Measure', 'Your size'] : ['Choose', 'Measure', 'Your size']).map((label, i) => { const active = method === 'circumference' ? stage === 2 ? 2 : visualStep : stage; return <li key={label} aria-current={active === i ? 'step' : undefined} className={`flex items-center gap-2 ${active === i ? 'text-primary font-medium' : 'text-muted-foreground'}`}><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current">{active > i ? <Check className="h-3 w-3" /> : i + 1}</span>{label}</li>; })}
      </ol>}
      {photoCheck ? <div className="mt-5"><Button variant="ghost" onClick={reset} className="mb-4"><ArrowLeft />All sizing options</Button><RingSizer compact /></div> : kitRequest ? <div className="pt-6">
        <SizingKitRequest />
        <Button variant="ghost" type="button" onClick={reset} className="mt-3"><ArrowLeft />Back</Button>
      </div> : !method ? <>
        <p className="mt-5 text-sm text-muted-foreground">How would you like to find your size?</p>
        <div className={`mt-4 grid gap-3 ${showPhoto ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
          <Button variant="outline" type="button" onClick={() => setKitRequest(true)} className="h-auto min-h-24 flex-row justify-start gap-3 whitespace-normal bg-card p-4 text-left hover:bg-secondary hover:text-foreground sm:flex-col sm:items-start"><Package className="h-12 w-12 shrink-0 text-primary sm:h-20 sm:w-20" /><span>Get a sizing kit<span className="mt-1 block text-xs font-normal text-primary">Best for confirming fit</span></span></Button>
          <Button variant="outline" type="button" onClick={() => { setMethod('circumference'); setStage(1); }} className="h-auto min-h-24 flex-row justify-start gap-3 whitespace-normal bg-card p-4 text-left hover:bg-secondary hover:text-foreground sm:flex-col sm:items-start"><img src={wrapPhoto} alt="Paper wrapped around a finger" className="h-16 w-16 shrink-0 rounded-md object-cover sm:h-20 sm:w-full" /><span>Paper strip<span className="mt-1 block text-xs font-normal text-muted-foreground">Wrap · mark · measure</span></span></Button>
          {showPhoto && <Button variant="outline" type="button" onClick={() => setPhotoCheck(true)} className="h-auto min-h-24 flex-row justify-start gap-3 whitespace-normal bg-card p-4 text-left hover:bg-secondary hover:text-foreground sm:flex-col sm:items-start"><img src={handCardPhoto} alt="Card flat in an open palm" className="h-16 w-16 shrink-0 rounded-md object-cover sm:h-20 sm:w-full" /><span className="min-w-0"><span className="inline-flex items-center gap-2"><Camera className="h-4 w-4 shrink-0" />Phone camera</span><span className="mt-1 block text-xs font-normal text-muted-foreground">Photo check · sizes still in testing</span></span></Button>}
        </div>
      </> : stage === 1 ? <>
        <p className="mt-5 text-sm font-medium">{repeatStep ? 'Quick check: measure once more' : method === 'circumference' ? wrapStep.title : 'Measure with your ruler'}</p>
        <div className="mt-3 rounded-lg bg-secondary/60 p-3 motion-safe:animate-in motion-safe:fade-in">
          <MeasurementVisual method={method} step={visualStep} />
        </div>
        {(method !== 'circumference' || repeatStep) && <p className="mt-3 text-sm leading-relaxed">{method === 'circumference' ? 'Wrap and mark a fresh strip, then measure it again.' : repeatStep ? 'Measure the inside opening again.' : 'Measure across the inside opening, not the metal.'}</p>}
        {method === 'diameter' ? <p className="mt-2 text-xs text-muted-foreground">Use a ring that fits this finger and a real ruler.</p> : visualStep === 0 && <p className="mt-2 text-xs text-muted-foreground">Remove rings · strip about 5 mm wide · snug, not tight · slides over your knuckle.</p>}
        {method === 'circumference' && visualStep === 0 ? <Button type="button" onClick={() => setVisualStep(1)} className="mt-5 h-12 w-full whitespace-normal">{wrapStep.action}<ArrowRight /></Button> : <>
          <fieldset className="mt-5">
            <legend className="text-sm font-medium">Ruler units</legend>
            <div className="mt-2 flex gap-2">{(['cm', 'mm'] as const).map(value => <Button key={value} type="button" variant={unit === value ? 'default' : 'outline'} aria-pressed={unit === value} onClick={() => changeUnit(value)} className="h-11 flex-1">{value}</Button>)}</div>
          </fieldset>
          {method === 'circumference' && <p className="mt-2 text-xs text-muted-foreground">Numbered marks = cm · small ticks = mm.</p>}
          {repeatStep && <p className="mt-4 text-xs text-muted-foreground">First measurement: {first} {unit}</p>}
          <label className="mt-5 block text-sm font-medium">{repeatStep ? `Second measurement (${unit})` : `Your measurement (${unit})`}<input ref={measurementRef} key={repeatStep ? 'repeat' : 'first'} type="number" inputMode="decimal" step={unit === 'cm' ? '0.01' : '0.1'} min="0" aria-invalid={Boolean(inputError)} aria-label={repeatStep ? `Second measurement (${unit})` : `Your measurement (${unit})`} value={repeatStep ? second : first} placeholder={unit === 'cm' ? method === 'diameter' ? 'e.g. 1.90' : 'e.g. 5.95' : method === 'diameter' ? 'e.g. 19.0' : 'e.g. 59.5'} onChange={e => { (repeatStep ? setSecond : setFirst)(e.target.value); setSubmitted(false); setInputError(''); }} className="mt-2 h-12 w-full rounded-md border border-input bg-background px-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring" /></label>
          {inputError && <p role="alert" className="mt-2 text-sm text-destructive">{inputError}</p>}
          <p className="mt-2 text-xs text-muted-foreground">{repeatStep ? 'Enter your new ruler reading. We’ll match both readings to a US ring size.' : 'Enter the number you read on your own ruler, not a ring size.'}</p>
          {method === 'circumference' && <p className="mt-1 text-xs text-muted-foreground">Example only: 5.72 cm = 57.2 mm → US 8.</p>}
          {result?.error && <div ref={outcomeRef} tabIndex={-1} role="alert" className="mt-3 rounded-md border border-destructive p-3 text-sm text-destructive"><p className="font-medium">No size yet</p><p className="mt-1">{result.error}</p><p className="mt-2">Check the units: a reading of 5.72 belongs in cm; 57.2 belongs in mm. For an unusual reading, verify with a physical sizing kit.</p></div>}
          <Button type="button" onClick={() => { if (!(repeatStep ? second : first).trim()) { setInputError(`Enter your ${repeatStep ? 'second ' : ''}ruler reading in ${unit} above to find your size.`); measurementRef.current?.focus(); return; } setInputError(''); if (!repeatStep) { setRepeatStep(true); return; } if (!method) return; const reading = physicalSize(method, measurementInMillimetres(Number(first), unit), measurementInMillimetres(Number(second), unit)); setAttempt(value => value + 1); setSubmitted(true); if ('us' in reading) setStage(2); }} className="mt-5 h-12 w-full">{repeatStep ? 'Show my size' : 'Quick double-check'}<ArrowRight /></Button>
        </>}
        <Button variant="ghost" type="button" onClick={() => { if (repeatStep) { setRepeatStep(false); setSubmitted(false); } else if (visualStep > 0) { setVisualStep(0); } else reset(); }} className="mt-2"><ArrowLeft />Back</Button>
      </> : result && 'us' in result ? <div ref={outcomeRef} tabIndex={-1} role="status" className="pt-6 scroll-mt-24">
        <p className="text-lg font-medium">Your suggested ring size</p>
        <p className="mt-1 text-4xl font-light text-primary">US {result.us}</p>
        <p className="mt-2 text-sm text-muted-foreground">Your readings: {first} and {second} {unit}.</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{result.between ? 'Between sizes: this is the larger whole size. Confirm with a physical sizing kit before ordering.' : 'A size-chart match, not a guaranteed aiOn fit. A wide sensor ring can fit differently from a ring you own.'}</p>
        <label className="mt-5 block text-sm" htmlFor="physical-size-choice">Confirm or adjust your size</label>
        <Select value={chosenSize} disabled={selected} onValueChange={value => { setAdjustedSize(value); setFit(false); }}><SelectTrigger id="physical-size-choice" className="mt-2 h-12"><SelectValue /></SelectTrigger><SelectContent>{PHYSICAL_SIZES.map(row => <SelectItem key={row.us} value={String(row.us)}>US {row.us}{row.us === result.us ? ' · suggested' : ''}</SelectItem>)}</SelectContent></Select>
        {adjustedSize && adjustedSize !== String(result.us) && <p className="mt-2 text-xs text-muted-foreground">You chose US {adjustedSize}. Verify this change with a physical sizing kit.</p>}
        <label className="mt-5 flex items-start gap-3 text-sm leading-relaxed"><input type="checkbox" checked={fit} onChange={e => setFit(e.target.checked)} className="mt-1 h-4 w-4 accent-primary" />I measured the same finger twice and will confirm the fit with a physical sizing kit before my ring ships.</label>
        {onSelect ? <Button type="button" disabled={!fit || selected} onClick={() => { if (!chosenSize) return; onSelect(chosenSize); setSelected(true); }} className="mt-5 h-12 w-full">{selected ? <><Check />Size applied</> : <>{selectionLabel}<ArrowRight /></>}</Button> : <Button asChild className="mt-5 h-12 w-full" disabled={!fit}><Link to={`/preorder?measured_size=${chosenSize}`} onClick={e => { if (!fit) e.preventDefault(); }} aria-disabled={!fit}>Continue with US {chosenSize}<ArrowRight /></Link></Button>}
        <Button type="button" variant="ghost" onClick={reset} className="mt-2 w-full"><RotateCcw />Measure again</Button>
      </div> : null}
      <details className="mt-5 border-t border-border pt-4"><summary className="cursor-pointer text-sm text-muted-foreground">More sizing options & help</summary>
        {stage === 1 && <MeasurementVideo />}
        {!method && !kitRequest && <Button variant="ghost" type="button" onClick={() => { setMethod('diameter'); setStage(1); }} className="mt-3"><Circle />Measure a ring that fits</Button>}
        <div className="mt-3"><PrintableSizer /></div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Measure with warm hands. If your knuckle is larger or you’re unsure, use a physical sizing kit.</p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-primary"><Link to="/size-chart" className="underline underline-offset-4">US size chart</Link><Link to="/faq" className="underline underline-offset-4">Sizing questions</Link></div>
      </details>
    </div>
  );
}