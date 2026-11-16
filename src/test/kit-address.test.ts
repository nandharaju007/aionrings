import { describe, expect, it } from 'vitest';
import { kitAddressSchema } from '@/lib/kit-address';
describe('Sizing kit address request', () => {
  const address = { name: 'Kit Test', address: '123 Test Street', city: 'Toronto', postcode: 'M5V 1A1', country: 'Canada', email: 'Kit@Test.com', phone: '+1 (416) 555-0123' };
  it('accepts a shipping address with email and phone', () => { expect(kitAddressSchema.parse(address)).toEqual({ ...address, region: '', email: 'kit@test.com' }); });
  it('requires an address to ship the kit', () => { expect(kitAddressSchema.safeParse({ ...address, address: ' ' }).success).toBe(false); });
  it('requires a valid email and phone', () => { expect(kitAddressSchema.safeParse({ ...address, email: 'not-an-email' }).success).toBe(false); expect(kitAddressSchema.safeParse({ ...address, phone: 'call me' }).success).toBe(false); expect(kitAddressSchema.safeParse({ ...address, phone: '12' }).success).toBe(false); });
  it('rejects overlong or markup input', () => { expect(kitAddressSchema.safeParse({ ...address, name: 'a'.repeat(101) }).success).toBe(false); expect(kitAddressSchema.safeParse({ ...address, address: '<script>' }).success).toBe(false); });
});