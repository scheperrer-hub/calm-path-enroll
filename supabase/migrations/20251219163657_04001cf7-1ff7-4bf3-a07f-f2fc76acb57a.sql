-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'leader', 'teacher');

-- Create status enum for registrations
CREATE TYPE public.registration_status AS ENUM ('new', 'in_review', 'need_info', 'confirmed', 'done', 'archived');

-- Create report language enum
CREATE TYPE public.report_language AS ENUM ('de', 'en');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create registrations table
CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Personal info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  
  -- Address
  address_street TEXT NOT NULL,
  address_house_number TEXT NOT NULL,
  address_zip TEXT NOT NULL,
  address_city TEXT NOT NULL,
  address_country TEXT NOT NULL,
  
  -- Vipassana experience
  vip_basic_when TEXT,
  vip_basic_where TEXT,
  vip_basic_teacher TEXT,
  vip_other_experience TEXT,
  report_language report_language NOT NULL DEFAULT 'de',
  
  -- Course selection
  course_basic BOOLEAN DEFAULT false,
  course_retreat BOOLEAN DEFAULT false,
  course_few_days BOOLEAN DEFAULT false,
  
  -- Course dates
  start_date_basic DATE,
  end_date_basic DATE,
  start_date_retreat DATE,
  end_date_retreat DATE,
  start_date_few DATE,
  end_date_few DATE,
  
  -- Additional
  room_number TEXT,
  additional_info TEXT,
  
  -- Status and assignment
  status registration_status NOT NULL DEFAULT 'new',
  assigned_teacher_user_id UUID REFERENCES auth.users(id),
  
  -- Consent
  consent_privacy BOOLEAN NOT NULL DEFAULT false,
  consent_timestamp TIMESTAMP WITH TIME ZONE
);

-- Create notes table
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES public.registrations(id) ON DELETE CASCADE NOT NULL,
  author_user_id UUID REFERENCES auth.users(id) NOT NULL,
  note_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents recursive RLS issues)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is admin or leader
CREATE OR REPLACE FUNCTION public.is_admin_or_leader(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'leader')
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin_or_leader(auth.uid()));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- RLS Policies for registrations
-- Public can INSERT (anonymous registration)
CREATE POLICY "Anyone can submit registration"
ON public.registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Admin and leader can see all
CREATE POLICY "Admin and leader can view all registrations"
ON public.registrations
FOR SELECT
TO authenticated
USING (public.is_admin_or_leader(auth.uid()));

-- Teacher can only see their assigned registrations
CREATE POLICY "Teacher can view assigned registrations"
ON public.registrations
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'teacher') 
  AND assigned_teacher_user_id = auth.uid()
);

-- Admin and leader can update all
CREATE POLICY "Admin and leader can update registrations"
ON public.registrations
FOR UPDATE
TO authenticated
USING (public.is_admin_or_leader(auth.uid()));

-- Teacher can update their assigned registrations
CREATE POLICY "Teacher can update assigned registrations"
ON public.registrations
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'teacher') 
  AND assigned_teacher_user_id = auth.uid()
);

-- Admin can delete
CREATE POLICY "Admin can delete registrations"
ON public.registrations
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for notes
CREATE POLICY "Authenticated users can view notes"
ON public.notes
FOR SELECT
TO authenticated
USING (
  public.is_admin_or_leader(auth.uid()) 
  OR (
    public.has_role(auth.uid(), 'teacher') 
    AND EXISTS (
      SELECT 1 FROM public.registrations r 
      WHERE r.id = registration_id 
      AND r.assigned_teacher_user_id = auth.uid()
    )
  )
);

CREATE POLICY "Authenticated users can create notes"
ON public.notes
FOR INSERT
TO authenticated
WITH CHECK (author_user_id = auth.uid());

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'display_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();