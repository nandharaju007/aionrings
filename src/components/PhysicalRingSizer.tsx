import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Circle, Mail, Package, Ruler, RotateCcw, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RingSizer } from '@/components/RingSizer';
import { MeasurementVideo } from '@/components/MeasurementVideo';
import { PrintableSizer } from '@/components/PrintableSizer';
import { PaperMeasurementVisual } from '@/components/PaperMeasurementVisual';
import { measurementInMillimetres, physicalSize, type MeasurementUnit, type PhysicalMethod } from '@/lib/physical-sizing';

function MeasurementVisual({ method, step }: { method: PhysicalMethod; step: number }) {
  if (method === 'circumference') return <PaperMeasurementVisual key={step} step={step < 3 ? 0 : 1} />;
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
  const wrapSteps = [
    { title: 'Prepare your strip', text: 'Remove your rings. Cut a narrow strip of plain paper, about 5 mm wide. Have a pen and a millimetre ruler ready.', action: 'My strip is ready' },
    { title: 'Wrap your finger', text: 'Wrap the strip once around the base of the finger you’ll wear your aiOn ring on. Keep it flat and snug, not tight. Check that it slides over your knuckle without forcing it.', action: 'The wrap feels comfortable' },
    { title: 'Mark the overlap', text: 'Hold the strip in place. Draw a thin line on the lower layer exactly where the starting end meets it. This line marks the full distance around your finger.', action: 'I’ve marked the strip' },
    { title: 'Read your ruler', text: 'Unwrap and lay the strip flat. Put the starting end at 0 on your ruler. Read the distance to your pen mark—not to the end of the paper.', action: '' },
  ];
  const wrapStep = wrapSteps[visualStep] ?? wrapSteps[0];
  const result = method && submitted ? physicalSize(method, measurementInMillimetres(Number(first), unit), measurementInMillimetres(Number(second), unit)) : null;
  const reset = () => { setMethod(null); setKitRequest(false); setUnit('mm'); setStage(0); setVisualStep(0); setRepeatStep(false); setFirst(''); setSecond(''); setFit(false); setSelected(false); setSubmitted(false); };
  return (
    <div className="min-w-0 text-foreground">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-xs text-primary"><Ruler className="h-4 w-4" />Find your fit</span>
        <span className="text-xs text-muted-foreground">Sample kit or measure at home</span>
      </div>
      <h3 className="mt-3 text-2xl font-light">Find your aiOn ring size.</h3>
      <ol aria-label="Sizing progress" className="mt-5 grid grid-cols-3 border-b border-border pb-4 text-xs">
        {['Choose', 'Measure', 'Your size'].map((label, i) => <li key={label} aria-current={stage === i ? 'step' : undefined} className={`flex items-center gap-2 ${stage === i ? 'text-primary font-medium' : 'text-muted-foreground'}`}><span className="flex h-6 w-6 items-center justify-center rounded-full border border-current">{stage > i ? <Check className="h-3 w-3" /> : i + 1}</span>{label}</li>)}
      </ol>
      {kitRequest ? <div className="pt-6">
        <Package className="h-8 w-8 text-primary" />
        <h4 className="mt-3 text-lg font-medium">Request a sample sizing kit</h4>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Try physical sample sizes on the finger you’ll wear your ring on. Ask our team about availability, any cost and delivery before choosing your size.</p>
        <Button asChild className="mt-5 h-12 w-full"><a href={`mailto:orders@aionrings.com?subject=${encodeURIComponent('aiOn sample sizing kit request')}&body=${encodeURIComponent('Hello aiOn team,\n\nI would like to request a sample ring sizing kit. Please confirm availability, any cost and delivery options.\n\nMy name:\nDelivery country / postcode:\nPre-order reference (if any):\n\nThank you.')}`}><Mail />Email a kit request</a></Button>
        <p className="mt-2 text-xs text-muted-foreground">Opens your email app. Send the message to request a kit; this does not place an order.</p>
        <Button variant="ghost" type="button" onClick={reset} className="mt-3"><ArrowLeft />Back</Button>
      </div> : !method ? <>
        <p className="mt-5 text-sm text-muted-foreground">How would you like to find your size?</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Button variant="outline" type="button" onClick={() => setKitRequest(true)} className="h-auto min-h-24 justify-start gap-3 whitespace-normal bg-card px-4 py-5 text-left hover:bg-secondary hover:text-foreground"><Package className="shrink-0 text-primary" /><span>Request a sample kit<span className="mt-1 block text-xs font-normal text-muted-foreground">Try physical sizes on your finger</span></span></Button>
          <Button variant="outline" type="button" onClick={() => { setMethod('circumference'); setStage(1); }} className="h-auto min-h-24 justify-start gap-3 whitespace-normal bg-card px-4 py-5 text-left hover:bg-secondary hover:text-foreground"><Scissors className="shrink-0 text-primary" /><span>Wrap with paper<span className="mt-1 block text-xs font-normal text-muted-foreground">Paper, pen and ruler · about 2 minutes</span></span></Button>
        </div>
      </> : stage === 1 ? <>
        <p className="mt-5 text-sm font-medium">{method === 'circumference' ? `${visualStep + 1} of 4 · ${wrapStep.title}` : repeatStep ? 'One quick double-check' : 'Measure with your ruler'}</p>
        <div className="mt-3 rounded-lg bg-secondary/60 p-3 motion-safe:animate-in motion-safe:fade-in">
          <MeasurementVisual method={method} step={visualStep} />
        </div>
        <p className="mt-3 text-sm leading-relaxed">{method === 'circumference' ? wrapStep.text : repeatStep ? 'Measure the inside opening again.' : 'Measure across the inside opening, not the metal.'}</p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{method === 'diameter' ? 'Choose a ring that fits your intended finger. Use a real millimetre ruler; this picture is not actual size.' : repeatStep ? 'Second check: use a fresh strip and repeat the same steps.' : 'Warm hands give a more representative fit. Don’t stretch or pull the paper tight.'}</p>
        {method === 'circumference' && visualStep < 3 ? <Button type="button" onClick={() => setVisualStep(visualStep + 1)} className="mt-5 h-12 w-full whitespace-normal">{wrapStep.action}<ArrowRight /></Button> : <>
          <fieldset className="mt-5">
            <legend className="text-sm font-medium">Units on your ruler</legend>
            <div className="mt-2 flex gap-2">{(['cm', 'mm'] as const).map(value => <Button key={value} type="button" variant={unit === value ? 'default' : 'outline'} aria-pressed={unit === value} onClick={() => changeUnit(value)} className="h-11 flex-1">{value === 'cm' ? 'Centimetres (cm)' : 'Millimetres (mm)'}</Button>)}</div>
          </fieldset>
          <p className="mt-2 text-xs text-muted-foreground">The picture’s numbered marks are cm; each small division is 1 mm. 5.95 cm = 59.5 mm.</p>
          {repeatStep && <p className="mt-4 text-xs text-muted-foreground">First measurement: {first} {unit}</p>}
          <label className="mt-5 block text-sm font-medium">{repeatStep ? `Second measurement (${unit})` : `Your measurement (${unit})`}<input key={repeatStep ? 'repeat' : 'first'} type="number" inputMode="decimal" step={unit === 'cm' ? '0.01' : '0.1'} min="0" aria-label={repeatStep ? `Second measurement (${unit})` : `Your measurement (${unit})`} value={repeatStep ? second : first} placeholder={unit === 'cm' ? method === 'diameter' ? 'e.g. 1.90' : 'e.g. 5.95' : method === 'diameter' ? 'e.g. 19.0' : 'e.g. 59.5'} onChange={e => { (repeatStep ? setSecond : setFirst)(e.target.value); setSubmitted(false); }} className="mt-2 h-12 w-full rounded-md border border-input bg-background px-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring" /></label>
          {result?.error && <p role="alert" className="mt-3 text-sm text-destructive">{result.error}</p>}
          <Button type="button" disabled={repeatStep ? !second : !first} onClick={() => { if (!repeatStep) { setRepeatStep(true); if (method === 'circumference') setVisualStep(0); return; } if (!method) return; const reading = physicalSize(method, measurementInMillimetres(Number(first), unit), measurementInMillimetres(Number(second), unit)); setSubmitted(true); if ('us' in reading) setStage(2); }} className="mt-5 h-12 w-full">{repeatStep ? 'Show my size' : 'Double-check my measurement'}<ArrowRight /></Button>
        </>}
        <Button variant="ghost" type="button" onClick={() => { if (visualStep > 0) { setVisualStep(visualStep - 1); } else if (repeatStep) { setRepeatStep(false); setVisualStep(method === 'circumference' ? 3 : 0); setSubmitted(false); } else reset(); }} className="mt-2"><ArrowLeft />Back</Button>
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
        {!method && !kitRequest && <Button variant="ghost" type="button" onClick={() => { setMethod('diameter'); setStage(1); }} className="mt-3"><Circle />Measure a ring that fits</Button>}
        <div className="mt-3"><PrintableSizer /></div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Measure with warm hands. If your knuckle is larger or you’re unsure, use a physical sizing kit.</p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-primary"><Link to="/size-chart" className="underline underline-offset-4">US size chart</Link><Link to="/faq" className="underline underline-offset-4">Sizing questions</Link></div>
        {showPhoto && <details className="mt-4 border-t border-border pt-4"><summary className="cursor-pointer text-xs text-muted-foreground">Camera photo check · still being validated</summary><div className="mt-4"><RingSizer compact /></div></details>}
      </details>
    </div>
  );
}