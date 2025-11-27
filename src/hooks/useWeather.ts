import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WeatherData {
  current: {
    temperature: number;
    condition: string;
    description: string;
    humidity: number;
    windSpeed: number;
    visibility: number;
    precipitation: number;
    feelsLike: number;
    pressure: number;
    icon: string;
  };
  forecast: Array<{
    day: string;
    date: string;
    high: number;
    low: number;
    condition: string;
    description: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    precipitation: number;
  }>;
  location: {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  alerts: boolean;
}

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: functionError } = await supabase.functions.invoke('weather-service', {
        body: { latitude, longitude }
      });

      if (functionError) throw functionError;
      setWeather(data);
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          console.error('Geolocation error:', err);
          // Fallback to Kigali coordinates
          fetchWeather(-1.9536, 30.0606);
        }
      );
    } else {
      // Fallback to Kigali coordinates
      fetchWeather(-1.9536, 30.0606);
    }
  }, []);

  return { weather, loading, error, refetch: fetchWeather };
};
