import { createClient } from "@insforge/sdk";

export default async (req: Request) => {
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
    }
    const { name } = body;
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    if (typeof name !== 'string' || name.trim().length === 0 || name.length > 50) {
      return new Response(JSON.stringify({ error: "Invalid instance name" }), { status: 400 });
    }

    const sanitizedName = name.trim().replace(/<[^>]*>?/gm, '');

    const insforge = createClient({
      baseUrl: Deno.env.get("INSFORGE_BASE_URL") || "",
      anonKey: Deno.env.get("SERVICE_ROLE_KEY") || ""
    });

    // 1. Create instance record
    const { data: instance, error: insertError } = await insforge.database
      .from('whatsapp_instances')
      .insert({
        user_id: userId,
        instance_name: sanitizedName || "My Bot",
        status: 'connecting'
      })
      .select()
      .single();

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), { status: 500 });
    }

    // 2. Signal Pxxl Bot Container (Orchestrator) 🤖
    const pxxlUrl = Deno.env.get("PXXL_WEBHOOK_URL");
    const webhookSecret = Deno.env.get("BOT_WEBHOOK_SECRET");

    if (pxxlUrl) {
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(pxxlUrl);
        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
          throw new Error("Invalid protocol");
        }
      } catch (e: any) {
         return new Response(JSON.stringify({ error: "Invalid webhook URL configured" }), { status: 500 });
      }

      try {
        await fetch(parsedUrl.toString(), {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-Webhook-Secret': webhookSecret || ""
          },
          body: JSON.stringify({
            event: 'create_instance',
            data: {
              instance_id: instance.id,
              user_id: userId
            }
          })
        });
      } catch (e: any) {
        console.error("Failed to notify Pxxl:", e.message);
        // We continue anyway, the record is created. 🛶🌊
      }
    }

    return new Response(JSON.stringify({ success: true, instance_id: instance.id }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
