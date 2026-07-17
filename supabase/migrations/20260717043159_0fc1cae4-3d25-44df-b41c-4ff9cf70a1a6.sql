
CREATE TABLE public.reservation_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  changed_by uuid,
  changed_by_email text,
  field text NOT NULL,
  old_value text,
  new_value text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.reservation_audit_log TO authenticated;
GRANT ALL ON public.reservation_audit_log TO service_role;

ALTER TABLE public.reservation_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log"
  ON public.reservation_audit_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_reservation_audit_reservation ON public.reservation_audit_log(reservation_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.log_reservation_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor uuid := auth.uid();
  actor_email text;
  fields text[] := ARRAY['status','tracking_number','carrier','shipped_at','delivered_at','admin_notes'];
  f text;
  old_v text;
  new_v text;
BEGIN
  IF actor IS NOT NULL THEN
    SELECT email INTO actor_email FROM auth.users WHERE id = actor;
  END IF;

  FOREACH f IN ARRAY fields LOOP
    EXECUTE format('SELECT ($1).%I::text, ($2).%I::text', f, f)
      INTO old_v, new_v USING OLD, NEW;
    IF old_v IS DISTINCT FROM new_v THEN
      INSERT INTO public.reservation_audit_log
        (reservation_id, changed_by, changed_by_email, field, old_value, new_value)
      VALUES (NEW.id, actor, actor_email, f, old_v, new_v);
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_reservation_audit
  AFTER UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.log_reservation_changes();
