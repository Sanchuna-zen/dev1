
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Returns all inventory items
 *     responses:
 *       200:
 *         description: A list of inventory items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Inventory'
 *   post:
 *      summary: Creates a new inventory item
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/InventoryInput'
 *      responses:
 *        201:
 *          description: The created inventory item
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Inventory'
 */
const inventorySchema = z.object({
  shop_id: z.string().uuid({ message: "Valid shop ID is required" }),
  product_id: z.string().uuid({ message: "Valid product ID is required" }),
  quantity: z.number().int().min(0, { message: "Quantity must be a positive integer" }),
  price: z.number().positive({ message: "Price must be a positive number" }),
});

export async function GET() {
  const supabase = createClient();
  const { data: inventory, error } = await supabase.from('inventory').select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(inventory);
}

export async function POST(request: Request) {
  const supabase = createClient();
  const body = await request.json();

  const validation = inventorySchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ errors: validation.error.format() }, { status: 400 });
  }

  // RLS policy ensures that the user is the owner of the shop
  const { data, error } = await supabase
    .from('inventory')
    .insert([validation.data])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data[0], { status: 201 });
}
