
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

/**
 * @swagger
 * /api/shops/{id}:
 *   get:
 *     summary: Returns a single shop
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single shop
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shop'
 *   put:
 *     summary: Updates a shop
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
 *             $ref: '#/components/schemas/ShopUpdate'
 *     responses:
 *       200:
 *         description: The updated shop
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shop'
 *   delete:
 *     summary: Deletes a shop
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
const shopUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().optional(),
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: shop, error } = await supabase
    .from('shops')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
  }

  return NextResponse.json(shop);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const body = await request.json();

  const validation = shopUpdateSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ errors: validation.error.format() }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('shops')
    .update(validation.data)
    .eq('id', params.id)
    .select();

  if (error) {
    // RLS will prevent unauthorized updates, returning a different error
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data[0]);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();

  const { error } = await supabase.from('shops').delete().eq('id', params.id);

  if (error) {
    // RLS will prevent unauthorized deletions
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
