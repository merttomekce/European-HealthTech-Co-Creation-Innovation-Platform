'use server'

import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

type Role = 'ENGINEER' | 'HEALTHCARE_PROFESSIONAL' | 'ADMIN'

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

  // 2. Validate Input (use safeParse to avoid unhandled ZodError in production)
  const result = profileSchema.safeParse(formData)
  if (!result.success) {
    const messages = result.error.issues.map(i => i.message).join(', ')
    throw new Error(`Validation failed: ${messages}`)
  }
  const validated = result.data

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
    ? 'HEALTHCARE_PROFESSIONAL' 
    : 'ENGINEER'

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

export async function exportUserData() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error("Unauthorized")
  }

  try {
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        announcements: true,
        sentRequests: true,
        receivedRequests: true,
        notifications: true,
      }
    })

    return { success: true, data: userData }
  } catch (error) {
    console.error("Export error:", error)
    return { success: false, error: "Failed to fetch data for export" }
  }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized: Please log in again' }
  }

  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters' }
  }

  // Verify current password by attempting sign-in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  })

  if (signInError) {
    return { success: false, error: 'Current password is incorrect' }
  }

  // Update to new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  return { success: true }
}

export async function deleteAccount() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized: Please log in again' }
  }

  try {
    // 1. Log the deletion to the audit trail BEFORE deleting data
    const { logAction } = await import('@/lib/audit')
    await logAction({
      userId: user.id,
      actionType: 'ACCOUNT_DELETED',
      result: 'success',
    })

    // 2. Delete related data in the correct order (respecting FK constraints)
    // Delete time slots from user's meeting requests
    await prisma.timeSlot.deleteMany({
      where: {
        meetingRequest: {
          OR: [
            { requesterId: user.id },
            { recipientId: user.id },
          ],
        },
      },
    })

    // Delete meeting requests (sent and received)
    await prisma.meetingRequest.deleteMany({
      where: {
        OR: [
          { requesterId: user.id },
          { recipientId: user.id },
        ],
      },
    })

    // Delete announcements
    await prisma.announcement.deleteMany({
      where: { authorId: user.id },
    })

    // Delete notifications
    await prisma.notification.deleteMany({
      where: { userId: user.id },
    })

    // Delete messages
    await prisma.message.deleteMany({
      where: { senderId: user.id },
    })

    // Delete conversation participations
    await prisma.conversationParticipant.deleteMany({
      where: { userId: user.id },
    })

    // Nullify audit log references (keep logs for compliance, but remove FK)
    await prisma.auditLog.updateMany({
      where: { userId: user.id },
      data: { userId: null },
    })

    // 3. Delete the user record from the database
    await prisma.user.delete({
      where: { id: user.id },
    })

    // 4. Delete the Supabase auth user (admin API)
    // Note: Using the service role would be ideal, but signOut will invalidate the session
    await supabase.auth.signOut()

    return { success: true }
  } catch (error) {
    console.error('Account deletion error:', error)
    return { success: false, error: 'Failed to delete account. Please contact support.' }
  }
}
