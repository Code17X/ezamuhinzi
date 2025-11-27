-- Create marketplace listings table
CREATE TABLE public.marketplace_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  quantity TEXT,
  location TEXT NOT NULL,
  image_url TEXT,
  contact_phone TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active listings" 
ON public.marketplace_listings 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Users can create their own listings" 
ON public.marketplace_listings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings" 
ON public.marketplace_listings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings" 
ON public.marketplace_listings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for timestamps
CREATE TRIGGER update_marketplace_listings_updated_at
BEFORE UPDATE ON public.marketplace_listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create agricultural locations table for maps
CREATE TABLE public.agricultural_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'veterinary', 'market', 'cooperative', 'rab_office'
  description TEXT,
  address TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  phone TEXT,
  services TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for locations (public viewing)
ALTER TABLE public.agricultural_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view locations" 
ON public.agricultural_locations 
FOR SELECT 
USING (true);

-- Insert sample veterinary and agricultural locations in Rwanda
INSERT INTO public.agricultural_locations (name, type, description, address, latitude, longitude, phone, services) VALUES
('RAB Kigali Office', 'rab_office', 'Ikigo cy''Ubushakashatsi mu Buhinzi n''Ubworozi', 'KN 3 Ave, Kigali', -1.9536, 30.0906, '+250788123456', ARRAY['Ubushakashatsi', 'Amahugurwa', 'Inama']),
('Veterinary Clinic Kigali', 'veterinary', 'Ivuriro ry''amatungo - Kigali', 'KG 7 Ave, Kigali', -1.9447, 30.0895, '+250788234567', ARRAY['Ubuvuzi', 'Gukingira', 'Ubujyanama']),
('Kimironko Market', 'market', 'Isoko Nini rya Kimironko', 'Kimironko, Kigali', -1.9350, 30.1260, '+250788345678', ARRAY['Ibihingwa', 'Amatungo', 'Ifumbire']),
('Musanze Veterinary', 'veterinary', 'Ivuriro ry''amatungo - Musanze', 'Musanze Town', -1.4989, 29.6359, '+250788456789', ARRAY['Ubuvuzi', 'Gukingira', 'Imiti']),
('Huye Farmers Cooperative', 'cooperative', 'Koperative y''Abahinzi - Huye', 'Huye District', -2.5965, 29.7389, '+250788567890', ARRAY['Isoko', 'Ifumbire', 'Amahugurwa']),
('Rubavu Market', 'market', 'Isoko rya Rubavu', 'Rubavu Town', -1.6778, 29.2667, '+250788678901', ARRAY['Ibihingwa', 'Ibirayi', 'Ibitoki']),
('Nyagatare Veterinary Center', 'veterinary', 'Ikigo cy''Ubuvuzi bw''Amatungo - Nyagatare', 'Nyagatare Town', -1.2987, 30.3237, '+250788789012', ARRAY['Inka', 'Ihene', 'Gukingira']),
('Rwamagana Agricultural Center', 'cooperative', 'Ikigo cy''Ubuhinzi - Rwamagana', 'Rwamagana Town', -1.9486, 30.4347, '+250788890123', ARRAY['Amahugurwa', 'Imbuto', 'Ifumbire']);