import { describe, expect, it } from 'vitest';
import { physicalSize } from '../lib/physical-sizing';

describe('Physical ring measurements', () => {
  it('maps 19 mm inside diameter to the chart US 9', () => {
    expect(physicalSize('diameter', 19, 19)).toMatchObject({ us: 9, between: false });
  });
  it('maps 57.2 mm circumference to chart US 8', () => {
    expect(physicalSize('circumference', 57.2, 57.2)).toMatchObject({ us: 8 });
  });
  it('does not turn inconsistent readings into a size', () => {
    expect(physicalSize('diameter', 19, 19.5)).not.toHaveProperty('us');
    expect(physicalSize('circumference', 59.5, 61)).not.toHaveProperty('us');
  });
  it('does not clamp a finger outside US 6–13 to an available size', () => {
    expect(physicalSize('diameter', 15, 15)).not.toHaveProperty('us');
    expect(physicalSize('circumference', 72, 72)).not.toHaveProperty('us');
  });
  it('offers the larger whole size between chart entries, with a fit warning', () => {
    expect(physicalSize('diameter', 19.4, 19.4)).toMatchObject({ us: 10, between: true });
  });
  it('rejects empty and invalid measurements', () => {
    expect(physicalSize('diameter', 0, 0)).not.toHaveProperty('us');
    expect(physicalSize('circumference', NaN, 60)).not.toHaveProperty('us');
  });
});