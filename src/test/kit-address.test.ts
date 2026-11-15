import { describe, expect, it } from 'vitest';
import { kitAddressSchema } from '@/lib/kit-address';
describe('Sizing kit address request', () => {
  const address = { name: 'Kit Test', address: '123 Test Street', city: 'Toronto', postcode: 'M5V 1A1', country: 'Canada' };
  it('accepts a shipping address without email or ring size', () => { expect(kitAddressSchema.parse(address)).toEqual({ ...address, region: '' }); });
  it('requires an address to ship the kit', () => { expect(kitAddressSchema.safeParse({ ...address, address: ' ' }).success).toBe(false); });
  it('rejects overlong or markup input', () => { expect(kitAddressSchema.safeParse({ ...address, name: 'a'.repeat(101) }).success).toBe(false); expect(kitAddressSchema.safeParse({ ...address, address: '<script>' }).success).toBe(false); });
});