-- Create industries table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.industries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on industries if not already enabled
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies for industries to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view industries" ON public.industries;
DROP POLICY IF EXISTS "Admins can manage industries" ON public.industries;

CREATE POLICY "Anyone can view industries"
ON public.industries
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage industries"
ON public.industries
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);