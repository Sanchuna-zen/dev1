
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Returns all products
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *   post:
 *      summary: Creates a new product
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ProductInput'
 *      responses:
 *        201:
 *          description: The created product
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Product'
 */
const productSchema = z.object({
  name: z.string().min(1, { message: 'Product name is required' }),
  description: z.string().optional(),
  category: z.string().optional(),
});

export async function GET() {
  const supabase = createClient();
  const { data: products, error } = await supabase.from('products').select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const supabase = createClient();
  const body = await request.json();

  const validation = productSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ errors: validation.error.format() }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('products')
    .insert([validation.data])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data[0], { status: 201 });
}
