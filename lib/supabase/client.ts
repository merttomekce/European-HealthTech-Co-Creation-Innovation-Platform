import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // Return a mocked client that allows the UI to render without crashing
    // This provides a consistent "Demo" experience when credentials are missing.
    return {
      auth: {
        getUser: async () => ({ data: { user: { id: 'dummy-user', email: 'demo@healthai.edu', user_metadata: { name: 'Demo User', role: 'ENGINEER' } } }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
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
