-- Add factory/industry type to agricultural_locations
-- Add more location options to market_prices

-- First, let's add some sample factory/industry locations
INSERT INTO agricultural_locations (name, type, description, address, latitude, longitude, phone, services, verified, user_id)
VALUES 
  ('Ingabo Factory', 'factory', 'Uruganda rutunganya ibirayi', 'Musanze, Rwanda', -1.4985, 29.6333, '+250788123456', ARRAY['Gutunganya Ibirayi', 'Gucunga Ibirayi'], true, NULL),
  ('Sorwathe Tea Factory', 'factory', 'Uruganda rw''icyayi', 'Kinihira, Rwanda', -1.7833, 30.1167, '+250788234567', ARRAY['Gutunganya Icyayi', 'Gucunga Icyayi'], true, NULL),
  ('Mimuri Coffee Factory', 'factory', 'Uruganda rw''ikawa', 'Huye, Rwanda', -2.5972, 29.7389, '+250788345678', ARRAY['Gutunganya Ikawa', 'Gucunga Ikawa'], true, NULL),
  ('NAEB Processing Center', 'industry', 'Ikigo cy''ubuhinzi', 'Kigali, Rwanda', -1.9536, 30.0606, '+250788456789', ARRAY['Gutunganya Ibihingwa', 'Ubujyanama'], true, NULL),
  ('Maize Milling Industry', 'industry', 'Uruganda rusya ibigori', 'Rwamagana, Rwanda', -1.9494, 30.4347, '+250788567890', ARRAY['Gusya Ibigori', 'Gutunganya Ibigori'], true, NULL);