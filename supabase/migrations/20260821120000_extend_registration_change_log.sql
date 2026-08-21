-- Änderungsprotokoll erweitern.
--
-- Bisher wurde nur eine feste Liste von Spalten protokolliert, weshalb
-- Änderungen etwa am Geschlecht nicht auftauchten. Jetzt wird umgekehrt
-- gearbeitet: alles wird protokolliert außer ein paar technischen Spalten.
-- Damit fehlt auch bei künftigen Feldern nichts.
--
-- Außerdem werden schnell aufeinanderfolgende Änderungen am selben Feld
-- zusammengefasst, damit nicht jeder Tastendruck eine eigene Zeile erzeugt.

CREATE INDEX IF NOT EXISTS registration_changes_recent_idx
  ON public.registration_changes (registration_id, field, changed_at DESC);

CREATE OR REPLACE FUNCTION public.log_registration_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  -- Technische Spalten ohne Aussagewert für das Protokoll.
  ignored TEXT[] := ARRAY['id', 'created_at', 'consent_timestamp', 'phone_e164'];
  -- Innerhalb dieser Spanne gilt eine erneute Änderung als dieselbe Bearbeitung.
  coalesce_window CONSTANT INTERVAL := INTERVAL '2 minutes';
  col TEXT;
  old_json JSONB := to_jsonb(OLD);
  new_json JSONB := to_jsonb(NEW);
  recent_id UUID;
  recent_old TEXT;
BEGIN
  FOR col IN SELECT jsonb_object_keys(new_json) LOOP
    CONTINUE WHEN col = ANY(ignored);
    CONTINUE WHEN old_json ->> col IS NOT DISTINCT FROM new_json ->> col;

    recent_id := NULL;
    recent_old := NULL;

    SELECT id, old_value
      INTO recent_id, recent_old
      FROM public.registration_changes
     WHERE registration_id = NEW.id
       AND field = col
       AND changed_by IS NOT DISTINCT FROM auth.uid()
       AND changed_at > now() - coalesce_window
     ORDER BY changed_at DESC
     LIMIT 1;

    IF recent_id IS NULL THEN
      INSERT INTO public.registration_changes (registration_id, changed_by, field, old_value, new_value)
      VALUES (NEW.id, auth.uid(), col, old_json ->> col, new_json ->> col);
    ELSIF recent_old IS NOT DISTINCT FROM new_json ->> col THEN
      -- Wieder auf dem Ausgangswert – der Eintrag beschreibt keine Änderung mehr.
      DELETE FROM public.registration_changes WHERE id = recent_id;
    ELSE
      UPDATE public.registration_changes
         SET new_value = new_json ->> col,
             changed_at = now()
       WHERE id = recent_id;
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
