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

    // Get current weather for Kigali
    const { data: weatherData, error: weatherError } = await supabase.functions.invoke('weather-service', {
      body: { latitude: -1.9536, longitude: 30.0606 }
    });

    if (weatherError) throw weatherError;

    const weather = weatherData;
    const shouldAlert = 
      weather.current.temperature > 30 || 
      weather.current.temperature < 15 ||
      weather.current.precipitation > 70 ||
      weather.current.windSpeed > 50 ||
      weather.alerts;

    if (!shouldAlert) {
      return new Response(JSON.stringify({ 
        message: 'No weather alerts needed',
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

    // Create alert message in Kinyarwanda
    let alertMessage = "⚠️ IBURIRA RY'IKIRERE - Eza Muhizi:\n\n";
    
    if (weather.current.temperature > 30) {
      alertMessage += `🌡️ Ubushyuhe bwinshi: ${weather.current.temperature}°C. Sarura ibihingwa cyangwa vomera.\n`;
    }
    if (weather.current.temperature < 15) {
      alertMessage += `❄️ Ubukonje bwinshi: ${weather.current.temperature}°C. Rinda ibihingwa bishaje.\n`;
    }
    if (weather.current.precipitation > 70) {
      alertMessage += `🌧️ Imvura nyinshi iteganywa: ${weather.current.precipitation}%. Tegura imiyoboro.\n`;
    }
    if (weather.current.windSpeed > 50) {
      alertMessage += `💨 Umuyaga ukomeye: ${weather.current.windSpeed} km/h. Rinda ibihingwa.\n`;
    }
    if (weather.alerts) {
      alertMessage += `⚠️ Ikirere gikomeye giteganywa! Rinda ibihingwa n'amatungo.\n`;
    }

    alertMessage += `\n${weather.location.name} • ${new Date().toLocaleDateString('rw-RW')}`;

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

    console.log(`Weather alerts sent: ${successful} successful, ${failed} failed`);

    return new Response(JSON.stringify({ 
      message: 'Weather alerts processed',
      successful,
      failed,
      totalUsers: users.length,
      alertType: 'weather'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in auto-weather-alerts:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
