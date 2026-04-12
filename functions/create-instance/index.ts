import { createClient } from "npm:@insforge/sdk";

export default async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-ID',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const { name, phone_number } = body;
  const userId = req.headers.get("x-user-id");

  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (typeof name !== 'string' || name.trim().length === 0 || name.length > 50) {
    return new Response(JSON.stringify({ error: "Invalid instance name" }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const sanitizedName = name.trim().replace(/<[^>]*>?/gm, '');

  const insforge = createClient({
    baseUrl: Deno.env.get("INSFORGE_BASE_URL") || "",
    anonKey: Deno.env.get("SERVICE_ROLE_KEY") || ""
  });

  // Determine auth method: QR or phone pairing code
  const authMethod = phone_number && typeof phone_number === 'string' && phone_number.trim().length > 0 ? 'pairing_code' : 'qr';
  const status = authMethod === 'pairing_code' ? 'pairing_code' : 'connecting';

  // 1. Create instance record
  const { data: instance, error: insertError } = await insforge.database
    .from('whatsapp_instances')
    .insert({
      user_id: userId,
      instance_name: sanitizedName || "My Bot",
      phone_number: phone_number ? phone_number.trim().replace(/[^0-9]/g, '') : null,
      status
    })
    .select()
    .single();

  if (insertError) {
    return new Response(JSON.stringify({ error: insertError.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // 2. Signal Bot Server (Orchestrator)
  const pxxlUrl = Deno.env.get("PXXL_WEBHOOK_URL");
  const webhookSecret = Deno.env.get("BOT_WEBHOOK_SECRET");

  if (pxxlUrl) {
    try {
      await fetch(pxxlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': webhookSecret || ""
        },
        body: JSON.stringify({
          event: 'create_instance',
          data: {
            instance_id: instance.id,
            user_id: userId,
            phone_number: authMethod === 'pairing_code' ? phone_number.trim().replace(/[^0-9]/g, '') : undefined
          }
        })
      });
    } catch (e: any) {
      console.error("Failed to notify bot server:", e.message);
    }
  }

  return new Response(JSON.stringify({ success: true, instance_id: instance.id, auth_method: authMethod }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
};
