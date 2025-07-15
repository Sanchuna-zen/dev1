import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      // Handle error, e.g., redirect to an error page or deny access
    }

    // Example: Protect admin routes
    if (req.nextUrl.pathname.startsWith('/admin') && profile?.role !== 'admin') {
      // Redirect to a forbidden page or home page
      return NextResponse.redirect(new URL('/forbidden', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)´'],
};
