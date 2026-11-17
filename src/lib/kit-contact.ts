import { z } from 'zod';
import { AsYouType, getExampleNumber, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';
import examples from 'libphonenumber-js/mobile/examples';
import { COUNTRY_ISO2 } from '@/lib/dial-codes';
import { kitAddressSchema } from '@/lib/kit-address';

const namePart = z.string().trim().min(1, 'Please enter your name.').max(49, 'Please use fewer than 50 characters.')
  .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ'’.\- ]+$/, 'Use letters, spaces, hyphens or apostrophes.');

export const kitContactNames = z.object({
  firstName: namePart,
  lastName: namePart,
});

export function formatKitPhone(value: string, iso: string) {
  return new AsYouType(iso as CountryCode).input(value);
}

export function kitPhoneExample(iso: string) {
  return getExampleNumber(iso as CountryCode, examples)?.formatNational() ?? 'Phone number';
}

export function kitPhoneForSubmission(value: string, iso: string) {
  const phone = parsePhoneNumberFromString(value, iso as CountryCode);
  return phone?.isPossible() && phone.country === iso ? phone.number : undefined;
}

export function kitContactForSubmission(values: {
  firstName: string; lastName: string; address: string; city: string; region: string;
  postcode: string; country: string; email: string; phone: string;
}, phoneIso: string) {
  const { firstName, lastName, ...address } = values;
  const names = kitContactNames.safeParse({ firstName, lastName });
  const phone = kitPhoneForSubmission(address.phone, phoneIso);
  const parsed = kitAddressSchema.safeParse({ ...address, name: `${firstName.trim()} ${lastName.trim()}`, phone: phone ?? '' });
  const errors: Record<string, string> = {};
  if (!names.success) {
    for (const issue of names.error.issues) errors[String(issue.path[0])] ??= issue.message;
  }
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      if (issue.path[0] !== 'name') errors[String(issue.path[0])] ??= issue.message;
    }
  }
  if (!COUNTRY_ISO2[address.country]) errors.country = 'Please select your country.';
  if (!phone) errors.phone = 'Enter a valid phone number for the selected dial code.';
  return { data: parsed.success && names.success && !Object.keys(errors).length ? parsed.data : undefined, errors };
}