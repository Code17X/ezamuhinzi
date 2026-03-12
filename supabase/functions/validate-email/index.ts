const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('ZEROBOUNCE_API_KEY');
    if (!apiKey) {
      console.error('ZEROBOUNCE_API_KEY not configured');
      // Fallback: allow signup if API key missing
      return new Response(
        JSON.stringify({ valid: true, status: 'unknown', sub_status: 'api_key_missing' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch(
      `https://api.zerobounce.net/v2/validate?api_key=${apiKey}&email=${encodeURIComponent(email)}`
    );

    if (!response.ok) {
      console.error(`ZeroBounce API error: ${response.status}`);
      return new Response(
        JSON.stringify({ valid: true, status: 'unknown', sub_status: 'api_error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    // ZeroBounce statuses: valid, invalid, catch-all, unknown, spamtrap, abuse, do_not_mail
    const isValid = data.status === 'valid' || data.status === 'catch-all';
    
    return new Response(
      JSON.stringify({
        valid: isValid,
        status: data.status,
        sub_status: data.sub_status || null,
        did_you_mean: data.did_you_mean || null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Email validation error:', error);
    return new Response(
      JSON.stringify({ valid: true, status: 'unknown', sub_status: 'server_error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
