import { describe, expect, it } from 'vitest';
import { kitContactForSubmission, kitPhoneForSubmission, phoneHasEnoughDigits } from '@/lib/kit-contact';

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

  it('holds the live phone error back until the number could be complete', () => {
    expect(phoneHasEnoughDigits('9', 'US')).toBe(false);
    expect(phoneHasEnoughDigits('415 555', 'US')).toBe(false);
    expect(phoneHasEnoughDigits('415 555 267', 'US')).toBe(false);
    expect(phoneHasEnoughDigits('415 555 2671', 'US')).toBe(true);
    expect(phoneHasEnoughDigits('98765', 'IN')).toBe(false);
    expect(phoneHasEnoughDigits('98765 4321', 'IN')).toBe(false);
    expect(phoneHasEnoughDigits('98765 43210', 'IN')).toBe(true);
  });
});