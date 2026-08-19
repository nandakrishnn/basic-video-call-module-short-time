import { isPhysioPlatformConfigured, physioPlatformSupabase } from '../lib/physioPlatformSupabase'
import type { User } from '../types/user.types'

// Mirrors a patient created in this app into the separate physio-platform
// Supabase project, so the AI-based video call system knows about them too.
// Their `profiles` table requires a real Supabase Auth user (auth_user_id is
// NOT NULL) - so this is a 3-step chain, not a single insert: create the
// auth user, then a profile row, then a patients row linked to it.
//
// Idempotent by design, since this runs on every patient-creation request and
// must survive retries/double-submits without erroring on duplicate keys:
//   - Skips entirely if a patients row already exists for this external_patient_ref.
//   - Reuses an existing profiles row (matched by email) instead of trying to
//     create a second auth user/profile for the same person.
//   - Upserts the patients row on the profile_id unique constraint, so a retry
//     also repairs an earlier attempt that got an auth user + profile created
//     but failed before the patients row was written.
//
// Never allowed to break our own patient-creation flow - always caught and
// logged, never thrown, by the caller's fire-and-forget usage.
export const syncPatientToPhysioPlatform = async (patient: User): Promise<void> => {
  if (!isPhysioPlatformConfigured()) return

  if (!patient.email && !patient.phone) {
    console.error(`Skipping physio-platform sync for patient ${patient.id}: no email or phone`)
    return
  }

  const { data: existingPatient } = await physioPlatformSupabase
    .from('patients')
    .select('id')
    .eq('external_patient_ref', patient.id)
    .maybeSingle()
  if (existingPatient) return

  let profileId: string

  const { data: existingProfile } = patient.email
    ? await physioPlatformSupabase.from('profiles').select('id').eq('email', patient.email).maybeSingle()
    : { data: null }

  if (existingProfile) {
    profileId = existingProfile.id
  } else {
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

    // Upsert rather than insert: createUser can return an *existing* auth
    // user (e.g. the phone already belongs to someone there) even when our
    // own email-based lookup above found nothing - a plain insert would
    // collide on the auth_user_id unique constraint in that case.
    const { data: profile, error: profileError } = await physioPlatformSupabase
      .from('profiles')
      .upsert(
        {
          auth_user_id: authUser.user.id,
          role: 'patient',
          full_name: patient.fullName,
          email: patient.email,
        },
        { onConflict: 'auth_user_id' },
      )
      .select('id')
      .single()
    if (profileError || !profile) {
      throw new Error(`physio-platform profile creation failed: ${profileError?.message}`)
    }
    profileId = profile.id
  }

  const { error: patientError } = await physioPlatformSupabase.from('patients').upsert(
    {
      profile_id: profileId,
      display_name: patient.fullName,
      external_patient_ref: patient.id,
    },
    { onConflict: 'profile_id' },
  )
  if (patientError) {
    throw new Error(`physio-platform patient creation failed: ${patientError.message}`)
  }
}
