import { describe, expect, it } from 'vitest';
import { kitAddressSchema } from '@/lib/kit-address';

describe('Sizing kit address request', () => {
  const address = { name: 'Kit Test', address: '123 Test Street', city: 'Toronto', postcode: 'M5V 1A1', country: 'Canada', email: 'Kit@Test.com', phone: '+1 (416) 555-0123' };

  it('accepts a shipping address with email and phone', () => {
    expect(kitAddressSchema.parse(address)).toEqual({ ...address, region: '', email: 'kit@test.com' });
  });

  it('requires a full name with first and last name', () => {
    expect(kitAddressSchema.safeParse({ ...address, name: ' ' }).success).toBe(false);
    expect(kitAddressSchema.safeParse({ ...address, name: 'Kit' }).success).toBe(false);
    expect(kitAddressSchema.safeParse({ ...address, name: 'Kit123 Test' }).success).toBe(false);
  });

  it('requires an address to ship the kit', () => {
    expect(kitAddressSchema.safeParse({ ...address, address: ' ' }).success).toBe(false);
    expect(kitAddressSchema.safeParse({ ...address, address: '1 A' }).success).toBe(false);
  });

  it('requires a plausible city and country', () => {
    expect(kitAddressSchema.safeParse({ ...address, city: 'X' }).success).toBe(false);
    expect(kitAddressSchema.safeParse({ ...address, city: 'Toronto99' }).success).toBe(false);
    expect(kitAddressSchema.safeParse({ ...address, country: ' ' }).success).toBe(false);
  });

  it('validates the postal / ZIP code format', () => {
    expect(kitAddressSchema.safeParse({ ...address, postcode: '12' }).success).toBe(false);
    expect(kitAddressSchema.safeParse({ ...address, postcode: 'M5V_1A1' }).success).toBe(false);
    expect(kitAddressSchema.safeParse({ ...address, postcode: 'M5V 1A1' }).success).toBe(true);
    expect(kitAddressSchema.safeParse({ ...address, postcode: '90210' }).success).toBe(true);
  });

  it('allows state / province to be empty but checks it when given', () => {
    expect(kitAddressSchema.safeParse({ ...address, region: '' }).success).toBe(true);
    expect(kitAddressSchema.safeParse({ ...address, region: 'Ontario' }).success).toBe(true);
    expect(kitAddressSchema.safeParse({ ...address, region: 'Ontario #1' }).success).toBe(false);
  });

  it('requires a valid email and phone', () => {
    expect(kitAddressSchema.safeParse({ ...address, email: 'not-an-email' }).success).toBe(false);
    expect(kitAddressSchema.safeParse({ ...address, phone: 'call me' }).success).toBe(false);
    expect(kitAddressSchema.safeParse({ ...address, phone: '12' }).success).toBe(false);
    expect(kitAddressSchema.safeParse({ ...address, phone: '+ ( ) - ' }).success).toBe(false);
  });

  it('rejects overlong or markup input', () => {
    expect(kitAddressSchema.safeParse({ ...address, name: 'a'.repeat(101) }).success).toBe(false);
    expect(kitAddressSchema.safeParse({ ...address, address: '<script>alert(1)</script>' }).success).toBe(false);
  });
});
