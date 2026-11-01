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

export function measureProjectedWidth(reading: Reading, width: number, height: number, markedCorners?: Point[]): number | null {
  if (!reading.ok || reading.confidence !== 'high' || width <= 0 || height <= 0 ||
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