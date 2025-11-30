-- Create new services table for service providers
CREATE TABLE IF NOT EXISTS public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_name TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  service_cost TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- RLS policies for services
DROP POLICY IF EXISTS "Anyone can view services" ON public.services;
DROP POLICY IF EXISTS "Users can create their own services" ON public.services;
DROP POLICY IF EXISTS "Users can update their own services" ON public.services;
DROP POLICY IF EXISTS "Users can delete their own services" ON public.services;

CREATE POLICY "Anyone can view services"
ON public.services
FOR SELECT
USING (true);

CREATE POLICY "Users can create their own services"
ON public.services
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own services"
ON public.services
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own services"
ON public.services
FOR DELETE
USING (auth.uid() = user_id);