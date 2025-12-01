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
    const body = await req.json();
    const cropName = body.cropName || body.item;
    const currentPrice = body.currentPrice;
    const weather = body.weather || {};
    const location = body.location || 'Rwanda';
    
    console.log('Market prediction request:', { cropName, currentPrice, location });
    
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('Lovable API key not configured');
    }

    const prompt = `Tanga isesengura rigufi mu Kinyarwanda ku biciro bya ${cropName} i ${location}, mu Rwanda.
    Igiciro kiriho: ${currentPrice} RWF
    Ikirere kiriho: ${JSON.stringify(weather)}
    
    Tanga raporo ngufi y'amagambo 50-80 gusa arimo:
    1. Icyerekezo cy'igiciro mu byumweru 2 biri imbere (kiziyongera/kizamanuka/kizahora)
    2. Ijanisha ry'impinduka (%)
    3. Impamvu 2-3 z'ingenzi ziterwa n'igiciro
    4. Inama imwe ku bahinzi
    
    NTUGIRE UBUREBURE - amagambo 50-80 gusa mu Kinyarwanda!`;

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
            content: 'Uri umushakashatsi w\'isoko ry\'ubuhinzi mu Rwanda. Tanga raporo ngufi cyane (amagambo 50-80 gusa) mu Kinyarwanda y\'isesengura ry\'ibiciro. Ntugire uburebure - kora raporo ngufi kandi ifite akamaro.' 
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
