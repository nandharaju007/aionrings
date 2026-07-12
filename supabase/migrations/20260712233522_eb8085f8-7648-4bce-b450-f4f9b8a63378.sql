
-- Partners
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  contact_email TEXT,
  phone TEXT,
  website TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.partners TO anon;
GRANT SELECT ON public.partners TO authenticated;
GRANT ALL ON public.partners TO service_role;

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Public can read only active partners (for banner lookup by code)
CREATE POLICY "Public can view active partners"
  ON public.partners FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins can view all partners"
  ON public.partners FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert partners"
  ON public.partners FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update partners"
  ON public.partners FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete partners"
  ON public.partners FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add partner attribution to existing reservations
ALTER TABLE public.reservations
  ADD COLUMN partner_code TEXT,
  ADD COLUMN partner_name TEXT;

CREATE INDEX reservations_partner_code_idx ON public.reservations(partner_code);

-- Bulk reservations (B2B inquiries)
CREATE TABLE public.bulk_reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_number TEXT NOT NULL UNIQUE DEFAULT ('AION-B-' || lpad((floor(random()*900000)+100000)::text, 6, '0')),
  business_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  estimated_quantity INTEGER NOT NULL,
  size_breakdown JSONB,
  notes TEXT,
  partner_code TEXT,
  partner_name TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE, DELETE ON public.bulk_reservations TO authenticated;
GRANT ALL ON public.bulk_reservations TO service_role;

ALTER TABLE public.bulk_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view bulk reservations"
  ON public.bulk_reservations FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update bulk reservations"
  ON public.bulk_reservations FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete bulk reservations"
  ON public.bulk_reservations FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
