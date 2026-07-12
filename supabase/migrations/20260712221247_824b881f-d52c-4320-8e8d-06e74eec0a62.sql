
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Reservations
CREATE SEQUENCE public.reservation_seq START 1001;

CREATE TABLE public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_number text NOT NULL UNIQUE DEFAULT ('AION-' || lpad(nextval('public.reservation_seq')::text, 6, '0')),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  country text NOT NULL,
  ring_size text NOT NULL,
  ring_color text,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity BETWEEN 1 AND 10),
  referral_source text,
  status text NOT NULL DEFAULT 'reserved',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.reservations TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.reservations TO authenticated;
GRANT ALL ON public.reservations TO service_role;
GRANT USAGE ON SEQUENCE public.reservation_seq TO anon, authenticated, service_role;

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Anyone can create a reservation
CREATE POLICY "Anyone can create a reservation" ON public.reservations
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Only admins can read/update/delete
CREATE POLICY "Admins can view reservations" ON public.reservations
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update reservations" ON public.reservations
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete reservations" ON public.reservations
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_reservations_created_at ON public.reservations(created_at DESC);
CREATE INDEX idx_reservations_email ON public.reservations(email);
CREATE INDEX idx_reservations_referral ON public.reservations(referral_source);

-- Public counter function for founder edition
CREATE OR REPLACE FUNCTION public.reservation_totals()
RETURNS TABLE(total_reservations bigint, total_rings bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COUNT(*)::bigint, COALESCE(SUM(quantity), 0)::bigint FROM public.reservations
$$;

GRANT EXECUTE ON FUNCTION public.reservation_totals() TO anon, authenticated;
