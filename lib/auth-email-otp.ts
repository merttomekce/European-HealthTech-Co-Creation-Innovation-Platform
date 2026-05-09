export async function sendEmailVerificationCode(supabase: any, email: string) {
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) {
    throw new Error('Email is required.')
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      shouldCreateUser: true,
    },
  })

  if (error) {
    throw error
  }

  return normalizedEmail
}

export async function verifyEmailCode(supabase: any, email: string, token: string) {
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) {
    throw new Error('Email is required.')
  }

  const code = token.trim()
  if (!code) {
    throw new Error('Verification code is required.')
  }

  const { error } = await supabase.auth.verifyOtp({
    email: normalizedEmail,
    token: code,
    type: 'email',
  })

  if (error) {
    throw error
  }

  return normalizedEmail
}
