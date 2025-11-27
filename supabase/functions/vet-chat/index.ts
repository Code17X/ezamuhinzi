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

    // Determine system prompt based on language
    let systemPrompt = "You are an experienced agricultural advisor and veterinarian specializing in Rwandan farming, livestock, and crop management. Provide direct, practical advice about farming, animal health, crop diseases, soil management, weather considerations, and sustainable farming practices relevant to Rwanda. Be concise and actionable. Focus specifically on crops and livestock common in Rwanda such as coffee, tea, bananas, beans, cassava, maize, potatoes, dairy cattle, goats, poultry, and pigs. If the issue is serious, recommend consulting a local agricultural extension officer or veterinarian.";
    
    if (language === 'rw') {
      systemPrompt = "Uri umujyanama w'ubuhinzi n'umuganga w'amatungo ufite uburambe mu buhinzi bwo mu Rwanda, ubworozi, n'imicungire y'ibihingwa. Tanga inama zihariye, zifatika ku buhinzi, ubuzima bw'amatungo, indwara z'ibihingwa, imicungire y'ubutaka, ikirere, n'ubuhinzi burambye mu Rwanda. Vuga muri make kandi byoroshye gukurikiza. Andika mu Kinyarwanda gusa. Ibanze cyane ku bihingwa n'amatungo bikunze mu Rwanda nka: ikawa, icyayi, ibitoki, ibishyimbo, imyumbati, ibigori, ibirayi, inka, ihene, inkoko, n'ingurube. Niba ikibazo gikomeye, saba ko baganira n'umujyanama w'ubuhinzi cyangwa umuganga w'amatungo bari hafi.";
    } else if (language === 'fr') {
      systemPrompt = "Vous êtes un conseiller agricole expérimenté et vétérinaire spécialisé dans l'agriculture rwandaise, l'élevage et la gestion des cultures. Fournissez des conseils directs et pratiques sur l'agriculture, la santé animale, les maladies des cultures, la gestion des sols, les considérations météorologiques et les pratiques agricoles durables pertinentes pour le Rwanda. Soyez concis et orienté action. Concentrez-vous spécifiquement sur les cultures et le bétail courants au Rwanda tels que le café, le thé, les bananes, les haricots, le manioc, le maïs, les pommes de terre, les bovins laitiers, les chèvres, la volaille et les porcs. Si le problème est grave, recommandez de consulter un agent de vulgarisation agricole local ou un vétérinaire.";
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
