CREATE TABLE public.sizing_kit_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
 address text NOT NULL CHECK (char_length(address) BETWEEN 1 AND 200),
 city text NOT NULL CHECK (char_length(city) BETWEEN 1 AND 100),
 region text NOT NULL DEFAULT '' CHECK (char_length(region) <= 100),
 postcode text NOT NULL CHECK (char_length(postcode) BETWEEN 1 AND 30),
 country text NOT NULL CHECK (char_length(country) BETWEEN 1 AND 100),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.sizing_kit_requests TO authenticated;
GRANT ALL ON public.sizing_kit_requests TO service_role;
ALTER TABLE public.sizing_kit_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view sizing kit requests" ON public.sizing_kit_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX sizing_kit_requests_created_at_idx ON public.sizing_kit_requests (created_at DESC);