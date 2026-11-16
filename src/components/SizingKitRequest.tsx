import { useState } from 'react';
import { Check, Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { kitAddressSchema } from '@/lib/kit-address';
import sizingKitBox from '@/assets/sizing-kit-box.jpg.asset.json';

const fields = [
  { key: 'name', label: 'Full name', autoComplete: 'name', max: 100 },
  { key: 'address', label: 'Street address & apartment', autoComplete: 'street-address', max: 200 },
  { key: 'city', label: 'City', autoComplete: 'address-level2', max: 100 },
  { key: 'region', label: 'State / province (optional)', autoComplete: 'address-level1', max: 100 },
  { key: 'postcode', label: 'Postal / ZIP code', autoComplete: 'postal-code', max: 30 },
  { key: 'country', label: 'Country', autoComplete: 'country-name', max: 100 },
] as const;
export function SizingKitRequest() {
  const [address, setAddress] = useState({ name: '', address: '', city: '', region: '', postcode: '', country: '' });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  if (sent) return <div role="status" className="space-y-3"><Check className="h-8 w-8 text-primary" /><h4 className="text-lg font-medium">Sizing kit requested</h4><p className="text-sm">Your delivery address has been saved for our team.</p><p className="text-sm text-muted-foreground">When your kit arrives, try the sample rings. Then return to the site and order your aiOn ring in the size that fits.</p></div>;
  return <>
    <img src={sizingKitBox.url} alt="aiOn sizing kit box with sample ring sizers" className="w-full rounded-xl border border-border object-cover" loading="lazy" />
    <Package className="mt-4 h-8 w-8 text-primary" />
    <h4 className="mt-3 text-lg font-medium">Where should we send your sizing kit?</h4>
    <p className="mt-2 text-sm text-muted-foreground">Try the sample sizes first. Order your aiOn ring once you know your fit.</p>
    <form className="mt-5 space-y-3" onSubmit={async event => {
      event.preventDefault(); event.stopPropagation(); if (busy) return;
      const parsed = kitAddressSchema.safeParse(address);
      if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Please check your address.'); return; }
      setBusy(true); setError('');
      try {
        const { data, error: failure } = await supabase.functions.invoke('request-sizing-kit', { body: parsed.data });
        if (failure || !data?.ok) throw new Error('Your request could not be saved. Please try again.');
        setSent(true);
      } catch { setError('Your request could not be saved. Please try again.'); }
      finally { setBusy(false); }
    }}>
      {fields.map(field => <label key={field.key} className="block text-sm">{field.label}<input required={field.key !== 'region'} disabled={busy} autoComplete={field.autoComplete} maxLength={field.max} value={address[field.key]} onChange={event => setAddress({ ...address, [field.key]: event.target.value })} className="mt-1 h-11 w-full rounded-md border border-input bg-background px-3 text-base text-foreground" /></label>)}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={busy} className="h-12 w-full">{busy ? <Loader2 className="animate-spin" /> : <Package />}{busy ? 'Saving…' : 'Request my sizing kit'}</Button>
    </form>
  </>;
}