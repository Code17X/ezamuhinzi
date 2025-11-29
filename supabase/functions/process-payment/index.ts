import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, paymentMethod, amount } = await req.json();
    
    console.log('Processing payment:', { phoneNumber, paymentMethod, amount });

    // Get Flutterwave API key from environment
    const FLUTTERWAVE_SECRET_KEY = Deno.env.get('FLUTTERWAVE_SECRET_KEY');
    if (!FLUTTERWAVE_SECRET_KEY) {
      throw new Error('FLUTTERWAVE_SECRET_KEY not configured');
    }

    // Get authorization header to identify user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Initiate payment with Flutterwave
    const flutterwaveResponse = await fetch('https://api.flutterwave.com/v3/charges?type=mobile_money_rwanda', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref: `SUB-${user.id}-${Date.now()}`,
        amount: amount,
        currency: 'RWF',
        email: user.email,
        phone_number: phoneNumber,
        fullname: user.email,
      }),
    });

    const paymentData = await flutterwaveResponse.json();
    console.log('Flutterwave response:', paymentData);

    if (paymentData.status === 'success') {
      // Calculate subscription end date (30 days from now)
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      // Create or update subscription
      const { error: subError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          status: 'active',
          payment_method: paymentMethod,
          transaction_id: paymentData.data.flw_ref,
          amount: amount,
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
          auto_renew: false,
        }, {
          onConflict: 'user_id'
        });

      if (subError) {
        console.error('Error creating subscription:', subError);
        throw subError;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Payment processed successfully',
          data: paymentData.data 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      throw new Error(paymentData.message || 'Payment failed');
    }

  } catch (error) {
    console.error('Payment processing error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Payment processing failed' 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
