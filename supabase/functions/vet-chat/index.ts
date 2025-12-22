import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Determine system prompt based on language - BRIEF responses
    let systemPrompt = "You are an agricultural advisor and veterinarian for Rwandan farming. Give BRIEF, direct advice (2-4 sentences max). Use emojis (🌾🐄🌱☀️💧⚠️✅) to clarify. Focus on crops/livestock common in Rwanda: coffee, tea, bananas, beans, cassava, maize, potatoes, dairy cattle, goats, poultry, pigs. For serious issues, recommend consulting a local expert.";
    
    if (language === 'rw') {
      systemPrompt = "Uri umujyanama w'ubuhinzi n'umuganga w'amatungo mu Rwanda. Tanga inama NGUFI, ZIHARIYE (2-4 interuro gusa). Koresha emoji (🌾🐄🌱☀️💧⚠️✅). Ibanze ku bihingwa n'amatungo byo mu Rwanda: ikawa, icyayi, ibitoki, ibishyimbo, imyumbati, ibigori, ibirayi, inka, ihene, inkoko, ingurube. Niba ari ikibazo gikomeye, saba ko baganira n'umujyanama bari hafi.";
    } else if (language === 'fr') {
      systemPrompt = "Vous êtes conseiller agricole et vétérinaire pour l'agriculture rwandaise. Donnez des conseils BREFS et directs (2-4 phrases max). Utilisez des emojis (🌾🐄🌱☀️💧⚠️✅). Concentrez-vous sur les cultures/bétail rwandais: café, thé, bananes, haricots, manioc, maïs, pommes de terre, bovins, chèvres, volaille, porcs. Pour les problèmes graves, recommandez un expert local.";
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
            role: "system",
            content: systemPrompt
          },
          ...messages,
        ],
        stream: true,
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

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
