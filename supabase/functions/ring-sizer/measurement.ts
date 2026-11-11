// A projected skin width is not a ring's inner diameter or a validated fit.
export type Point = [number, number];
export type Reading = {
  ok: boolean;
  card_corners: Point[];
  finger_edges: Point[];
  confidence: string | null;
};

const distance = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

export function cardScale(corners: Point[]): number | null {
  if (corners.length !== 4 || corners.some((p) => p.length !== 2 || p.some((v) => !Number.isFinite(v)))) return null;
  const vectors = corners.map((p, i) => {
    const next = corners[(i + 1) % 4];
    return [next[0] - p[0], next[1] - p[1]] as Point;
  });
  const lengths = corners.map((p, i) => distance(p, corners[(i + 1) % 4]));
  if (Math.min(...lengths) < 40) return null;
  // Refuse skew, perspective and foreshortening rather than average incompatible scales.
  if (Math.abs(lengths[0] - lengths[2]) / Math.max(lengths[0], lengths[2]) > 0.03 ||
      Math.abs(lengths[1] - lengths[3]) / Math.max(lengths[1], lengths[3]) > 0.03) return null;
  for (let i = 0; i < 4; i++) {
    const a = vectors[i], b = vectors[(i + 1) % 4];
    if (Math.abs(a[0] * b[0] + a[1] * b[1]) / (lengths[i] * lengths[(i + 1) % 4]) > 0.03) return null;
  }
  const a = (lengths[0] + lengths[2]) / 2;
  const b = (lengths[1] + lengths[3]) / 2;
  const longScale = 85.6 / Math.max(a, b), shortScale = 53.98 / Math.min(a, b);
  if (Math.abs(longScale - shortScale) / Math.max(longScale, shortScale) > 0.03) return null;
  return (longScale + shortScale) / 2;
}

function validPoints(points: Point[], count: number) {
  return points.length === count && points.every((p) => p.length === 2 && p.every((v) => Number.isFinite(v) && v >= 0 && v <= 1000));
}

// Medium = edges locatable but naturally soft (skin rarely has crisp edges). Agreement across
// readings in summarize*() is the real reliability gate; only 'low' is rejected outright.
const usable = (c: string | null) => c === 'high' || c === 'medium';

export function measureProjectedWidth(reading: Reading, width: number, height: number, markedCorners?: Point[]): number | null {
  if (!reading.ok || !usable(reading.confidence) || width <= 0 || height <= 0 ||
      !validPoints(reading.finger_edges, 2) || !validPoints(reading.card_corners, 4)) return null;
  const toPixel = (p: Point): Point => [p[0] * width / 1000, p[1] * height / 1000];
  const corners = markedCorners ?? reading.card_corners;
  if (!validPoints(corners, 4)) return null;
  const scale = cardScale(corners.map(toPixel));
  if (scale === null) return null;
  const mm = distance(toPixel(reading.finger_edges[0]), toPixel(reading.finger_edges[1])) * scale;
  // No anatomical width-to-diameter multiplier and no visual-ratio fallback.
  return mm >= 14 && mm <= 25 ? mm : null;
}

export function summarizeReadings(readings: Reading[], width: number, height: number, markedCorners?: Point[]) {
  // Each model response supplies at most ONE measurement. Do not hide disagreement by dropping outliers.
  const widths = readings.map((r) => measureProjectedWidth(r, width, height, markedCorners)).filter((v): v is number => v !== null);
  if (widths.length < 4 || Math.max(...widths) - Math.min(...widths) > 0.4) return null;
  return Math.round(median(widths) * 10) / 10;
}

export function photoResult(projectedWidth: number | null) {
  return {
    ok: false,
    us_size: null,
    inner_diameter_mm: null,
    confidence: null,
    projected_width_mm: projectedWidth,
    requires_physical_confirmation: true,
    note: projectedWidth === null
      ? 'This photo did not produce a reliable width reading. A palm photo cannot confirm ring size. Please use the sizing kit or a physical ring sizer.'
      : 'The photo measures visible finger width, not ring fit. Finger shape and knuckle clearance cannot be confirmed from this view. Please use the sizing kit or a physical ring sizer to choose your size.',
  };
}
// ─── Reference-scaled estimate (hidden from shoppers until the bench passes) ───
export type ChartRow = { us: number; diameter_mm: number; circumference_mm: number };
export type QualityFlag = 'reference_missing' | 'hand_tilted' | 'finger_hidden' | 'blurry' | 'too_dark' | 'inconsistent';
export type RefReading = Reading & {
  reference?: 'card' | 'quarter' | 'none';
  coin_edges?: Point[];
  blurry?: boolean;
  too_dark?: boolean;
  hand_tilted?: boolean;
};

export const QUARTER_MM = 24.26;

export function coinScale(edges: Point[]): number | null {
  if (edges.length !== 2) return null;
  const d = distance(edges[0], edges[1]);
  return d >= 20 ? QUARTER_MM / d : null;
}

/** Projected finger width in mm using a card or a US quarter for scale. */
export function measureWithReference(reading: RefReading, width: number, height: number): number | null {
  if (reading.reference === 'quarter') {
    if (!reading.ok || !usable(reading.confidence) || !validPoints(reading.finger_edges, 2) || !validPoints(reading.coin_edges ?? [], 2)) return null;
    const toPixel = (p: Point): Point => [p[0] * width / 1000, p[1] * height / 1000];
    const scale = coinScale(reading.coin_edges!.map(toPixel));
    if (scale === null) return null;
    const mm = distance(toPixel(reading.finger_edges[0]), toPixel(reading.finger_edges[1])) * scale;
    return mm >= 14 && mm <= 25 ? mm : null;
  }
  return measureProjectedWidth(reading, width, height);
}

/** Pass the agreed width when one was measured: then blur/darkness did not stop the measurement and is not reported. */
export function qualityFlags(readings: RefReading[], width: number, height: number, measuredWidth: number | null = null): QualityFlag[] {
  const flags = new Set<QualityFlag>();
  const n = readings.length || 1;
  const majority = (pred: (r: RefReading) => boolean) => readings.filter(pred).length * 2 > n;
  if (majority((r) => r.reference === 'none' || (r.reference !== 'quarter' && r.card_corners.length !== 4))) flags.add('reference_missing');
  if (majority((r) => !!r.hand_tilted)) flags.add('hand_tilted');
  if (majority((r) => r.reference !== 'quarter' && r.card_corners.length === 4 &&
      cardScale(r.card_corners.map(([x, y]) => [x * width / 1000, y * height / 1000] as Point)) === null)) flags.add('hand_tilted');
  if (majority((r) => !r.ok || r.finger_edges.length !== 2)) flags.add('finger_hidden');
  // Blur/darkness are only blamed when they actually stopped most readings from measuring.
  // If 4+ readings measured a width, the photo was usable; disagreement is reported as 'inconsistent'.
  const measured = readings.filter((r) => measureWithReference(r, width, height) !== null).length;
  const blocked = measuredWidth === null && measured < 4;
  if (blocked && majority((r) => !!r.blurry)) flags.add('blurry');
  if (blocked && majority((r) => !!r.too_dark)) flags.add('too_dark');
  return [...flags];
}

export function summarizeWithReference(readings: RefReading[], width: number, height: number) {
  const widths = readings.map((r) => measureWithReference(r, width, height)).filter((v): v is number => v !== null);
  if (widths.length < 4) return null;
  // Point placement varies by ~1 mm between readings even on sharp photos. Ignore the single
  // highest and lowest (when 5+), then require the rest to agree within 1 mm. Whether that is
  // accurate enough for a size is decided by the /bench gate, not here.
  const sorted = [...widths].sort((a, b) => a - b);
  const core = sorted.length >= 5 ? sorted.slice(1, -1) : sorted;
  if (core[core.length - 1] - core[0] > 1.0) return null;
  return Math.round(median(widths) * 10) / 10;
}

/**
 * Width at the ring position → inner circumference (π·w, assumes a round finger) → nearest
 * chart size, reported as ±0.5 size. This assumption is exactly what the /bench must validate.
 */
export function estimateSize(widthMm: number, chart: ChartRow[]) {
  const rows = [...chart].filter((r) => Number.isFinite(r.us) && Number.isFinite(r.circumference_mm)).sort((a, b) => a.us - b.us);
  if (!rows.length || !Number.isFinite(widthMm)) return null;
  const circumference = Math.PI * widthMm;
  if (circumference < rows[0].circumference_mm - 1.5 || circumference > rows[rows.length - 1].circumference_mm + 1.5) return null;
  const best = rows.reduce((a, b) => Math.abs(b.circumference_mm - circumference) < Math.abs(a.circumference_mm - circumference) ? b : a);
  return {
    us: best.us,
    low: Math.max(rows[0].us, best.us - 0.5),
    high: Math.min(rows[rows.length - 1].us, best.us + 0.5),
    circumference_mm: Math.round(circumference * 10) / 10,
  };
}

export type BenchRow = { confirmed_size: number; est_size: number | null; finger: string };

/** Error in half sizes (estimate − confirmed); null when no estimate. */
export const halfSizeError = (confirmed: number, est: number | null) => est === null ? null : Math.round((est - confirmed) * 2);

export function benchSummary(rows: BenchRow[], rule = { minShare: 0.8, minPhotos: 15 }) {
  const errs = rows.map((r) => halfSizeError(r.confirmed_size, r.est_size));
  const abs = errs.map((e) => (e === null ? null : Math.abs(e)));
  const total = rows.length;
  const share = (max: number) => total ? abs.filter((e) => e !== null && e <= max).length / total : 0;
  const scored = abs.filter((e): e is number => e !== null);
  const group = (key: (r: BenchRow) => string) => {
    const out: Record<string, { n: number; within_half: number }> = {};
    rows.forEach((r, i) => {
      const k = key(r); out[k] ??= { n: 0, within_half: 0 };
      out[k].n++; if (abs[i] !== null && abs[i]! <= 1) out[k].within_half++;
    });
    return out;
  };
  const range = (s: number) => s <= 6 ? '4-6' : s <= 9 ? '6.5-9' : s <= 12 ? '9.5-12' : '12.5-15';
  const withinHalf = share(1);
  return {
    total,
    within_half: withinHalf,
    within_one: share(2),
    no_estimate: abs.filter((e) => e === null).length,
    mean_error_sizes: scored.length ? scored.reduce((a, b) => a + b, 0) / scored.length / 2 : null,
    worst_error_sizes: scored.length ? Math.max(...scored) / 2 : null,
    by_range: group((r) => range(r.confirmed_size)),
    by_finger: group((r) => r.finger),
    passed: total >= rule.minPhotos && withinHalf >= rule.minShare,
  };
}
