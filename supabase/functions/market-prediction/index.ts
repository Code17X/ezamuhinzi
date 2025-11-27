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
    const { cropName, currentPrice, weather, location } = await req.json();
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('Lovable API key not configured');
    }

    const prompt = `Analyze the market for ${cropName} in ${location}, Rwanda. 
    Current price: ${currentPrice} RWF
    Current weather: ${JSON.stringify(weather)}
    
    Based on:
    - Current weather conditions and forecast
    - Seasonal patterns in Rwanda
    - Typical supply and demand factors
    - Agricultural cycles
    - Regional factors
    
    Predict:
    1. Price trend for the next 2 weeks (increasing, decreasing, stable)
    2. Percentage change estimate
    3. Key factors affecting the price
    4. Recommendations for farmers
    
    Provide practical insights for Rwandan farmers in a clear, concise way.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are an agricultural market analyst specializing in Rwanda. Provide practical, data-driven predictions for farmers.' 
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error('Failed to get market prediction');
    }

    const data = await response.json();
    const prediction = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      cropName,
      currentPrice,
      prediction,
      generatedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in market-prediction:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
