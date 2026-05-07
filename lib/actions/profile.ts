'use server'

import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'
import { z } from 'zod'

const profileSchema = z.object({
  fullName: z.string().min(2, "Name is too short"),
  institution: z.string().min(2, "Institution is required"),
  role: z.enum(['healthcare', 'engineer']),
  location: z.string().min(2, "Location is required"),
  expertise: z.string().min(2, "Please provide some expertise tags"),
  bio: z.string().max(500).optional(),
})

export async function updateProfile(formData: z.infer<typeof profileSchema>) {
  const supabase = createClient()
  
  // 1. Verify Session
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error("Unauthorized: Please log in again")
  }

  // 2. Validate Input
  const validated = profileSchema.parse(formData)

  // 3. Process Data (Splitting as per user decision)
  const [city, ...countryParts] = validated.location.split(',').map(s => s.trim())
  const country = countryParts.join(', ') || null

  const expertiseArray = validated.expertise
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0)

  const bio = validated.bio?.trim() || null

  // 4. Map Role
  const prismalRole: Role = validated.role === 'healthcare' 
    ? Role.HEALTHCARE_PROFESSIONAL 
    : Role.ENGINEER

  // 5. Update Database
  try {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email!,
        name: validated.fullName,
        institution: validated.institution,
        role: prismalRole,
        city: city,
        country: country,
        expertise: expertiseArray,
        bio,
      },
      create: {
        id: user.id, // Ensure Prisma ID matches Supabase Auth ID
        email: user.email!,
        name: validated.fullName,
        institution: validated.institution,
        role: prismalRole,
        city: city,
        country: country,
        expertise: expertiseArray,
        bio,
      }
    })

    return { success: true }
  } catch (error) {
    console.error("Profile update error:", error)
    throw new Error("Failed to update profile in database")
  }
}

export async function updateAvatar(imageUrl: string | null) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error("Unauthorized")
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { image: imageUrl }
    })
    return { success: true }
  } catch (error) {
    console.error("Avatar update error:", error)
    throw new Error("Failed to update avatar")
  }
}

export async function getAuthProfile() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    })
    
    if (!dbUser) {
       return { success: false, error: 'User not found in database' }
    }
    
    return { success: true, data: dbUser }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Failed to fetch profile' }
  }
}

export async function getNavProfile() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return {
      name: 'Welcome',
      role: 'Participant',
      initials: 'W',
    }
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, role: true, image: true }
  })

  const name = dbUser?.name || 'New User'
  const roleMap: Record<string, string> = {
    'HEALTHCARE_PROFESSIONAL': 'Healthcare Professional',
    'ENGINEER': 'Engineer / Tech Expert',
    'ADMIN': 'Admin'
  }
  
  const roleName = dbUser?.role ? roleMap[dbUser.role] : 'Participant'
  
  let initials = 'NU'
  if (dbUser?.name) {
    const parts = dbUser.name.split(' ')
    initials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : `${parts[0][0]}`
  } else if (user.email) {
    initials = user.email.substring(0, 2).toUpperCase()
  }

  return {
    name,
    role: roleName,
    initials: initials.toUpperCase(),
    image: dbUser?.image || null
  }
}

export async function getUserProfile(userId: string) {
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        institution: true,
        city: true,
        country: true,
        expertise: true,
        createdAt: true,
        bio: true,
      }
    })
    
    if (!dbUser) {
       return { success: false, error: 'User not found' }
    }
    
    return { success: true, data: dbUser }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Failed to fetch user profile' }
  }
}
