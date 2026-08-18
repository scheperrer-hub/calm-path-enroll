-- Lehrer-Zuordnung als feste Namensliste statt über Benutzerkonten.
-- Die Lehrer (Phra Manfred, Mohammed, Hannah) sind keine CRM-Benutzer,
-- deshalb reicht ein Textfeld. Die bisherige Spalte assigned_teacher_user_id
-- bleibt unverändert bestehen, damit nichts verloren geht.
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS assigned_teacher TEXT;

-- Bereits über ein Benutzerkonto zugeordnete Anmeldungen übernehmen,
-- aber nur wenn der Anzeigename einem der festen Lehrer entspricht.
UPDATE public.registrations r
SET assigned_teacher = p.display_name
FROM public.profiles p
WHERE r.assigned_teacher_user_id = p.user_id
  AND r.assigned_teacher IS NULL
  AND p.display_name IN ('Phra Manfred', 'Mohammed', 'Hannah');

-- Die Übersicht gruppiert nach diesem Feld.
CREATE INDEX IF NOT EXISTS registrations_assigned_teacher_idx
  ON public.registrations (assigned_teacher);
