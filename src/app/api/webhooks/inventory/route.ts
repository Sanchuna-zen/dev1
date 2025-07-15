
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Define the schema for the incoming webhook payload
const webhookPayloadSchema = z.object({
  shop_id: z.string().uuid(),
  product_id: z.string().uuid(),
  quantity: z.number().int().min(0),
});

export async function POST(request: Request) {
  // 1. Authenticate the request
  const authHeader = request.headers.get('Authorization');
  const apiKey = authHeader?.split(' ')[1];

  if (apiKey !== process.env.WEBHOOK_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Validate the request body
  const body = await request.json();
  const validation = webhookPayloadSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ errors: validation.error.format() }, { status: 400 });
  }

  // 3. Process the webhook and update the inventory
  const supabase = createClient();
  const { shop_id, product_id, quantity } = validation.data;

  // Using upsert to either update existing inventory or create a new entry.
  // This requires a UNIQUE constraint on (shop_id, product_id) in the DB, which we have.
  const { data, error } = await supabase
    .from('inventory')
    .upsert(
      { shop_id, product_id, quantity, updated_at: new Date().toISOString() },
      { onConflict: 'shop_id,product_id' }
    )
    .select();

  if (error) {
    console.error('Webhook inventory update error:', error);
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Inventory updated successfully', data: data[0] }, { status: 200 });
}
