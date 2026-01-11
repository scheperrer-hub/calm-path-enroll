-- Add new fields to registrations table
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS impairments TEXT,
ADD COLUMN IF NOT EXISTS basic_course_days INTEGER,
ADD COLUMN IF NOT EXISTS mother_tongue TEXT,
ADD COLUMN IF NOT EXISTS second_language TEXT;