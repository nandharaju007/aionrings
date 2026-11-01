import { describe, expect, it } from 'vitest';
import { isPhoneDevice } from '../lib/phone-camera';

describe('Phone-only sizing camera', () => {
  it.each([
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile/15E148',
    'Mozilla/5.0 (Linux; Android 15; Pixel 9) Chrome/130 Mobile Safari/537.36',
  ])('allows a phone: %s', (userAgent) => {
    expect(isPhoneDevice({ userAgent })).toBe(true);
  });
  it.each([
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130 Safari/537.36',
    'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) Mobile/15E148',
    'Mozilla/5.0 (Linux; Android 15; Tablet) Chrome/130 Safari/537.36',
  ])('excludes laptops and tablets: %s', (userAgent) => {
    expect(isPhoneDevice({ userAgent })).toBe(false);
  });
  it('uses browser mobile identity when available', () => {
    expect(isPhoneDevice({ userAgent: 'Mozilla/5.0', userAgentData: { mobile: true } })).toBe(true);
    expect(isPhoneDevice({ userAgent: 'Android Mobile', userAgentData: { mobile: false } })).toBe(false);
  });
});