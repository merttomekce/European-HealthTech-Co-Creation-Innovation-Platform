import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Log successful login
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { logAction } = await import('@/lib/audit');
        await logAction({
          userId: user.id,
          actionType: 'LOGIN',
          result: 'success',
        });
      }

      if (next === '/dashboard') {
        const { getAuthRedirect } = await import('@/lib/actions/authRedirect');
        try {
          const redirectPath = await getAuthRedirect();
          return NextResponse.redirect(`${origin}${redirectPath}`);
        } catch (e) {
          return NextResponse.redirect(`${origin}${next}`);
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      console.error('Supabase Auth error in callback:', error.message);
    }
  }

  // Redirect to the login page if there's no code or an error occurred during exchange
  return NextResponse.redirect(`${origin}/?error=auth_callback_failed`);
}
