import { createClient } from "npm:@insforge/sdk";

export default async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { user } = await req.json();

    if (!user || typeof user !== 'object' || !user.id || typeof user.id !== 'string') {
      return new Response(JSON.stringify({ error: "Invalid user object provided" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const insforge = createClient({
      baseUrl: Deno.env.get("INSFORGE_BASE_URL") || "",
      anonKey: Deno.env.get("SERVICE_ROLE_KEY") || ""
    });

    const { data: profile, error: selectError } = await insforge.database
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      return new Response(JSON.stringify({ error: selectError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!profile) {
      const { error: insertError } = await insforge.database
        .from('profiles')
        .insert({
          user_id: user.id,
          display_name: user.email?.split('@')[0] || 'User',
          onboarding_completed: false
        });

      if (insertError) {
        return new Response(JSON.stringify({ error: insertError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({ success: true, message: "Profile initialized" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};
