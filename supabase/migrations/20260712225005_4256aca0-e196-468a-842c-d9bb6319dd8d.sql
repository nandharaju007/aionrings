
-- Drop the definer view flagged by the linter
DROP VIEW IF EXISTS public.reservation_totals;

-- Small aggregate table (single row) maintained by triggers
CREATE TABLE public.reservation_totals (
  id boolean PRIMARY KEY DEFAULT true,
  total_reservations bigint NOT NULL DEFAULT 0,
  total_rings bigint NOT NULL DEFAULT 0,
  CONSTRAINT reservation_totals_singleton CHECK (id = true)
);

GRANT SELECT ON public.reservation_totals TO anon, authenticated;
GRANT ALL ON public.reservation_totals TO service_role;

ALTER TABLE public.reservation_totals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Totals are public"
ON public.reservation_totals
FOR SELECT
USING (true);

-- Seed the single row from current data
INSERT INTO public.reservation_totals (id, total_reservations, total_rings)
SELECT true, COUNT(*)::bigint, COALESCE(SUM(quantity), 0)::bigint FROM public.reservations
ON CONFLICT (id) DO UPDATE
SET total_reservations = EXCLUDED.total_reservations,
    total_rings = EXCLUDED.total_rings;

-- Trigger function to maintain totals
CREATE OR REPLACE FUNCTION public.update_reservation_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.reservation_totals
      SET total_reservations = total_reservations + 1,
          total_rings = total_rings + COALESCE(NEW.quantity, 0)
      WHERE id = true;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.reservation_totals
      SET total_reservations = total_reservations - 1,
          total_rings = total_rings - COALESCE(OLD.quantity, 0)
      WHERE id = true;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.reservation_totals
      SET total_rings = total_rings + (COALESCE(NEW.quantity, 0) - COALESCE(OLD.quantity, 0))
      WHERE id = true;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS reservations_totals_trg ON public.reservations;
CREATE TRIGGER reservations_totals_trg
AFTER INSERT OR UPDATE OR DELETE ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.update_reservation_totals();
