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

    const prompt = `Uri umushakashatsi w'isoko ry'ubuhinzi mu Rwanda. Suzuma ibiciro bya ${cropName} i ${location} ugereranije n'ibibera muri iki gihe.

Igiciro kiriho: ${currentPrice} RWF
Ikirere: ${JSON.stringify(weather)}
Amatariki y'isoko: Ibihe by'umwaka, ibiciro bya peteroli, ingurane, ibikomoka mu mahanga

Tanga isesengura ry'ibiciro mu Kinyarwanda gusa (amagambo 80-120):

1. **Icyerekezo cy'ibiciro mu byumweru 2-3 biri imbere**: Kiziyongera, kizamanuka, cyangwa kizahora - sobanura neza impamvu (ikirere, ibihe, ingurane, ibindi)

2. **Ijanisha ry'impinduka**: Tanga ijanisha ry'impinduka mu kijana (%) ukurikije ibisobanuro bifite ishingiro

3. **Impamvu nyamukuru 3-4**: Sobanura ibintu bikomeye bigira ingaruka ku giciro (ikirere, ibicuruzwa bivuye mu mahanga, ibihe by'umwaka, ingurane)

4. **Inama z'akamaro ku bahinzi**: Tanga inama 2 z'ingenzi zo kugurisha cyangwa kubika ibicuruzwa

Tanga raporo nzima, ifite akamaro, mu Kinyarwanda gusa. Kora isesengura rishingiye ku bikoresho byose bifite ishingiro.`;

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
            content: 'Uri umushakashatsi w\'isoko ry\'ubuhinzi mu Rwanda. Tanga raporo nzima (amagambo 80-120) mu Kinyarwanda y\'isesengura ry\'ibiciro rishingiye ku bikoresho bifite ishingiro. Kora isesengura ry\'ibiciro ukurikije ikirere, amatariki y\'isoko, ingurane, n\'ibindi bigize isoko. Sobanura neza icyerekezo cy\'ibiciro n\'impamvu nyamukuru.' 
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
