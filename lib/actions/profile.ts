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

  // 4. Map Role
  const prismalRole: Role = validated.role === 'healthcare' 
    ? Role.HEALTHCARE_PROFESSIONAL 
    : Role.ENGINEER

  // 5. Update Database
  try {
    await prisma.user.upsert({
      where: { email: user.email! },
      update: {
        name: validated.fullName,
        institution: validated.institution,
        role: prismalRole,
        city: city,
        country: country,
        expertise: expertiseArray,
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
      }
    })

    return { success: true }
  } catch (error) {
    console.error("Profile update error:", error)
    throw new Error("Failed to update profile in database")
  }
}
