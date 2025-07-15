
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const ticketSchema = z.object({
  subject: z.string().min(5, { message: 'Subject must be at least 5 characters long' }),
  message: z.string().min(20, { message: 'Message must be at least 20 characters long' }),
});

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validation = ticketSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ errors: validation.error.format() }, { status: 400 });
  }

  const { subject, message } = validation.data;

  const { data, error } = await supabase
    .from('support_tickets')
    .insert([{ 
        user_id: user.id,
        subject,
        message,
        status: 'open'
    }])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data[0], { status: 201 });
}
