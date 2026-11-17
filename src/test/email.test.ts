import { describe, expect, it } from 'vitest';
import { emailTypoSuggestion, validateEmail } from '@/lib/email';

describe('validateEmail', () => {
  it('accepts a normal email', () => {
    expect(validateEmail('jane@gmail.com')).toEqual({ ok: true });
  });

  it('accepts a company domain that is not a popular provider', () => {
    expect(validateEmail('care@mazosolutions.com')).toEqual({ ok: true });
  });

  it('accepts a regional variant of a popular domain', () => {
    expect(validateEmail('jane@gmail.com.au')).toEqual({ ok: true });
  });

  it('rejects an empty email', () => {
    const result = validateEmail('   ');
    expect(result.ok).toBe(false);
  });

  it('rejects a missing domain', () => {
    const result = validateEmail('jane@');
    expect(result.ok).toBe(false);
  });

  it('flags a padded gmail domain like 123gmail.co and suggests gmail.com', () => {
    const result = validateEmail('abc@123gmail.co');
    expect(result).toEqual({ ok: false, message: 'Did you mean abc@gmail.com?' });
  });

  it('flags a transposed gmail domain like gamil.com', () => {
    const result = validateEmail('sam@gamil.com');
    expect(result).toEqual({ ok: false, message: 'Did you mean sam@gmail.com?' });
  });

  it('flags a missing letter like gmail.co', () => {
    const result = validateEmail('sam@gmail.co');
    expect(result).toEqual({ ok: false, message: 'Did you mean sam@gmail.com?' });
  });

  it('flags a yahoo typo', () => {
    const result = validateEmail('sam@yaho.com');
    expect(result).toEqual({ ok: false, message: 'Did you mean sam@yahoo.com?' });
  });
});

describe('emailTypoSuggestion', () => {
  it('returns null for exact popular domains', () => {
    expect(emailTypoSuggestion('a@outlook.com')).toBeNull();
  });

  it('returns null when there is no @', () => {
    expect(emailTypoSuggestion('not-an-email')).toBeNull();
  });
});
