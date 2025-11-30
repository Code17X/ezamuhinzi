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
    const { productTitle, price, location, category } = await req.json();
    
    console.log('Sending marketplace alert:', { productTitle, price, location, category });
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all users with SMS alerts enabled
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('phone_number, full_name')
      .eq('sms_alerts_enabled', true)
      .not('phone_number', 'is', null);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    if (!users || users.length === 0) {
      console.log('No users with SMS alerts enabled');
      return new Response(JSON.stringify({ message: 'No users to notify' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${users.length} users to notify`);

    // Twilio credentials
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !twilioPhone) {
      throw new Error('Twilio credentials not configured');
    }

    // Translate category to Kinyarwanda
    const categoryMap: { [key: string]: string } = {
      'crop': 'Ibihingwa',
      'livestock': 'Amatungo',
      'equipment': 'Ibikoresho',
      'other': 'Ibindi'
    };

    const categoryKinyarwanda = categoryMap[category] || category;

    // Create SMS message in Kinyarwanda
    const message = `EZA MUHIZI - IBICURUZWA BISHYA!\n\n${productTitle}\nIcyiciro: ${categoryKinyarwanda}\nIgiciro: ${price} RWF\nAho: ${location}\n\nReba kuri Tanga Akazi kugira ngo ubone ibisobanuro byinshi.`;

    // Send SMS to all eligible users
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = btoa(`${accountSid}:${authToken}`);
    
    const results = await Promise.allSettled(
      users.map(async (user) => {
        try {
          const response = await fetch(twilioUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              To: user.phone_number,
              From: twilioPhone,
              Body: message,
            }),
          });

          if (!response.ok) {
            const error = await response.text();
            console.error(`Failed to send SMS to ${user.phone_number}:`, error);
            return { success: false, phone: user.phone_number, error };
          }

          const result = await response.json();
          console.log(`SMS sent successfully to ${user.phone_number}:`, result.sid);
          return { success: true, phone: user.phone_number, sid: result.sid };
        } catch (error) {
          console.error(`Error sending SMS to ${user.phone_number}:`, error);
          return { success: false, phone: user.phone_number, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    console.log(`Marketplace alerts sent: ${successful} successful, ${failed} failed`);

    return new Response(JSON.stringify({ 
      success: true, 
      sent: successful,
      failed: failed,
      total: users.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-marketplace-alert:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
