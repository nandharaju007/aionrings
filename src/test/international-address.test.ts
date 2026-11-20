import { describe, expect, it } from 'vitest';
import { getExampleNumber, type CountryCode } from 'libphonenumber-js/max';
import examples from 'libphonenumber-js/mobile/examples';
import { addressRules, PREORDER_PHONE_OPTIONS, SHIPPING_COUNTRIES, SHIPPING_COUNTRY_ISO } from '@/lib/international-address';
import { validatePreorder } from '@/lib/preorder-validation';

const us = { first_name: 'Jane', last_name: 'Doe', email: 'jane@example.com', phone: '4155552671', phone_code: '1', phone_iso: 'US', address: '123 Main Street, Apt 4', city: 'New York', state: 'NY', zip_code: '10001', country: 'United States', referral_source: 'Self' };
const rings = [{ id: 'one', ring_size: '8', ring_color: 'midnight', quantity: 1 }];
const check = (patch: Partial<typeof us>) => validatePreorder({ ...us, ...patch }, rings, SHIPPING_COUNTRIES);

describe('Worldwide preorder delivery', () => {
  it('preserves the complete US payload and apartment information', () => {
    expect(check({}).data).toEqual({ ...us, phone: '+14155552671', items: [{ ring_size: '8', ring_color: 'midnight', quantity: 1 }] });
  });
  it.each(['10001', '10001-1234'])('accepts US ZIP %s', zip_code => expect(check({ zip_code }).data?.zip_code).toBe(zip_code));
  it.each(['1000', 'ABCDE', '100011'])('rejects malformed US ZIP %s', zip_code => expect(check({ zip_code }).errors.zip_code).toBeDefined());
  it.each([
    ['Canada', 'Ontario', 'K1A 0B1'], ['United Kingdom', '', 'SW1A 1AA'],
    ['India', 'Karnataka', '560001'], ['Germany', '', '10115'],
    ['Japan', '東京都', '100-0001'], ['Brazil', 'São Paulo', '01310-100'],
  ])('preserves international delivery fields for %s', (country, state, zip_code) => {
    const result = check({ country, state, zip_code });
    expect(result.errors).toEqual({});
    expect(result.data).toMatchObject({ country, state, zip_code, phone: '+14155552671' });
  });
  it.each(['United Arab Emirates', 'Hong Kong', 'Macao'])('does not require a made-up postal code in %s', country => {
    expect(addressRules(country).postalUsed).toBe(false);
    expect(check({ country, state: 'Central', zip_code: '' }).data?.zip_code).toBe('');
  });
  it('allows optional locality fields in Singapore', () => {
    expect(check({ country: 'Singapore', city: '', state: '', zip_code: '546080' }).data).toBeDefined();
  });
  it('requires Hong Kong area but not city or postal code', () => {
    expect(check({ country: 'Hong Kong', city: '', state: 'Kowloon', zip_code: '' }).data).toBeDefined();
    expect(check({ country: 'Hong Kong', city: '', state: '', zip_code: '' }).errors.state).toBeDefined();
  });
  it.each(['United States', 'Canada', 'India', 'Japan', 'Australia'])('requires the region for %s', country => {
    expect(check({ country, state: '' }).errors.state).toBeDefined();
  });
  it.each([
    ['Canada', '12345'], ['United Kingdom', '10001'], ['India', '56000'],
    ['Japan', '10001'], ['Brazil', 'ABCDE'], ['Singapore', '12345'],
  ])('rejects incorrect postal format for %s', (country, zip_code) => expect(check({ country, zip_code }).errors.zip_code).toBeDefined());
  it('handles optional Irish Eircodes', () => {
    expect(check({ country: 'Ireland', state: '', zip_code: '' }).data).toBeDefined();
    expect(check({ country: 'Ireland', state: '', zip_code: 'D02 X285' }).data).toBeDefined();
    expect(check({ country: 'Ireland', zip_code: '12345' }).errors.zip_code).toBeDefined();
  });
  it('preserves non-Latin customer names and addresses', () => {
    expect(check({ first_name: '太郎', last_name: '山田', country: 'Japan', address: '千代田区千代田1番1号', city: '東京', state: '東京都', zip_code: '100-0001' }).data)
      .toMatchObject({ first_name: '太郎', last_name: '山田', address: '千代田区千代田1番1号', city: '東京', state: '東京都' });
  });
  it('rejects markup and control characters in international localities', () => {
    expect(check({ city: '<script>' }).data).toBeUndefined();
    expect(check({ state: 'NY\u0000' }).data).toBeUndefined();
  });
  it('supports delivery territories omitted from the old country list', () => {
    for (const country of ['Puerto Rico', 'Hong Kong', 'Taiwan', 'Côte d\'Ivoire', 'Czechia']) {
      expect(SHIPPING_COUNTRIES).toContain(country);
      expect(SHIPPING_COUNTRY_ISO[country]).toBeTruthy();
    }
  });
  it.each(PREORDER_PHONE_OPTIONS)('validates international and national phone formats for $iso', ({ iso, code }) => {
    const example = getExampleNumber(iso as CountryCode, examples);
    if (!example) return;
    for (const phone of [example.number, example.formatNational()]) {
      expect(check({ phone_iso: iso, phone_code: code, phone }).data?.phone).toBe(example.number);
    }
  });
  it('accepts valid landlines for delivery contact', () => {
    expect(check({ phone: '+442079460018', phone_iso: 'GB', phone_code: '44' }).data?.phone).toBe('+442079460018');
  });
});