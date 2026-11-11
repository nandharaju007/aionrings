import { describe, it, expect } from 'vitest';
import { measureProjectedWidth, qualityFlags, summarizeWithReference } from '../../supabase/functions/ring-sizer/measurement';

// Card 85.6 x 53.98 mm drawn at 4 px/mm on a 1000x1000 image; finger 18 mm wide.
const card: [number, number][] = [[100, 100], [442.4, 100], [442.4, 315.92], [100, 315.92]];
const reading = (over: Record<string, unknown> = {}) => ({
  ok: true, confidence: 'medium', reference: 'card' as const, coin_edges: [],
  card_corners: card, finger_edges: [[500, 500], [572, 500]] as [number, number][],
  blurry: true, too_dark: false, hand_tilted: false, ...over,
});

describe('photo quality flags', () => {
  it('measures a medium-confidence reading (soft skin edges are normal)', () => {
    expect(measureProjectedWidth(reading() as never, 1000, 1000)).toBeCloseTo(18, 1);
  });
  it('still rejects low-confidence readings', () => {
    expect(measureProjectedWidth(reading({ confidence: 'low' }) as never, 1000, 1000)).toBeNull();
  });
  it('does not report "blurry" when six readings agreed on a width', () => {
    const rs = Array.from({ length: 6 }, () => reading());
    const width = summarizeWithReference(rs as never, 1000, 1000);
    expect(width).toBe(18);
    expect(qualityFlags(rs as never, 1000, 1000, width)).not.toContain('blurry');
  });
  it('reports "blurry" when most readings say blurry and no width was measured', () => {
    const rs = Array.from({ length: 6 }, () => reading({ confidence: 'low' }));
    expect(qualityFlags(rs as never, 1000, 1000, null)).toContain('blurry');
  });
});

describe('reading agreement', () => {
  const at = (mm: number) => reading({ finger_edges: [[500, 500], [500 + mm * 4, 500]] });
  it('accepts six readings whose middle four agree within 1 mm', () => {
    const rs = [17.7, 18.2, 18.4, 18.8, 19.2, 19.3].map(at);
    expect(summarizeWithReference(rs as never, 1000, 1000)).toBe(18.6);
  });
  it('rejects readings whose middle values spread more than 1 mm', () => {
    const rs = [17.0, 17.5, 18.0, 18.8, 19.5, 20.0].map(at);
    expect(summarizeWithReference(rs as never, 1000, 1000)).toBeNull();
  });
  it('needs at least four usable readings', () => {
    expect(summarizeWithReference([18, 18, 18].map(at) as never, 1000, 1000)).toBeNull();
  });
});
