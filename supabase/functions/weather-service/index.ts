import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude } = await req.json();
    const apiKey = Deno.env.get('OPENWEATHER_API_KEY');

    if (!apiKey) {
      throw new Error('OpenWeather API key not configured');
    }

    // Get current weather
    const currentWeatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
    );
    const currentWeather = await currentWeatherResponse.json();

    // Get 5-day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
    );
    const forecastData = await forecastResponse.json();

    // Process forecast to get daily data
    const dailyForecast = [];
    const processedDays = new Set();

    for (const item of forecastData.list) {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toDateString();

      if (!processedDays.has(dayKey) && processedDays.size < 5) {
        processedDays.add(dayKey);
        dailyForecast.push({
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          date: dayKey,
          high: Math.round(item.main.temp_max),
          low: Math.round(item.main.temp_min),
          condition: item.weather[0].main,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          humidity: item.main.humidity,
          windSpeed: item.wind.speed,
          precipitation: item.pop * 100
        });
      }
    }

    const result = {
      current: {
        temperature: Math.round(currentWeather.main.temp),
        condition: currentWeather.weather[0].main,
        description: currentWeather.weather[0].description,
        humidity: currentWeather.main.humidity,
        windSpeed: Math.round(currentWeather.wind.speed * 3.6), // Convert m/s to km/h
        visibility: Math.round(currentWeather.visibility / 1000),
        precipitation: currentWeather.rain ? currentWeather.rain['1h'] || 0 : 0,
        feelsLike: Math.round(currentWeather.main.feels_like),
        pressure: currentWeather.main.pressure,
        icon: currentWeather.weather[0].icon
      },
      forecast: dailyForecast,
      location: {
        name: currentWeather.name,
        country: currentWeather.sys.country,
        latitude,
        longitude
      },
      alerts: currentWeather.weather[0].id >= 200 && currentWeather.weather[0].id < 700 // Severe weather codes
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in weather-service:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
