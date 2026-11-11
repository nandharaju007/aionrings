CREATE TABLE public.sizing_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  show_sizes boolean NOT NULL DEFAULT false,
  size_chart jsonb NOT NULL DEFAULT '[]'::jsonb,
  chart_version integer NOT NULL DEFAULT 1,
  pass_min_share numeric NOT NULL DEFAULT 0.8,
  pass_min_photos integer NOT NULL DEFAULT 15,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.sizing_settings TO anon, authenticated;
GRANT UPDATE ON public.sizing_settings TO authenticated;
GRANT ALL ON public.sizing_settings TO service_role;
ALTER TABLE public.sizing_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sizing settings are readable" ON public.sizing_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins update sizing settings" ON public.sizing_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.sizing_settings (id, size_chart)
SELECT true, jsonb_agg(jsonb_build_object('us', s, 'diameter_mm', round((11.63 + 0.8128*s)::numeric, 2), 'circumference_mm', round((pi()*(11.63 + 0.8128*s))::numeric, 1)) ORDER BY s)
FROM generate_series(4.0, 15.0, 0.5) s;

CREATE TABLE public.bench_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path text NOT NULL,
  confirmed_size numeric NOT NULL CHECK (confirmed_size BETWEEN 3 AND 16),
  finger text NOT NULL CHECK (finger IN ('index','middle','ring')),
  hand text NOT NULL CHECK (hand IN ('left','right')),
  confirmation_method text NOT NULL CHECK (confirmation_method IN ('sizing_kit','jeweller','fitting_ring')),
  est_size numeric,
  est_low numeric,
  est_high numeric,
  error_half_sizes numeric,
  projected_width_mm numeric,
  quality_flags text[] NOT NULL DEFAULT '{}',
  chart_version integer,
  ran_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bench_photos TO authenticated;
GRANT ALL ON public.bench_photos TO service_role;
ALTER TABLE public.bench_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage bench photos" ON public.bench_photos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.data_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  link text,
  contents text,
  has_ring_sizes text NOT NULL DEFAULT 'unchecked',
  licence text NOT NULL DEFAULT 'unchecked',
  commercial_use text NOT NULL DEFAULT 'unchecked' CHECK (commercial_use IN ('yes','no','unchecked')),
  notes text,
  reviewed_by text,
  reviewed_on date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_sources TO authenticated;
GRANT ALL ON public.data_sources TO service_role;
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage data sources" ON public.data_sources FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.data_sources (name, link, contents, has_ring_sizes) VALUES
 ('FreiHAND','https://lmb.informatik.uni-freiburg.de/resources/datasets/FreihandDataset.en.html','Hand pose','no'),
 ('HanCo','https://lmb.informatik.uni-freiburg.de/resources/datasets/HanCo.en.html','Hand pose','no'),
 ('11kHands','https://wp.lancs.ac.uk/icvl/?p=968','Hand images','no'),
 ('Roboflow fingersize','https://universe.roboflow.com/fingerdetection-a4soe/fingersize','Finger images; labels unchecked','unchecked'),
 ('Roboflow Finger ring','https://universe.roboflow.com/wf5/finger-ring-yi5hc','Finger/ring images; labels unchecked','unchecked');

CREATE OR REPLACE FUNCTION public.enforce_sizing_gate()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n integer; within numeric;
BEGIN
  IF NEW.size_chart IS DISTINCT FROM OLD.size_chart THEN
    NEW.chart_version := OLD.chart_version + 1;
  END IF;
  IF NEW.size_chart IS DISTINCT FROM OLD.size_chart
     OR NEW.pass_min_share IS DISTINCT FROM OLD.pass_min_share
     OR NEW.pass_min_photos IS DISTINCT FROM OLD.pass_min_photos THEN
    NEW.show_sizes := false;
  END IF;
  IF NEW.show_sizes AND NOT OLD.show_sizes THEN
    SELECT count(*), avg(CASE WHEN error_half_sizes IS NOT NULL AND abs(error_half_sizes) <= 1 THEN 1 ELSE 0 END)
      INTO n, within FROM public.bench_photos;
    IF n < NEW.pass_min_photos OR coalesce(within,0) < NEW.pass_min_share
       OR EXISTS (SELECT 1 FROM public.bench_photos WHERE ran_at IS NULL OR chart_version IS DISTINCT FROM NEW.chart_version) THEN
      RAISE EXCEPTION 'Accuracy check has not passed: % photos, % percent within half a size', n, round(coalesce(within,0)*100);
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER sizing_gate BEFORE UPDATE ON public.sizing_settings FOR EACH ROW EXECUTE FUNCTION public.enforce_sizing_gate();

CREATE OR REPLACE FUNCTION public.bench_change_resets_gate()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.sizing_settings SET show_sizes = false WHERE show_sizes;
  RETURN NULL;
END $$;
CREATE TRIGGER bench_insert_resets_gate AFTER INSERT OR DELETE ON public.bench_photos FOR EACH ROW EXECUTE FUNCTION public.bench_change_resets_gate();
REVOKE EXECUTE ON FUNCTION public.enforce_sizing_gate() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.bench_change_resets_gate() FROM anon, authenticated, public;