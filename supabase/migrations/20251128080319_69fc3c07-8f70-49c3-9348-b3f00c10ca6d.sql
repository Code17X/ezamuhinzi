-- Fix search path for trigger functions
CREATE OR REPLACE FUNCTION public.record_price_history()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.price_history (market_price_id, price, recorded_at)
  VALUES (NEW.id, NEW.current_price, NOW());
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_location_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;