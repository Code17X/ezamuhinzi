-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'veterinary', 'farmer');

-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
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
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create market prices table for real price management
CREATE TABLE public.market_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  product_name_kinyarwanda TEXT NOT NULL,
  category TEXT NOT NULL,
  current_price NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  location TEXT NOT NULL,
  trend TEXT NOT NULL,
  trend_percentage NUMERIC,
  price_factors TEXT[],
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view prices"
ON public.market_prices FOR SELECT
USING (true);

CREATE POLICY "Admins can manage prices"
ON public.market_prices FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create price history table
CREATE TABLE public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_price_id UUID REFERENCES public.market_prices(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view price history"
ON public.price_history FOR SELECT
USING (true);

CREATE POLICY "Admins can manage price history"
ON public.price_history FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger to create price history on price update
CREATE OR REPLACE FUNCTION public.record_price_history()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.price_history (market_price_id, price, recorded_at)
  VALUES (NEW.id, NEW.current_price, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_price_update
  AFTER INSERT OR UPDATE OF current_price ON public.market_prices
  FOR EACH ROW
  EXECUTE FUNCTION public.record_price_history();

-- Create veterinary applications table
CREATE TABLE public.veterinary_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  phone TEXT NOT NULL,
  services TEXT[] NOT NULL,
  license_number TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.veterinary_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own applications"
ON public.veterinary_applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own applications"
ON public.veterinary_applications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
ON public.veterinary_applications FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update applications"
ON public.veterinary_applications FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Add verified flag and user link to agricultural_locations
ALTER TABLE public.agricultural_locations
ADD COLUMN user_id UUID REFERENCES auth.users(id),
ADD COLUMN verified BOOLEAN DEFAULT false,
ADD COLUMN average_rating NUMERIC DEFAULT 0,
ADD COLUMN total_ratings INTEGER DEFAULT 0;

-- Create location ratings table
CREATE TABLE public.location_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES public.agricultural_locations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (location_id, user_id)
);

ALTER TABLE public.location_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ratings"
ON public.location_ratings FOR SELECT
USING (true);

CREATE POLICY "Users can create ratings"
ON public.location_ratings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
ON public.location_ratings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
ON public.location_ratings FOR DELETE
USING (auth.uid() = user_id);

-- Function to update average rating
CREATE OR REPLACE FUNCTION public.update_location_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.agricultural_locations
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.location_ratings
      WHERE location_id = COALESCE(NEW.location_id, OLD.location_id)
    ),
    total_ratings = (
      SELECT COUNT(*)
      FROM public.location_ratings
      WHERE location_id = COALESCE(NEW.location_id, OLD.location_id)
    )
  WHERE id = COALESCE(NEW.location_id, OLD.location_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_rating_change
  AFTER INSERT OR UPDATE OR DELETE ON public.location_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_location_rating();

-- Insert sample market prices
INSERT INTO public.market_prices (product_name, product_name_kinyarwanda, category, current_price, unit, location, trend, trend_percentage, price_factors) VALUES
('Maize', 'Ibigori', 'crop', 450, 'kg', 'Kigali', 'up', 5.2, ARRAY['Ikirere cyiza cyateye imbuto nziza', 'Ibicuruzwa bike ku isoko', 'Ibiciro bya lisansi byiyongereye']),
('Beans', 'Ibishyimbo', 'crop', 850, 'kg', 'Musanze', 'stable', 0, ARRAY['Isoko rihamye', 'Imvura ihagije', 'Gutwara no kubika byoroshye']),
('Irish Potatoes', 'Ibirayi', 'crop', 350, 'kg', 'Rubavu', 'down', -3.1, ARRAY['Isarura yiyongereye', 'Ikirere cyiza cyateye umusaruro mwinshi', 'Ibiribwa bishya biri ku isoko']),
('Rice', 'Umuceri', 'crop', 1200, 'kg', 'Kigali', 'up', 8.5, ARRAY['Gutumiza ku mahanga birahenze', 'Ibicuruzwa bike mu gihugu', 'Ibiciro bya lisansi byiyongereye']),
('Dairy Cow', 'Inka y''amata', 'livestock', 800000, 'Inka', 'Nyagatare', 'stable', 0, ARRAY['Isoko rihamye', 'Ibiciro by''ibyokurisha bihamye', 'Isoko ry''amata rirakura']),
('Goat', 'Ihene', 'livestock', 45000, 'Ihene', 'Kayonza', 'up', 4.8, ARRAY['Ibikenewe byiyongereye', 'Kwita kworoshye', 'Igihe cy''amasengesho kiri hafi']),
('Pig', 'Ingurube', 'livestock', 120000, 'Ingurube', 'Huye', 'up', 6.2, ARRAY['Ibicuruzwa bike ku isoko', 'Isoko ry''inyama rirakura', 'Abahinzi bake']),
('Chicken (Layers)', 'Inkoko y''amagi', 'livestock', 8000, 'Inkoko', 'Kigali', 'stable', 0, ARRAY['Isoko rihamye', 'Gutwara kworoshye', 'Isoko ry''amagi rihamye']);

-- RLS policy to allow inserting locations for veterinaries
CREATE POLICY "Veterinaries can insert locations"
ON public.agricultural_locations FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'veterinary') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Location owners can update their locations"
ON public.agricultural_locations FOR UPDATE
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));