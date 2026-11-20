import { z } from 'zod';
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js/max';
import { COUNTRIES } from '@/lib/countries';
import { COUNTRY_ISO2, PHONE_CODE_OPTIONS } from '@/lib/dial-codes';
import formats from '@/lib/data/address-formats.json';

// Source: google/libaddressinput testdata/countryinfo.txt (Apache-2.0),
// retrieved 2026-11-20. Keep local: typing must never depend on a network request.
type AddressFormat = { fmt?: string; require?: string; zip?: string; zipex?: string; state_name_type?: string; zip_name_type?: string; sub_keys?: string; sub_names?: string };
const metadata: Record<string, AddressFormat> = formats;
const names = new Intl.DisplayNames(['en'], { type: 'region' });
export const SHIPPING_COUNTRY_ISO: Record<string, string> = { ...COUNTRY_ISO2 };
for (const iso of getCountries()) {
  if (!Object.values(SHIPPING_COUNTRY_ISO).includes(iso)) SHIPPING_COUNTRY_ISO[names.of(iso) ?? iso] = iso;
}
export const SHIPPING_COUNTRIES = Array.from(new Set([...COUNTRIES, ...Object.keys(SHIPPING_COUNTRY_ISO)])).sort((a, b) => a.localeCompare(b));
export const PREORDER_PHONE_OPTIONS = Object.entries(SHIPPING_COUNTRY_ISO).map(([country, iso]) => {
  const existing = PHONE_CODE_OPTIONS.find(option => option.iso === iso);
  return { country, iso, code: existing?.code ?? getCountryCallingCode(iso as CountryCode) };
}).sort((a, b) => a.country.localeCompare(b.country));

export function addressRules(country: string) {
  const iso = SHIPPING_COUNTRY_ISO[country];
  const row = metadata[iso] ?? {};
  const required = row.require ?? 'AC';
  const format = row.fmt ?? '%A%n%C';
  const regionType = row.state_name_type ?? 'province';
  const regionLabels: Record<string, string> = { state: 'State', province: 'Province', county: 'County', prefecture: 'Prefecture', area: 'Area', emirate: 'Emirate', district: 'District', parish: 'Parish', island: 'Island' };
  return {
    iso, cityRequired: required.includes('C'), regionRequired: required.includes('S'),
    postalRequired: required.includes('Z'), postalUsed: format.includes('%Z') || !!row.zip,
    regionLabel: iso === 'US' ? 'State / Region' : regionLabels[regionType] ?? 'State / Region',
    postalLabel: iso === 'US' ? 'ZIP / Postal code' : iso === 'IN' ? 'PIN code' : 'Postal code',
    postalExample: row.zipex?.split(',')[0] ?? '', postalPattern: row.zip,
    regions: (row.sub_names ?? row.sub_keys ?? '').split('~').filter(Boolean),
  };
}

const safeText = /^[\p{L}\p{M}\p{N}\p{Zs}'’.,()/\-]+$/u;
export const internationalName = z.string().trim().min(1, 'Please enter your name.').max(49, 'Please use fewer than 50 characters.')
  .regex(/^[\p{L}\p{M}'’.\- ]+$/u, 'Use letters, spaces, hyphens or apostrophes.');
export const internationalLocality = z.string().trim().max(100, 'Please use fewer than 101 characters.')
  .refine(value => !value || safeText.test(value), 'Use plain address text without markup or control characters.');
export const internationalPostal = z.string().trim().max(12, 'Postal code must be under 12 characters.')
  .refine(value => !value || /^[A-Za-z0-9][A-Za-z0-9 -]*$/.test(value), 'Use letters, numbers, spaces and hyphens.');

export function validateShippingAddress(values: { country?: string; city?: string; state?: string; zip_code?: string }) {
  const rules = addressRules(values.country?.trim() ?? '');
  const errors: Record<string, string> = {};
  if (!rules.iso) errors.country = 'Please select a country from the list.';
  if (rules.cityRequired && !values.city?.trim()) errors.city = 'Please enter your city.';
  if (rules.regionRequired && !values.state?.trim()) errors.state = `Please enter your ${rules.regionLabel.toLowerCase()}.`;
  const postal = values.zip_code?.trim() ?? '';
  if (rules.postalRequired && !postal) errors.zip_code = `Please enter your ${rules.postalLabel.toLowerCase()}.`;
  else if (postal && rules.postalPattern && !new RegExp(`^(?:${rules.postalPattern})$`, 'i').test(postal)) {
    errors.zip_code = `Enter a valid ${rules.postalLabel.toLowerCase()}${rules.postalExample ? `, for example ${rules.postalExample}` : ''}.`;
  }
  return errors;
}

export function preorderPhoneForSubmission(value: string, iso: string) {
  const phone = parsePhoneNumberFromString(value, iso as CountryCode);
  // Some territories share their parent country's mobile numbering plan.
  const sharedPlans: Record<string, string> = { VA: 'IT', AX: 'FI', CX: 'AU', CC: 'AU', IM: 'GB', BL: 'GP', MF: 'GP', SJ: 'NO', EH: 'MA' };
  return phone?.isValid() && (phone.country === iso || phone.country === sharedPlans[iso]) ? phone.number : undefined;
}