import { useState } from 'react';
import { Check, ChevronDown, Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { formatKitPhone, kitContactForSubmission, kitPhoneExample } from '@/lib/kit-contact';
import { COUNTRY_ISO2, PHONE_CODE_OPTIONS } from '@/lib/dial-codes';
import sizingKitBox from '@/assets/sizing-kit-box.jpg.asset.json';

const fields = [
  { key: 'firstName', label: 'First name', autoComplete: 'given-name', max: 49, placeholder: 'Jane' },
  { key: 'lastName', label: 'Last name', autoComplete: 'family-name', max: 49, placeholder: 'Doe' },
  { key: 'email', label: 'Email address', autoComplete: 'email', max: 254, placeholder: 'jane@example.com' },
  { key: 'phone', label: 'Phone number', autoComplete: 'tel-national', max: 30, placeholder: '' },
  { key: 'country', label: 'Country', autoComplete: 'country-name', max: 100, placeholder: 'Select your country' },
  { key: 'address', label: 'Street address & apartment', autoComplete: 'street-address', max: 200, placeholder: '123 Main Street, Apt 4' },
  { key: 'city', label: 'City', autoComplete: 'address-level2', max: 100, placeholder: 'City' },
  { key: 'region', label: 'State / province (optional)', autoComplete: 'address-level1', max: 100, placeholder: 'State / province' },
  { key: 'postcode', label: 'Postal / ZIP code', autoComplete: 'postal-code', max: 12, placeholder: 'Postal / ZIP code' },
] as const;

type FieldKey = (typeof fields)[number]['key'];

export function SizingKitRequest() {
  const [address, setAddress] = useState({ firstName: '', lastName: '', address: '', city: '', region: '', postcode: '', country: 'United States', email: '', phone: '' });
  const [phoneIso, setPhoneIso] = useState('US');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({});

  if (sent) return <div role="status" className="space-y-3"><Check className="h-8 w-8 text-primary" /><h4 className="text-lg font-medium">Sizing kit requested</h4><p className="text-sm">Your delivery address has been saved for our team.</p><p className="text-sm text-muted-foreground">When your kit arrives, try the sample rings. Then return to the site and order your aiOn ring in the size that fits.</p></div>;

  return <>
    <img src={sizingKitBox.url} alt="aiOn sizing kit box with sample ring sizers" className="w-full rounded-xl border border-border object-cover" loading="lazy" />
    <Package className="mt-4 h-8 w-8 text-primary" />
    <h4 className="mt-3 text-lg font-medium">Where should we send your sizing kit?</h4>
    <p className="mt-2 text-sm text-muted-foreground">Try the sample sizes first. Order your aiOn ring once you know your fit.</p>
    <form className="mt-5 grid grid-cols-2 gap-3" noValidate onSubmit={async event => {
      event.preventDefault(); event.stopPropagation(); if (busy) return;
      const parsed = kitContactForSubmission(address, phoneIso);
      if (!parsed.data) {
        setFieldErrors(parsed.errors);
        setError('Please fix the highlighted fields above.');
        return;
      }
      setBusy(true); setError(''); setFieldErrors({});
      try {
        const { data, error: failure } = await supabase.functions.invoke('request-sizing-kit', { body: parsed.data });
        if (failure || !data?.ok) throw new Error('Your request could not be saved. Please try again.');
        setSent(true);
      } catch { setError('Your request could not be saved. Please try again.'); }
      finally { setBusy(false); }
    }}>
      {fields.map(field => {
        const message = fieldErrors[field.key];
        const paired = ['firstName', 'lastName', 'city', 'region'].includes(field.key);
        const inputClass = `h-12 w-full min-w-0 rounded-xl border bg-background px-4 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 ${message ? 'border-destructive' : 'border-input focus:border-primary'}`;
        return <div key={field.key} className={paired ? 'min-w-0' : 'col-span-2 min-w-0'}>
          <label htmlFor={`kit-${field.key}`} className="block text-[13px] text-muted-foreground">{field.label}</label>
          {field.key === 'country' ? <div className="relative mt-1.5">
            <select id="kit-country" value={address.country} disabled={busy} autoComplete="country-name" aria-invalid={!!message} aria-describedby={message ? 'kit-country-error' : undefined} className={`${inputClass} appearance-none pr-10`} onChange={event => {
              const country = event.target.value;
              const iso = COUNTRY_ISO2[country];
              if (iso) setPhoneIso(iso);
              setAddress(previous => ({ ...previous, country, phone: iso ? formatKitPhone(previous.phone, iso) : previous.phone }));
              setFieldErrors(previous => ({ ...previous, country: undefined, phone: undefined }));
            }}>
              {PHONE_CODE_OPTIONS.map(option => <option key={option.iso} value={option.country}>{option.country}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-4 h-4 w-4 text-muted-foreground" />
          </div> : field.key === 'phone' ? <div className={`mt-1.5 flex min-w-0 items-stretch overflow-hidden rounded-xl border bg-background transition-all focus-within:ring-2 focus-within:ring-primary/30 ${message ? 'border-destructive' : 'border-input focus-within:border-primary'}`}>
            <div className="relative flex shrink-0 items-center">
              <select aria-label="Country dial code" disabled={busy} value={phoneIso} className="h-12 cursor-pointer appearance-none border-r border-input bg-transparent pl-3 pr-8 text-[14px] text-foreground focus:outline-none" onChange={event => {
                setPhoneIso(event.target.value);
                setAddress(previous => ({ ...previous, phone: formatKitPhone(previous.phone, event.target.value) }));
                setFieldErrors(previous => ({ ...previous, phone: undefined }));
              }}>
                {PHONE_CODE_OPTIONS.map(option => <option key={option.iso} value={option.iso}>{option.iso} +{option.code}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 h-4 w-4 text-muted-foreground" />
            </div>
            <input
              id="kit-phone"
              required
              disabled={busy}
              type="tel"
              autoComplete={field.autoComplete}
              maxLength={field.max}
              placeholder={kitPhoneExample(phoneIso)}
              value={address.phone}
              aria-invalid={message ? true : undefined}
              aria-describedby={message ? 'kit-phone-error' : undefined}
              onChange={event => {
                const value = event.target.value;
                setAddress(previous => ({ ...previous, phone: formatKitPhone(value, phoneIso) }));
                if (message) setFieldErrors(previous => ({ ...previous, phone: undefined }));
              }}
              className="h-12 min-w-0 flex-1 bg-transparent px-4 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div> : <div className="mt-1.5 min-w-0">
          <input
            id={`kit-${field.key}`}
            required={field.key !== 'region'}
            disabled={busy}
            type={field.key === 'email' ? 'email' : 'text'}
            autoComplete={field.autoComplete}
            maxLength={field.max}
            placeholder={field.placeholder}
            value={address[field.key]}
            aria-invalid={message ? true : undefined}
            aria-describedby={message ? `kit-${field.key}-error` : undefined}
            onChange={event => {
              const value = event.target.value;
              setAddress(previous => ({ ...previous, [field.key]: value }));
              if (message) setFieldErrors(previous => ({ ...previous, [field.key]: undefined }));
            }}
            className={inputClass}
          />
          </div>}
          {message && <p id={`kit-${field.key}-error`} role="alert" className="mt-1 text-xs text-destructive">{message}</p>}
        </div>;
      })}
      {error && <p role="alert" className="col-span-2 text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={busy} className="col-span-2 h-12 w-full">{busy ? <Loader2 className="animate-spin" /> : <Package />}{busy ? 'Saving…' : 'Request my sizing kit'}</Button>
    </form>
  </>;
}
