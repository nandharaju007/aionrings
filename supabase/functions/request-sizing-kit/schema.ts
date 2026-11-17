import { z } from 'https://esm.sh/zod@3.25.76';
import { parsePhoneNumberFromString } from 'https://esm.sh/libphonenumber-js@1.13.16/max';

const plainText = /^[^<>]*$/;
const nameLike = /^[A-Za-zÀ-ÖØ-öø-ÿ'’.\- ]+$/;

// Mirrors src/lib/email.ts (Deno cannot import from src): flag likely
// mistyped popular domains such as "123gmail.co" or "gamil.com".
const POPULAR_DOMAINS = [
  'gmail.com', 'googlemail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'icloud.com', 'aol.com', 'live.com', 'msn.com', 'proton.me', 'protonmail.com', 'me.com',
];

function editDistance(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = curr;
  }
  return prev[b.length];
}

function emailTypoSuggestion(email: string): string | null {
  const at = email.lastIndexOf('@');
  if (at < 0) return null;
  const domain = email.slice(at + 1).trim().toLowerCase();
  if (!domain || POPULAR_DOMAINS.includes(domain)) return null;
  if (POPULAR_DOMAINS.some((known) => domain.startsWith(`${known}.`))) return null;
  const label = domain.split('.')[0];
  for (const known of POPULAR_DOMAINS) {
    const knownLabel = known.split('.')[0];
    if (
      editDistance(domain, known) <= 2 ||
      editDistance(label, knownLabel) <= 1 ||
      (label.length > knownLabel.length && label.includes(knownLabel))
    ) {
      return known;
    }
  }
  return null;
}

export const kitAddressSchema = z.object({
  name: z.string().trim()
    .min(2, 'Please enter your full name.')
    .max(100, 'Name must be under 100 characters.')
    .regex(nameLike, 'Name can only contain letters, spaces, hyphens and apostrophes.')
    .refine(value => /\s/.test(value), 'Please enter your first and last name.'),
  address: z.string().trim()
    .min(5, 'Please enter your street address and apartment.')
    .max(200, 'Address must be under 200 characters.')
    .regex(plainText, 'Address must be plain text, without < or >.'),
  city: z.string().trim()
    .min(2, 'Please enter your city.')
    .max(100, 'City must be under 100 characters.')
    .regex(nameLike, 'City can only contain letters, spaces and hyphens.'),
  region: z.string().trim()
    .max(100, 'State / province must be under 100 characters.')
    .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ'’.\- ]*$/, 'State / province can only contain letters, spaces and hyphens.')
    .default(''),
  postcode: z.string().trim()
    .min(3, 'Please enter your postal / ZIP code.')
    .max(12, 'Postal / ZIP code must be under 12 characters.')
    .regex(/^[A-Za-z0-9][A-Za-z0-9 -]*$/, 'Postal / ZIP code can only contain letters, numbers, spaces and hyphens.'),
  country: z.string().trim()
    .min(2, 'Please enter your country.')
    .max(100, 'Country must be under 100 characters.')
    .regex(nameLike, 'Country can only contain letters, spaces and hyphens.'),
  email: z.string().trim().toLowerCase()
    .min(1, 'Please enter your email address.')
    .email('Please enter a valid email address.')
    .max(254, 'Email must be under 254 characters.')
    .superRefine((value, ctx) => {
      const suggestion = emailTypoSuggestion(value);
      if (suggestion) {
        const local = value.slice(0, value.lastIndexOf('@') + 1);
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Did you mean ${local}${suggestion}?` });
      }
    }),
  phone: z.string().trim()
    .min(7, 'Please enter your phone number.')
    .max(20, 'Phone number must be under 20 characters.')
    .regex(/^\+?[0-9][0-9 ()-]*$/, 'Phone number can only contain digits, spaces, brackets, hyphens and a leading +.')
    .refine(value => (value.match(/[0-9]/g) ?? []).length >= 7, 'Phone number must have at least 7 digits.')
    .refine(value => {
      const phone = parsePhoneNumberFromString(value);
      const type = phone?.getType();
      return phone?.isValid() && (type === 'MOBILE' || type === 'FIXED_LINE_OR_MOBILE');
    }, 'Enter a valid mobile number including its country code.'),
}).strict();
