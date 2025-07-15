
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

/**
 * @swagger
 * /api/shops:
 *   get:
 *     summary: Returns all shops
 *     responses:
 *       200:
 *         description: A list of shops
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Shop'
 *   post:
 *      summary: Creates a new shop
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ShopInput'
 *      responses:
 *        201:
 *          description: The created shop
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Shop'
 */
const shopSchema = z.object({
  name: z.string().min(1, { message: 'Shop name is required' }),
  address: z.string().optional(),
});

export async function GET() {
  const supabase = createClient();
  const { data: shops, error } = await supabase.from('shops').select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(shops);
}

export async function POST(request: Request) {
  const supabase = createClient();

  // Check for authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validation = shopSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ errors: validation.error.format() }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('shops')
    .insert([{ ...validation.data, owner_id: user.id }])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data[0], { status: 201 });
}
