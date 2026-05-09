import { createBrowserClient } from '@supabase/ssr'
import { DEMO_LOGIN, isDemoLogin } from '../demo-login'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const hasDemoSession = typeof document !== 'undefined' && document.cookie.includes('dev_bypass=true')

  const readCookie = (name: string) => {
    if (typeof document === 'undefined') return null
    const entry = document.cookie.split('; ').find((value) => value.startsWith(`${name}=`))
    return entry ? decodeURIComponent(entry.split('=').slice(1).join('=')) : null
  }

  const setCookie = (name: string, value: string, maxAge: number) => {
    if (typeof document === 'undefined') return
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`
  }

  const clearCookie = (name: string) => {
    if (typeof document === 'undefined') return
    document.cookie = `${name}=; path=/; max-age=0; samesite=lax`
  }

  const getVerifiedEmail = () => readCookie('dev_email_verified')

  const buildVerifiedUser = (email: string) => ({
    id: `dev-email:${email}`,
    email,
    user_metadata: { name: '', role: DEMO_LOGIN.role },
  })

  if (!supabaseUrl || !supabaseKey) {
    // Return a mocked client that keeps auth flow usable without credentials.
    return {
      auth: {
        getUser: async () => {
          if (hasDemoSession) {
            return {
              data: {
                user: {
                  id: 'dev-bypass-user',
                  email: DEMO_LOGIN.email,
                  user_metadata: { name: 'Demo User', role: DEMO_LOGIN.role },
                },
              },
              error: null,
            }
          }

          const verifiedEmail = getVerifiedEmail()
          return verifiedEmail
            ? ({ data: { user: buildVerifiedUser(verifiedEmail) }, error: null })
            : ({ data: { user: null }, error: null })
        },
        getSession: async () => {
          if (hasDemoSession) {
            return {
              data: {
                session: {
                  user: {
                    id: 'dev-bypass-user',
                    email: DEMO_LOGIN.email,
                    user_metadata: { name: 'Demo User', role: DEMO_LOGIN.role },
                  },
                },
              },
              error: null,
            }
          }

          const verifiedEmail = getVerifiedEmail()
          return verifiedEmail
            ? ({ data: { session: { user: buildVerifiedUser(verifiedEmail) } }, error: null })
            : ({ data: { session: null }, error: null })
        },
        signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
          if (!isDemoLogin(email, password)) {
            return { data: { user: null, session: null }, error: new Error('Invalid login credentials') }
          }

          if (typeof document !== 'undefined') {
            document.cookie = 'dev_bypass=true; path=/; max-age=86400; samesite=lax'
          }

          return {
            data: {
              user: {
                id: 'dev-bypass-user',
                email: DEMO_LOGIN.email,
                user_metadata: { name: 'Demo User', role: DEMO_LOGIN.role },
              },
              session: {
                user: {
                  id: 'dev-bypass-user',
                  email: DEMO_LOGIN.email,
                  user_metadata: { name: 'Demo User', role: DEMO_LOGIN.role },
                },
              },
            },
            error: null,
          }
        },
        signInWithOtp: async ({ email }: { email: string }) => {
          if (typeof window !== 'undefined') {
            window.sessionStorage.setItem(`healthai-otp:${email.trim().toLowerCase()}`, '123456')
          }

          return { data: { user: null, session: null }, error: null }
        },
        verifyOtp: async ({ email, token }: { email: string; token: string }) => {
          const normalizedEmail = email.trim().toLowerCase()
          const expected = typeof window !== 'undefined'
            ? window.sessionStorage.getItem(`healthai-otp:${normalizedEmail}`)
            : null

          if (!expected || expected !== token.trim()) {
            return { data: { user: null, session: null }, error: new Error('Invalid verification code') }
          }

          setCookie('dev_email_verified', normalizedEmail, 86400)

          return {
            data: {
              user: buildVerifiedUser(normalizedEmail),
              session: {
                user: buildVerifiedUser(normalizedEmail),
              },
            },
            error: null,
          }
        },
        updateUser: async () => {
          const email = getVerifiedEmail()

          if (!email && !hasDemoSession) {
            return { data: { user: null }, error: new Error('Not authenticated') }
          }

          return {
            data: { user: email ? buildVerifiedUser(email) : buildVerifiedUser(DEMO_LOGIN.email) },
            error: null,
          }
        },
        signUp: async ({ email }: { email: string; password: string }) => {
          if (typeof document !== 'undefined' && email === DEMO_LOGIN.email) {
            document.cookie = 'dev_bypass=true; path=/; max-age=86400; samesite=lax'
            return {
              data: {
                user: {
                  id: 'dev-bypass-user',
                  email,
                  user_metadata: { name: '', role: DEMO_LOGIN.role },
                },
                session: {
                  user: {
                    id: 'dev-bypass-user',
                    email,
                    user_metadata: { name: '', role: DEMO_LOGIN.role },
                  },
                },
              },
              error: null,
            }
          }

          return { data: { user: null, session: null }, error: new Error('Supabase is not configured') }
        },
        signOut: async () => {
          if (typeof document !== 'undefined') {
            clearCookie('dev_bypass')
            clearCookie('dev_email_verified')
          }
          return { error: null }
        },
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      channel: () => ({
        on: () => ({
          on: () => ({
            subscribe: () => ({})
          }),
          subscribe: () => ({})
        }),
        subscribe: () => ({})
      }),
      removeChannel: () => {},
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => ({ data: null, error: null }),
            order: () => ({ data: [], error: null }),
          }),
          order: () => ({ data: [], error: null }),
          single: () => ({ data: null, error: null }),
        }),
        insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }),
        update: () => ({ eq: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }) }),
      })
    } as any
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
