
-- partners
CREATE TABLE IF NOT EXISTS public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  contact_email text,
  contact_phone text,
  contact_person text,
  notes text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.partners TO anon, authenticated;
GRANT ALL ON public.partners TO service_role;

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active partners are publicly viewable"
  ON public.partners FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "Admins view all partners"
  ON public.partners FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins insert partners"
  ON public.partners FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update partners"
  ON public.partners FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete partners"
  ON public.partners FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- reservations attribution
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS partner_code text,
  ADD COLUMN IF NOT EXISTS partner_name text;

-- bulk reservations
CREATE SEQUENCE IF NOT EXISTS public.bulk_reservation_seq START 1;

CREATE TABLE IF NOT EXISTS public.bulk_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_number text NOT NULL DEFAULT ('AION-B-' || lpad(nextval('public.bulk_reservation_seq')::text, 5, '0')),
  business_name text NOT NULL,
  contact_person text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  estimated_quantity integer NOT NULL,
  size_breakdown jsonb,
  notes text,
  partner_code text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.bulk_reservations TO service_role;
GRANT SELECT, UPDATE, DELETE ON public.bulk_reservations TO authenticated;

ALTER TABLE public.bulk_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view bulk reservations"
  ON public.bulk_reservations FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update bulk reservations"
  ON public.bulk_reservations FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete bulk reservations"
  ON public.bulk_reservations FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
