import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Uri umuhanga mu buhinzi mu Rwanda. Suzuma iyi shusho y'igihingwa/imbuto/imboga kandi umenye indwara, udukoko, cyangwa ibibazo by'ubuzima. Tanga ibisubizo mu Kinyarwanda gusa:\n\n1. **Ubwoko bw'igihingwa**: Menya igihingwa (ikawa, icyayi, umuneke, ibishyimbo, imyumbati, ibigori, ibirayi, inyanya, nibindi)\n2. **Indwara cyangwa udukoko**: Ni iki kibangamiye igihingwa?\n3. **Urwego rw'akaga**: Andika ko ari gito/rwo hagati/rukomeye\n4. **Ubuvuzi**: Intambwe zigezweho zo gukiza ikibazo\n5. **Kwirinda**: Inama zo kwirinda iki kibazo mu gihe kizaza\n\nTanga igisubizo cyoroshye, gifite akamaro, mu Kinyarwanda gusa nta cyongereza."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;

    // Save to database
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.from('crop_diagnoses').insert({
          user_id: user.id,
          image_url: imageUrl,
          diagnosis: analysis,
          severity: analysis.toLowerCase().includes('severe') ? 'severe' : 
                   analysis.toLowerCase().includes('moderate') ? 'moderate' : 'mild'
        });
      }
    }

    return new Response(
      JSON.stringify({ analysis }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
