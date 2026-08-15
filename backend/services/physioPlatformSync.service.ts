import { isPhysioPlatformConfigured, physioPlatformSupabase } from '../lib/physioPlatformSupabase'
import type { User } from '../types/user.types'

// Mirrors a patient created in this app into the separate physio-platform
// Supabase project, so the AI-based video call system knows about them too.
// Their `profiles` table requires a real Supabase Auth user (auth_user_id is
// NOT NULL) - so this is a 3-step chain, not a single insert: create the
// auth user, then a profile row, then a patients row linked to it.
//
// Never allowed to break our own patient-creation flow - always caught and
// logged, never thrown, by the caller's fire-and-forget usage.
export const syncPatientToPhysioPlatform = async (patient: User): Promise<void> => {
  if (!isPhysioPlatformConfigured()) return

  if (!patient.email && !patient.phone) {
    console.error(`Skipping physio-platform sync for patient ${patient.id}: no email or phone`)
    return
  }

  const { data: authUser, error: authError } = await physioPlatformSupabase.auth.admin.createUser({
    email: patient.email ?? undefined,
    phone: patient.phone ?? undefined,
    email_confirm: true,
    phone_confirm: true,
    user_metadata: { full_name: patient.fullName },
  })
  if (authError || !authUser.user) {
    throw new Error(`physio-platform auth user creation failed: ${authError?.message}`)
  }

  const { data: profile, error: profileError } = await physioPlatformSupabase
    .from('profiles')
    .insert({
      auth_user_id: authUser.user.id,
      role: 'patient',
      full_name: patient.fullName,
      email: patient.email,
    })
    .select('id')
    .single()
  if (profileError || !profile) {
    throw new Error(`physio-platform profile creation failed: ${profileError?.message}`)
  }

  const { error: patientError } = await physioPlatformSupabase.from('patients').insert({
    profile_id: profile.id,
    display_name: patient.fullName,
    external_patient_ref: patient.id,
  })
  if (patientError) {
    throw new Error(`physio-platform patient creation failed: ${patientError.message}`)
  }
}
