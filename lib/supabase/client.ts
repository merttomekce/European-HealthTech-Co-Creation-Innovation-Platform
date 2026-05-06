import { createBrowserClient } from '@supabase/ssr'
import { DEMO_LOGIN, isDemoLogin } from '../demo-login'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const hasDemoSession = typeof document !== 'undefined' && document.cookie.includes('dev_bypass=true')

  if (!supabaseUrl || !supabaseKey) {
    // Return a mocked client that keeps the login screen usable without credentials.
    return {
      auth: {
        getUser: async () => hasDemoSession
          ? ({ data: { user: { id: 'dev-bypass-user', email: DEMO_LOGIN.email, user_metadata: { name: 'Demo User', role: DEMO_LOGIN.role } } }, error: null })
          : ({ data: { user: null }, error: null }),
        getSession: async () => hasDemoSession
          ? ({ data: { session: { user: { id: 'dev-bypass-user', email: DEMO_LOGIN.email, user_metadata: { name: 'Demo User', role: DEMO_LOGIN.role } } } }, error: null })
          : ({ data: { session: null }, error: null }),
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
        signUp: async ({ email, password }: { email: string; password: string }) => {
          if (typeof document !== 'undefined' && email === DEMO_LOGIN.email) {
            document.cookie = 'dev_bypass=true; path=/; max-age=86400; samesite=lax'
          }

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
