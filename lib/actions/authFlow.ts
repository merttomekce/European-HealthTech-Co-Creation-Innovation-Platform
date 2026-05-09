'use server';

import { DEMO_LOGIN } from '@/lib/demo-login';
import prisma from '@/lib/prisma';

async function emailExistsInSupabaseAuth(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const rows = await prisma.$queryRaw<Array<{ found: boolean }>>`
      select exists (
        select 1
        from auth.users
        where lower(email) = ${normalizedEmail}
      ) as found
    `;

    return Boolean(rows[0]?.found);
  } catch (error) {
    console.error('Auth lookup failed', error);
    return false;
  }
}

async function profileExistsInAppDb(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    return Boolean(user);
  } catch (error) {
    console.error('Profile lookup failed', error);
    return false;
  }
}

export async function resolveAuthFlow(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error('Email is required.');
  }

  const isDemoEmail = normalizedEmail === DEMO_LOGIN.email;
  const [authUserExists, profileExists] = isDemoEmail
    ? [true, true]
    : await Promise.all([
        emailExistsInSupabaseAuth(normalizedEmail),
        profileExistsInAppDb(normalizedEmail),
      ]);

  const registered = authUserExists && profileExists;

  return {
    email: normalizedEmail,
    registered,
    nextPath: registered
      ? `/login/password?email=${encodeURIComponent(normalizedEmail)}`
      : `/auth/register?email=${encodeURIComponent(normalizedEmail)}`,
  };
}
