// Matches the public US size chart. These are reference dimensions, not a verified aiOn fitting.
export const PHYSICAL_SIZES = [
  { us: 6, diameter: 16.5, circumference: 51.9 },
  { us: 7, diameter: 17.3, circumference: 54.4 },
  { us: 8, diameter: 18.2, circumference: 57.2 },
  { us: 9, diameter: 19.0, circumference: 59.5 },
  { us: 10, diameter: 19.8, circumference: 62.1 },
  { us: 11, diameter: 20.6, circumference: 64.6 },
  { us: 12, diameter: 21.4, circumference: 67.2 },
  { us: 13, diameter: 22.2, circumference: 69.7 },
] as const;

export type PhysicalMethod = 'diameter' | 'circumference';
export type MeasurementUnit = 'mm' | 'cm';
export function measurementInMillimetres(value: number, unit: MeasurementUnit) {
  return unit === 'cm' ? value * 10 : value;
}
export function physicalSize(method: PhysicalMethod, first: number, second: number) {
  if (!Number.isFinite(first) || !Number.isFinite(second) || first <= 0 || second <= 0) return { error: 'Enter both measurements in millimetres.' };
  const tolerance = method === 'diameter' ? 0.3 : 1;
  if (Math.abs(first - second) > tolerance + 1e-9) return { error: 'Your readings differ. Measure twice again without stretching or tightening.' };
  const measurement = (first + second) / 2;
  const min = PHYSICAL_SIZES[0][method];
  const max = PHYSICAL_SIZES[PHYSICAL_SIZES.length - 1]?.[method];
  if (max === undefined || measurement < min || measurement > max) return { error: 'Your reading is outside US 6–13. Check with a physical sizing kit rather than choosing the nearest size.' };
  const nearest = PHYSICAL_SIZES.reduce((best, row) => Math.abs(row[method] - measurement) < Math.abs(best[method] - measurement) ? row : best);
  const between = Math.abs(nearest[method] - measurement) > (method === 'diameter' ? 0.15 : 0.5);
  const upper = PHYSICAL_SIZES.find(row => row[method] >= measurement) ?? nearest;
  return { us: between ? upper.us : nearest.us, between, measurement };
}