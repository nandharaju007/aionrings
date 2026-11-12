DROP POLICY IF EXISTS "Totals are public" ON public.reservation_totals;
REVOKE SELECT ON public.reservation_totals FROM anon;
CREATE POLICY "Admins can view totals" ON public.reservation_totals FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));