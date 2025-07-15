import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

/**
 * @swagger
 * /api/inventory/{id}:
 *   get:
 *     summary: Returns a single inventory item
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single inventory item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inventory'
 *   put:
 *     summary: Updates an inventory item
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InventoryUpdate'
 *     responses:
 *       200:
 *         description: The updated inventory item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inventory'
 *   delete:
 *     summary: Deletes an inventory item
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: No content
 */

const inventoryUpdateSchema = z.object({
  quantity: z.number().int().min(0).optional(),
  price: z.number().positive().optional(),
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: inventory, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
  }

  return NextResponse.json(inventory);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const body = await request.json();

  const validation = inventoryUpdateSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ errors: validation.error.format() }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('inventory')
    .update(validation.data)
    .eq('id', params.id)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data[0]);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();

  const { error } = await supabase.from('inventory').delete().eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
