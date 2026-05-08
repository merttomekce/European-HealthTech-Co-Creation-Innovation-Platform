import { NextResponse } from 'next/server';
import { resolveAuthFlow } from '@/lib/actions/authFlow';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email : '';
    const result = await resolveAuthFlow(email);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Auth Resolve API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Could not resolve auth flow.' },
      { status: 400 },
    );
  }
}
