import { describe, expect, it } from 'vitest';
import { kitContactForSubmission, kitPhoneForSubmission } from '@/lib/kit-contact';

describe('Sizing kit country-aware contact details', () => {
  const values = { firstName: 'Jane', lastName: 'Doe', address: '123 Main Street', city: 'Toronto', region: '', postcode: 'M5V 1A1', country: 'Canada', email: 'jane@example.com', phone: '416 555 0123' };

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
    expect(kitPhoneForSubmission('07700 900123', 'GB')).toBe('+447700900123');
  });

  it('rejects incomplete or mismatched country numbers', () => {
    expect(kitPhoneForSubmission('123', 'IN')).toBeUndefined();
    expect(kitPhoneForSubmission('+919876543210', 'CA')).toBeUndefined();
  });
});