
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const shopProfileSchema = z.object({
  name: z.string(),
  address: z.string(),
  description: z.string().optional(),
  contact_info: z.string().optional(),
});

const inventoryItemSchema = z.object({
    product_name: z.string(),
    description: z.string().optional(),
    category: z.string().optional(),
    price: z.number(),
    quantity: z.number().int(),
});

const onboardingStatusSchema = z.object({
    step: z.enum(['profile', 'inventory']),
    data: z.any(),
});


export async function GET() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_status')
        .eq('id', user.id)
        .single();

    if (error) {
        return NextResponse.json({ error: 'Failed to fetch onboarding status' }, { status: 500 });
    }

    return NextResponse.json({ status: data?.onboarding_status });
}

export async function POST(request: Request) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = onboardingStatusSchema.safeParse(body);

    if (!validation.success) {
        return NextResponse.json({ errors: validation.error.format() }, { status: 400 });
    }

    const { step, data } = validation.data;

    if (step === 'profile') {
        const profileValidation = shopProfileSchema.safeParse(data);
        if (!profileValidation.success) {
            return NextResponse.json({ errors: profileValidation.error.format() }, { status: 400 });
        }

        // Create the shop and update the profile status
        const { data: shopData, error: shopError } = await supabase.from('shops').insert([{ ...profileValidation.data, owner_id: user.id }]).select().single();
        if (shopError) {
            return NextResponse.json({ error: shopError.message }, { status: 500 });
        }

        const { error: profileError } = await supabase.from('profiles').update({ onboarding_status: 'inventory_pending' }).eq('id', user.id);
        if (profileError) {
            return NextResponse.json({ error: profileError.message }, { status: 500 });
        }
        
        return NextResponse.json({ message: 'Profile created, proceed to inventory', shop: shopData });
    }

    if (step === 'inventory') {
        const inventoryValidation = z.array(inventoryItemSchema).safeParse(data.inventory);
        if (!inventoryValidation.success) {
            return NextResponse.json({ errors: inventoryValidation.error.format() }, { status: 400 });
        }

        // Create products and inventory records
        const productsToInsert = inventoryValidation.data.map(item => ({ name: item.product_name, description: item.description, category: item.category }));
        const { data: products, error: productsError } = await supabase.from('products').insert(productsToInsert).select();

        if (productsError) {
            return NextResponse.json({ error: productsError.message }, { status: 500 });
        }

        const inventoryToInsert = inventoryValidation.data.map((item, index) => ({
            shop_id: data.shopId,
            product_id: products[index].id,
            quantity: item.quantity,
            price: item.price,
        }));
        const { error: inventoryError } = await supabase.from('inventory').insert(inventoryToInsert);

        if (inventoryError) {
            return NextResponse.json({ error: inventoryError.message }, { status: 500 });
        }

        const { error: profileError } = await supabase.from('profiles').update({ onboarding_status: 'completed' }).eq('id', user.id);
        if (profileError) {
            return NextResponse.json({ error: profileError.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Inventory uploaded, onboarding complete' });
    }

    return NextResponse.json({ error: 'Invalid step' }, { status: 400 });
}
