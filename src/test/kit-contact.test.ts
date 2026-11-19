import { describe, expect, it } from 'vitest';
import { kitContactForSubmission, kitPhoneForSubmission } from '@/lib/kit-contact';
import { PHONE_CODE_OPTIONS } from '@/lib/dial-codes';

describe('Sizing kit country-aware contact details', () => {
  const values = { firstName: 'Jane', lastName: 'Doe', address: '123 Main Street', city: 'Toronto', region: 'Ontario', postcode: 'M5V 1A1', country: 'Canada', email: 'jane@example.com', phone: '416 555 0123' };

  it('combines first and last names into the existing saved name', () => {
    expect(kitContactForSubmission(values, 'CA').data?.name).toBe('Jane Doe');
    expect(kitContactForSubmission({ ...values, lastName: '' }, 'CA').errors.lastName).toBeDefined();
    expect(kitContactForSubmission({ ...values, firstName: '' }, 'CA').errors.firstName).toBeDefined();
  });

  it('saves Canadian phone numbers with +1', () => {
    expect(kitPhoneForSubmission('416 555 0123', 'CA')).toBe('+14165550123');
  });

  it('saves Indian phone numbers with +91', () => {
    expect(kitPhoneForSubmission('98765 43210', 'IN')).toBe('+919876543210');
  });

  it('removes the UK national trunk prefix', () => {
    expect(kitPhoneForSubmission('07400 123456', 'GB')).toBe('+447400123456');
  });

  it('rejects incomplete or mismatched country numbers', () => {
    expect(kitPhoneForSubmission('123', 'IN')).toBeUndefined();
    expect(kitPhoneForSubmission('+919876543210', 'CA')).toBeUndefined();
  });

  it('rejects eleven-digit Indian mobile numbers with or without +91', () => {
    expect(kitPhoneForSubmission('98765432101', 'IN')).toBeUndefined();
    expect(kitPhoneForSubmission('+9198765432101', 'IN')).toBeUndefined();
  });

  it('validates the Indian mobile prefix and international country code', () => {
    expect(kitPhoneForSubmission('1234567890', 'IN')).toBeUndefined();
    expect(kitPhoneForSubmission('+919876543210', 'IN')).toBe('+919876543210');
  });

  it('reports incomplete Indian numbers immediately and clears for ten valid digits', () => {
    for (let digits = 1; digits < 10; digits++) {
      expect(kitContactForSubmission({ ...values, phone: '9876543210'.slice(0, digits) }, 'IN').errors.phone).toBeDefined();
    }
    expect(kitContactForSubmission({ ...values, phone: '9876543210' }, 'IN').errors.phone).toBeUndefined();
  });

  it.each(PHONE_CODE_OPTIONS)('reports empty, short and overlong numbers for $iso', ({ iso }) => {
    for (const phone of ['', '1', '123', '9'.repeat(20)]) {
      const result = kitContactForSubmission({ ...values, phone }, iso);
      expect(result.errors.phone).toBeDefined();
      expect(result.data).toBeUndefined();
    }
  });
});