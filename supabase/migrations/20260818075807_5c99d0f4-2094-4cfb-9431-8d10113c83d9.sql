ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS assigned_teacher TEXT;

UPDATE public.registrations r
SET assigned_teacher = p.display_name
FROM public.profiles p
WHERE r.assigned_teacher_user_id = p.user_id
  AND r.assigned_teacher IS NULL
  AND p.display_name IN ('Phra Manfred', 'Mohammed', 'Hannah');

CREATE INDEX IF NOT EXISTS registrations_assigned_teacher_idx
  ON public.registrations (assigned_teacher);