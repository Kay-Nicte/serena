import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const webhookSecret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET') ?? '';

Deno.serve(async (req) => {
  // Only accept POST
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Validate authorization header
  if (webhookSecret) {
    const auth = req.headers.get('authorization') ?? '';
    if (auth !== `Bearer ${webhookSecret}`) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  try {
    const body = await req.json();
    const event = body.event;

    if (!event) {
      return new Response('No event in payload', { status: 400 });
    }

    const eventType: string = event.type;
    const appUserId: string | undefined = event.app_user_id;
    const expirationDate: string | undefined =
      event.expiration_at_ms
        ? new Date(event.expiration_at_ms).toISOString()
        : undefined;

    if (!appUserId) {
      return new Response('No app_user_id', { status: 400 });
    }

    // Create a Supabase client with service role (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase.rpc('handle_revenuecat_webhook', {
      rc_user_id: appUserId,
      rc_event_type: eventType,
      rc_expiration_date: expirationDate ?? null,
    });

    if (error) {
      console.error('RPC error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
