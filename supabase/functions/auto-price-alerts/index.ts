import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all market prices with significant trends
    const { data: prices, error: pricesError } = await supabase
      .from('market_prices')
      .select('*')
      .or('trend_percentage.gt.5,trend_percentage.lt.-5');

    if (pricesError) throw pricesError;

    if (!prices || prices.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No significant price changes',
        checked: true 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch users with SMS alerts enabled
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('phone_number')
      .eq('sms_alerts_enabled', true)
      .not('phone_number', 'is', null);

    if (usersError) throw usersError;

    if (!users || users.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No users to alert',
        checked: true 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get weather for predictions
    const { data: weatherData } = await supabase.functions.invoke('weather-service', {
      body: { latitude: -1.9536, longitude: 30.0606 }
    });

    // Create alert message with AI predictions
    let alertMessage = "📊 IMPINDUKA Z'IBICIRO - Eza Muhizi:\n\n";
    
    for (const price of prices.slice(0, 3)) { // Top 3 changes
      const trend = price.trend_percentage > 0 ? '📈' : '📉';
      const change = price.trend_percentage > 0 ? 'Kiziyongera' : 'Kizamanuka';
      
      alertMessage += `${trend} ${price.product_name_kinyarwanda}\n`;
      alertMessage += `${price.current_price.toLocaleString()} RWF (${change} ${Math.abs(price.trend_percentage)}%)\n`;
      
      // Get AI prediction for this item
      try {
        const { data: predictionData } = await supabase.functions.invoke('market-prediction', {
          body: {
            cropName: price.product_name_kinyarwanda,
            currentPrice: price.current_price,
            weather: weatherData?.current || {},
            location: price.location
          }
        });
        
        if (predictionData?.prediction) {
          // Take first 100 chars of prediction
          const shortPrediction = predictionData.prediction.substring(0, 100);
          alertMessage += `💡 ${shortPrediction}...\n\n`;
        }
      } catch (err) {
        console.error('Prediction error:', err);
      }
    }

    alertMessage += `\nReba ibindi ku: Eza Muhizi App`;

    // Send alerts via Twilio
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      throw new Error('Twilio credentials not configured');
    }

    const results = await Promise.allSettled(
      users.map(async (user) => {
        let phone = user.phone_number.trim();
        if (phone.startsWith('0')) {
          phone = '+250' + phone.substring(1);
        } else if (!phone.startsWith('+')) {
          phone = '+250' + phone;
        }

        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              To: phone,
              From: twilioPhoneNumber,
              Body: alertMessage,
            }),
          }
        );

        if (!response.ok) {
          const error = await response.text();
          console.error(`Failed to send SMS to ${phone}:`, error);
          throw new Error(error);
        }

        return response.json();
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Price alerts sent: ${successful} successful, ${failed} failed`);

    return new Response(JSON.stringify({ 
      message: 'Price alerts processed',
      successful,
      failed,
      totalUsers: users.length,
      priceChanges: prices.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in auto-price-alerts:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
