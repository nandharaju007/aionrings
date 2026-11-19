import { z } from 'zod';
import { kitAddressSchema } from '@/lib/kit-address';
import { kitContactNames, kitPhoneForSubmission } from '@/lib/kit-contact';
import { PHONE_CODE_OPTIONS } from '@/lib/dial-codes';

export const preorderRingSchema = z.object({
  id: z.string().min(1),
  ring_size: z.enum(['6', '7', '8', '9', '10', '11', '12', '13'], { errorMap: () => ({ message: 'Please select a ring size.' }) }),
  ring_color: z.enum(['midnight', 'silver', 'rose'], { errorMap: () => ({ message: 'Please select a finish.' }) }),
  quantity: z.number().int().min(1).max(100),
});

export const preorderDetailsSchema = z.object({
  first_name: kitContactNames.shape.firstName,
  last_name: kitContactNames.shape.lastName,
  email: kitAddressSchema.shape.email,
  phone: z.string().trim().max(30, 'Phone number must be under 30 characters.')
    .regex(/^(?:\+?[0-9]|\([0-9])[0-9 ()-]*$/, 'Use digits, spaces, brackets, hyphens and a leading + only.'),
  phone_code: z.string(),
  phone_iso: z.string(),
  address: kitAddressSchema.shape.address,
  city: kitAddressSchema.shape.city,
  state: kitAddressSchema.shape.region,
  zip_code: kitAddressSchema.shape.postcode,
  country: z.string().trim().min(1, 'Please select your country.').max(100),
  referral_source: z.string().trim().min(1, 'Required, enter "Self" if no referral').max(100, 'Referral must be under 100 characters.')
    .regex(/^[^<>\u0000-\u001f\u007f]+$/, 'Referral must be plain text, without markup or control characters.'),
});

export type PreorderDetails = z.infer<typeof preorderDetailsSchema>;
export type PreorderRing = { id: string; ring_size: string; ring_color: string; quantity: number };

export function validatePreorder(form: PreorderDetails, items: PreorderRing[], countries: readonly string[]) {
  const details = preorderDetailsSchema.safeParse(form);
  const rings = z.array(preorderRingSchema).min(1).max(10).safeParse(items);
  const errors: Record<string, string> = {};
  if (!details.success) {
    for (const issue of details.error.issues) errors[String(issue.path[0])] ??= issue.message;
  }
  if (!rings.success) {
    for (const issue of rings.error.issues) {
      const index = issue.path[0];
      const item = typeof index === 'number' ? items[index] : undefined;
      const key = item ? `${item.id}.${issue.path[1]}` : 'rings';
      errors[key] ??= issue.message;
    }
  }
  if (!countries.includes(form.country.trim())) errors.country = 'Please select a country from the list.';
  const option = PHONE_CODE_OPTIONS.find(option => option.iso === form.phone_iso && option.code === form.phone_code);
  const phone = option ? kitPhoneForSubmission(form.phone, option.iso) : undefined;
  if (!phone) errors.phone ??= form.phone_iso === 'IN'
    ? 'Enter a 10-digit Indian mobile number starting with 6, 7, 8 or 9 (+91).'
    : 'Enter a valid mobile number for the selected country dial code.';
  return {
    errors,
    data: details.success && rings.success && phone && !Object.keys(errors).length
      ? { ...details.data, phone, items: rings.data.map(({ ring_size, ring_color, quantity }) => ({ ring_size, ring_color, quantity })) }
      : undefined,
  };
}