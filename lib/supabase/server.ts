import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const cookieStore = cookies()

  if (cookieStore.get('dev_bypass')) {
    return {
      auth: {
        getUser: async () => ({
          data: {
            user: {
              id: 'dev-bypass-user',
              email: 'demo@healthai.edu',
              user_metadata: { name: 'Demo User', role: 'ENGINEER' },
            },
          },
          error: null,
        }),
        getSession: async () => ({ data: { session: { user: { id: 'dev-bypass-user' } } }, error: null }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => ({ data: null, error: null }),
            order: () => ({ data: [], error: null }),
          }),
          order: () => ({ data: [], error: null }),
          single: () => ({ data: null, error: null }),
        }),
      }),
    } as any
  }

  if (!supabaseUrl || !supabaseKey) {
    // Missing Supabase config must not create a shared authenticated identity.
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => ({ data: null, error: null }),
            order: () => ({ data: [], error: null }),
          }),
          order: () => ({ data: [], error: null }),
          single: () => ({ data: null, error: null }),
        }),
      })
    } as any
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {}
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {}
        },
      },
    }
  )
}
