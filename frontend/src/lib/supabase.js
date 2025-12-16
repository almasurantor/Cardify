import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug: Log environment variables (only in dev mode)
if (import.meta.env.DEV) {
  console.log('Environment check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlLength: supabaseUrl?.length || 0,
    keyLength: supabaseAnonKey?.length || 0,
    allEnvKeys: Object.keys(import.meta.env).filter(k => k.startsWith('VITE_'))
  })
}

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = `
Missing Supabase environment variables!

Required variables:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

Troubleshooting:
1. Make sure your .env file is in the 'frontend' directory (not root)
2. Variables must start with 'VITE_' prefix
3. Restart your dev server after adding/changing .env file
4. Check that there are no spaces around the = sign
5. Make sure there are no quotes around the values

Example .env file location: frontend/.env
Example format:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
`
  console.error(errorMessage)
  throw new Error('Missing Supabase environment variables. Check console for details.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

