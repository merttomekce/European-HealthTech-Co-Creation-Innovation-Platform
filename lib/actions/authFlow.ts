'use server';

import { DEMO_LOGIN } from '@/lib/demo-login';
import prisma from '@/lib/prisma';

export async function resolveAuthFlow(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error('Email is required.');
  }

  const isDemoEmail = normalizedEmail === DEMO_LOGIN.email;
  const existingUser = isDemoEmail
    ? { id: 'demo-user' }
    : await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true },
      });

  const step = existingUser ? 'password' : 'register';

  return {
    email: normalizedEmail,
    registered: Boolean(existingUser),
    nextPath: step === 'password'
      ? `/login/password?email=${encodeURIComponent(normalizedEmail)}`
      : `/auth/register?email=${encodeURIComponent(normalizedEmail)}`,
  };
}
