import { z } from 'https://esm.sh/zod@3.25.76';

const plainText = /^[^<>]*$/;
const nameLike = /^[A-Za-zÀ-ÖØ-öø-ÿ'’.\- ]+$/;

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
    .max(254, 'Email must be under 254 characters.'),
  phone: z.string().trim()
    .min(7, 'Please enter your phone number.')
    .max(20, 'Phone number must be under 20 characters.')
    .regex(/^\+?[0-9][0-9 ()-]*$/, 'Phone number can only contain digits, spaces, brackets, hyphens and a leading +.')
    .refine(value => (value.match(/[0-9]/g) ?? []).length >= 7, 'Phone number must have at least 7 digits.'),
}).strict();
