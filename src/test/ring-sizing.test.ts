import { describe, expect, it } from 'vitest';
import { cardScale, measureProjectedWidth, photoResult, summarizeReadings, type Reading, type Point } from '../../supabase/functions/ring-sizer/measurement';

function reading(mm: number, width = 1000, height = 1000, angle = 0): Reading {
  const transform = ([x, y]: Point): Point => [
    (500 + x * Math.cos(angle) - y * Math.sin(angle)) / width * 1000,
    (500 + x * Math.sin(angle) + y * Math.cos(angle)) / height * 1000,
  ];
  return {
    ok: true, confidence: 'high',
    card_corners: [[-214, -134.95], [214, -134.95], [214, 134.95], [-214, 134.95]].map((p) => transform(p as Point)),
    finger_edges: [transform([-mm * 2.5, -220]), transform([mm * 2.5, -220])],
  };
}

describe('Photo measurement safeguards', () => {
  it.each([16.5, 17.3, 18.2, 19, 19.8, 20.6, 21.4, 22.2])('preserves a %s mm projected width without a 5% shrink', (mm) => {
    expect(measureProjectedWidth(reading(mm), 1000, 1000)).toBeCloseTo(mm, 5);
  });
  it('preserves 18.2 mm in a rotated portrait photo', () => {
    expect(measureProjectedWidth(reading(18.2, 1000, 1600, 0.6), 1000, 1600)).toBeCloseTo(18.2, 5);
  });
  it('rejects a tilted card rather than averaging conflicting scales', () => {
    expect(cardScale([[0, 0], [428, 0], [428, 200], [0, 200]])).toBeNull();
  });
  it('rejects crossed corners', () => {
    expect(cardScale([[0, 0], [428, 269.9], [428, 0], [0, 269.9]])).toBeNull();
  });
  it('rejects out-of-frame finger edges', () => {
    const r = reading(18.2); r.finger_edges[0] = [-1, 300];
    expect(measureProjectedWidth(r, 1000, 1000)).toBeNull();
  });
  it('rejects low-confidence localization', () => {
    expect(measureProjectedWidth({ ...reading(18.2), confidence: 'low' }, 1000, 1000)).toBeNull();
  });
  it('does not count coordinate and visual estimates from one response twice', () => {
    expect(summarizeReadings([reading(18.2)], 1000, 1000)).toBeNull();
  });
  it('does not hide a disagreeing reading', () => {
    expect(summarizeReadings([18.2, 18.2, 18.2, 18.2, 18.2, 20].map((v) => reading(v)), 1000, 1000)).toBeNull();
  });
  it('uses one consistent width per response', () => {
    expect(summarizeReadings([18.1, 18.2, 18.2, 18.3].map((v) => reading(v)), 1000, 1000)).toBe(18.2);
  });
  it('uses marked corners exclusively for calibration', () => {
    const r = reading(18.2); r.card_corners = reading(18.2).card_corners.map(([x, y]) => [500 + (x - 500) * 0.8, 500 + (y - 500) * 0.8]);
    expect(measureProjectedWidth(r, 1000, 1000, reading(18.2).card_corners)).toBeCloseTo(18.2, 5);
  });
  it('does not infer US 8 or any confirmed fit from an 18.2 mm silhouette', () => {
    expect(photoResult(18.2)).toMatchObject({ ok: false, us_size: null, inner_diameter_mm: null, confidence: null, requires_physical_confirmation: true });
  });
  it('does not turn an unreliable reading into the smallest offered size', () => {
    expect(photoResult(null)).toMatchObject({ us_size: null, projected_width_mm: null, requires_physical_confirmation: true });
  });
});