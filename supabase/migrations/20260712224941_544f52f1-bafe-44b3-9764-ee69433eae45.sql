
-- 1) Drop overly-permissive INSERT policy; edge function uses service_role and bypasses RLS
DROP POLICY IF EXISTS "Anyone can create a reservation" ON public.reservations;
REVOKE INSERT ON public.reservations FROM anon, authenticated;

-- 2) Replace SECURITY DEFINER function with a view exposing only aggregates
DROP FUNCTION IF EXISTS public.reservation_totals();

CREATE OR REPLACE VIEW public.reservation_totals
WITH (security_invoker = false) AS
SELECT
  COUNT(*)::bigint AS total_reservations,
  COALESCE(SUM(quantity), 0)::bigint AS total_rings
FROM public.reservations;

GRANT SELECT ON public.reservation_totals TO anon, authenticated;
