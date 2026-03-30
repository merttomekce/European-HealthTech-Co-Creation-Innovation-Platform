import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // Return a proxy that warns when called, to avoid immediate crash
    return new Proxy({} as any, {
      get() {
        return () => { throw new Error("Supabase credentials missing. Check your .env.local file.") }
      }
    })
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
