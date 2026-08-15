import { createClient } from '@supabase/supabase-js'

const url = process.env.PHYSIO_PLATFORM_SUPABASE_URL ?? ''
const serviceKey = process.env.PHYSIO_PLATFORM_SUPABASE_SERVICE_KEY ?? ''

export const isPhysioPlatformConfigured = (): boolean => Boolean(url && serviceKey)

// A separate Supabase project (the AI-based video call platform) - patients
// created here get mirrored there so both systems know about the same person.
export const physioPlatformSupabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
})
