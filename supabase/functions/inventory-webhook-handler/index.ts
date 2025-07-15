
import { serve } from 'https/deno.land/std@0.177.0/http/server.ts'

const EXTERNAL_WEBHOOK_URL = Deno.env.get('EXTERNAL_WEBHOOK_URL')
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET')
const MAX_RETRIES = 5;
const INITIAL_BACKOFF_MS = 1000;

async function sendWithRetry(payload: any, attempt = 1) {
  try {
    const response = await fetch(EXTERNAL_WEBHOOK_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WEBHOOK_SECRET}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log(`Webhook sent successfully on attempt ${attempt}`);
      return {
        message: `Webhook sent successfully on attempt ${attempt}`,
      };
    } 

    console.error(`Webhook failed on attempt ${attempt} with status: ${response.status}`);
    if (attempt < MAX_RETRIES) {
        const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
        console.log(`Retrying in ${backoff}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        return await sendWithRetry(payload, attempt + 1);
    } else {
        throw new Error(`Webhook failed after ${MAX_RETRIES} attempts.`);
    }

  } catch (error) {
    console.error(`Error sending webhook on attempt ${attempt}:`, error);
    if (attempt < MAX_RETRIES) {
        const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
        console.log(`Retrying in ${backoff}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        return await sendWithRetry(payload, attempt + 1);
    } else {
        throw new Error(`Webhook failed after ${MAX_RETRIES} attempts. Final error: ${error.message}`);
    }
  }
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } })
  }

  try {
    const payload = await req.json()

    // Do not wait for the retry logic to complete to respond to the trigger.
    // This prevents holding the database transaction open.
    sendWithRetry(payload.record);

    return new Response(JSON.stringify({ message: 'Webhook trigger accepted.' }), { status: 202, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(String(err?.message ?? err), { status: 500 })
  }
})
