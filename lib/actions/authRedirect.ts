'use server'

import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

export async function getAuthRedirect(): Promise<string> {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return '/?error=auth_failed'
  }

  // Find user in Prisma
  let dbUser = await prisma.user.findUnique({
    where: { email: user.email! }
  })

  // If user doesn't exist in Prisma (e.g., just signed up), create them
  if (!dbUser) {
    const defaultRole = Role.HEALTHCARE_PROFESSIONAL;
    let selectedRole: Role = defaultRole;

    const metaRole = user.user_metadata?.role;
    if (metaRole === 'engineer') {
      selectedRole = Role.ENGINEER;
    } else if (metaRole === 'healthcare') {
      selectedRole = Role.HEALTHCARE_PROFESSIONAL;
    }

    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email!,
        role: selectedRole
      }
    })
  }

  // Determine redirection route based on DB role
  switch (dbUser.role) {
    case Role.ADMIN:
      return '/admin'
    case Role.ENGINEER:
      return '/engineer/dashboard'
    case Role.HEALTHCARE_PROFESSIONAL:
    default:
      return '/doctor/dashboard'
  }
}
