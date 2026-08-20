-- Änderungsprotokoll für Anmeldungen.
-- Bisher ließ sich nicht nachvollziehen, wer wann einen Status, eine
-- Lehrerzuordnung oder ein Kursdatum geändert hat.

CREATE TABLE IF NOT EXISTS public.registration_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  changed_by UUID,
  field TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT
);

CREATE INDEX IF NOT EXISTS registration_changes_changed_at_idx
  ON public.registration_changes (changed_at DESC);

ALTER TABLE public.registration_changes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin and leader can view changes" ON public.registration_changes;
CREATE POLICY "Admin and leader can view changes"
ON public.registration_changes
FOR SELECT
TO authenticated
USING (public.is_admin_or_leader(auth.uid()));

-- Schreiben passiert ausschließlich über den Trigger (SECURITY DEFINER),
-- deshalb gibt es bewusst keine INSERT-Policy.

CREATE OR REPLACE FUNCTION public.log_registration_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tracked TEXT[] := ARRAY[
    'status', 'assigned_teacher', 'room_number', 'first_name', 'last_name',
    'start_date_basic', 'end_date_basic',
    'start_date_retreat', 'end_date_retreat',
    'start_date_few', 'end_date_few'
  ];
  col TEXT;
  old_json JSONB := to_jsonb(OLD);
  new_json JSONB := to_jsonb(NEW);
BEGIN
  FOREACH col IN ARRAY tracked LOOP
    IF old_json ->> col IS DISTINCT FROM new_json ->> col THEN
      INSERT INTO public.registration_changes (registration_id, changed_by, field, old_value, new_value)
      VALUES (NEW.id, auth.uid(), col, old_json ->> col, new_json ->> col);
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS registrations_log_changes ON public.registrations;
CREATE TRIGGER registrations_log_changes
  AFTER UPDATE ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.log_registration_change();
