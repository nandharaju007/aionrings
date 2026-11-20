import { describe, expect, it } from 'vitest';
import { validatePreorder } from '@/lib/preorder-validation';
import { PHONE_CODE_OPTIONS } from '@/lib/dial-codes';
import { getExampleNumber, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js/max';
import examples from 'libphonenumber-js/mobile/examples';

const form = { first_name: 'Jane', last_name: 'Doe', email: 'jane@example.com', phone: '4155552671', phone_code: '1', phone_iso: 'US', address: '123 Main Street', city: 'New York', state: 'NY', zip_code: '10001', country: 'United States', referral_source: 'Self' };
const rings = [{ id: 'one', ring_size: '8', ring_color: 'midnight', quantity: 1 }];
const countries = ['United States', 'India'];
const check = (patch: Partial<typeof form>) => validatePreorder({ ...form, ...patch }, rings, countries);

describe('Pre-order validation', () => {
  it('accepts valid details and preserves the order payload fields', () => {
    expect(check({}).data).toEqual({ ...form, phone: '+14155552671', items: [{ ring_size: '8', ring_color: 'midnight', quantity: 1 }] });
  });
  it.each(['first_name', 'last_name', 'email', 'phone', 'address', 'city', 'state', 'zip_code', 'country', 'referral_source'] as const)('requires %s', key => {
    expect(check({ [key]: ' ' }).errors[key]).toBeDefined();
    expect(check({ [key]: ' ' }).data).toBeUndefined();
  });
  it.each(['first_name', 'last_name', 'city', 'state'] as const)('rejects invalid characters in %s', key => {
    expect(check({ [key]: 'Jane123@' }).errors[key]).toBeDefined();
  });
  it.each(['abc@123gmail.co', 'jane@gamil.com', 'jane', 'jane@', 'jane@example', 'jane@@example.com', 'jane doe@example.com', '.jane@example.com', 'jane..doe@example.com'])('blocks an order payload for invalid email %s', email => {
    const result = check({ email });
    expect(result.errors.email).toBeDefined();
    expect(result.data).toBeUndefined();
  });
  it('rejects markup in addresses and referrals', () => {
    expect(check({ address: '<script>bad</script>' }).errors.address).toBeDefined();
    expect(check({ referral_source: '<script>bad</script>' }).errors.referral_source).toBeDefined();
  });
  it('rejects invalid postal codes and unknown countries', () => {
    expect(check({ zip_code: '12_34' }).errors.zip_code).toBeDefined();
    expect(check({ country: 'Atlantis' }).errors.country).toBeDefined();
  });
  it.each([['first_name', 50], ['last_name', 50], ['email', 255], ['address', 201], ['city', 101], ['state', 101], ['zip_code', 13], ['referral_source', 101]] as const)('limits %s length', (key, length) => {
    expect(check({ [key]: 'a'.repeat(length) }).errors[key]).toBeDefined();
  });
  it.each(['', '5', '14'])('rejects invalid ring size %s', ring_size => {
    expect(validatePreorder(form, [{ ...rings[0], ring_size }], countries).errors['one.ring_size']).toBeDefined();
  });
  it('requires a supported finish', () => {
    expect(validatePreorder(form, [{ ...rings[0], ring_color: 'green' }], countries).errors['one.ring_color']).toBeDefined();
  });
  it.each([0, 101, 1.5])('rejects invalid quantity %s', quantity => {
    expect(validatePreorder(form, [{ ...rings[0], quantity }], countries).errors['one.quantity']).toBeDefined();
  });
  it('validates each ring separately and enforces the existing ten-ring limit', () => {
    const second = { ...rings[0], id: 'two', ring_size: '' };
    expect(validatePreorder(form, [...rings, second], countries).errors).toEqual({ 'two.ring_size': 'Please select a ring size.' });
    expect(validatePreorder(form, [], countries).data).toBeUndefined();
    expect(validatePreorder(form, Array.from({ length: 11 }, (_, i) => ({ ...rings[0], id: String(i) })), countries).data).toBeUndefined();
  });
  it.each(PHONE_CODE_OPTIONS)('checks incomplete, overlong and valid mobile numbers for $iso', ({ iso, code }) => {
    for (const phone of ['', '1', '123', '9'.repeat(20)]) {
      expect(check({ phone, phone_iso: iso, phone_code: code }).errors.phone).toBeDefined();
      expect(check({ phone, phone_iso: iso, phone_code: code }).data).toBeUndefined();
    }
    const example = getExampleNumber(iso as CountryCode, examples);
    if (example) {
      const resolved = parsePhoneNumberFromString(example.number);
      const error = check({ phone: example.number, phone_iso: iso, phone_code: code }).errors.phone;
      // Vatican mobile examples use Italy's numbering plan; match the sizing-kit country rule.
      if (resolved?.country === iso || (iso === 'VA' && resolved?.country === 'IT')) {
        expect(error).toBeUndefined();
        for (const phone of [example.number, example.formatNational()]) {
          expect(check({ phone, phone_iso: iso, phone_code: code }).data?.phone).toBe(example.number);
        }
      }
      else expect(error).toBeDefined();
    }
  });
  it('rejects phone letters, extensions and country mismatch', () => {
    for (const phone of ['4155552671abc', '4155552671 ext 2', '+919876543210']) {
      expect(check({ phone }).errors.phone).toBeDefined();
    }
  });
  it('requires ten valid Indian mobile digits immediately', () => {
    for (let length = 1; length < 10; length++) expect(check({ phone: '9876543210'.slice(0, length), phone_iso: 'IN', phone_code: '91' }).errors.phone).toBeDefined();
    expect(check({ phone: '98765432101', phone_iso: 'IN', phone_code: '91' }).errors.phone).toBeDefined();
    expect(check({ phone: '9876543210', phone_iso: 'IN', phone_code: '91' }).data?.phone).toBe('+919876543210');
  });
});