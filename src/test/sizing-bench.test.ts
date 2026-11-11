import { describe, expect, it } from 'vitest';
import { benchSummary, coinScale, estimateSize, halfSizeError } from '../../supabase/functions/ring-sizer/measurement';

const chart = Array.from({ length: 23 }, (_, i) => { const us = 4 + i * 0.5; const d = 11.63 + 0.8128 * us; return { us, diameter_mm: d, circumference_mm: Math.PI * d }; });

describe('Sizing estimate and bench rules', () => {
  it('reports a ±0.5 range, never a single number', () => {
    const e = estimateSize(11.63 + 0.8128 * 9, chart)!;
    expect([e.us, e.low, e.high]).toEqual([9, 8.5, 9.5]);
  });
  it('uses the editable chart, not a hard-coded one', () => {
    const shifted = chart.map((r) => ({ ...r, circumference_mm: r.circumference_mm + 1.28 }));
    expect(estimateSize(18.95, shifted)!.us).toBe(8.5);
  });
  it('scales from a US quarter (24.26 mm)', () => {
    expect(coinScale([[0, 0], [242.6, 0]])).toBeCloseTo(0.1, 6);
  });
  it('counts error in half sizes', () => {
    expect(halfSizeError(9, 10)).toBe(2);
    expect(halfSizeError(9, null)).toBeNull();
  });
  const rows = (good: number, bad: number) => [
    ...Array.from({ length: good }, () => ({ confirmed_size: 9, est_size: 9.5, finger: 'ring' })),
    ...Array.from({ length: bad }, () => ({ confirmed_size: 9, est_size: 10, finger: 'ring' })),
  ];
  it('passes at 80% within ±0.5 with 15 photos', () => {
    expect(benchSummary(rows(12, 3)).passed).toBe(true);
  });
  it('fails below 80%', () => {
    expect(benchSummary(rows(11, 4)).passed).toBe(false);
  });
  it('fails with fewer than 15 photos even if all are right', () => {
    expect(benchSummary(rows(14, 0)).passed).toBe(false);
  });
});
