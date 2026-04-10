import { createClient } from "@insforge/sdk";

export default async (req: Request) => {
  try {
    const secret = req.headers.get("x-webhook-secret");
    const ourSecret = Deno.env.get("BOT_WEBHOOK_SECRET");
    
    if (secret !== ourSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { instance_id, event, data, user_id } = await req.json();

    if (!instance_id || typeof instance_id !== 'string') {
       return new Response(JSON.stringify({ error: "Missing or invalid instance_id" }), { status: 400 });
    }

    if (typeof event !== 'string' || !['status', 'logs'].includes(event)) {
       return new Response(JSON.stringify({ error: "Invalid event type" }), { status: 400 });
    }

    if (!data || typeof data !== 'object') {
       return new Response(JSON.stringify({ error: "Invalid data payload" }), { status: 400 });
    }

    const insforge = createClient({
      baseUrl: Deno.env.get("INSFORGE_BASE_URL") || "",
      anonKey: Deno.env.get("SERVICE_ROLE_KEY") || ""
    });

    // 1. Process Event 🔄
    if (event === 'status') {
      await insforge.database
        .from('whatsapp_instances')
        .update({ 
          status: data.status, 
          phone_number: data.phone_number,
          last_connected_at: data.status === 'connected' ? new Date().toISOString() : undefined
        })
        .eq('id', instance_id);
    } 
    else if (event === 'logs') {
      await insforge.database.from('bot_logs').insert({
        user_id,
        instance_id,
        level: data.level || 'info',
        source: data.source || 'bot',
        message: data.message,
        metadata: data.metadata || {}
      });
    }

    // 2. Broadcast to Realtime Channel 🛰️ 🌊
    await insforge.realtime.channel(`instance:${instance_id}`).send('broadcast', {
      event,
      data
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
