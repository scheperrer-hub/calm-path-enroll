-- Add birth_year column to registrations
ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS birth_year integer;

-- Add phone_country column to store country code
ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS phone_country text;

-- Add phone_e164 column to store formatted phone number
ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS phone_e164 text;

-- Add has_basic_course column for conditional fields
ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS has_basic_course boolean DEFAULT false;

-- Add address_validated column
ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS address_validated boolean DEFAULT false;

-- Add French as report language option
ALTER TYPE public.report_language ADD VALUE IF NOT EXISTS 'fr';