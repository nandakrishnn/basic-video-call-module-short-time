import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import { AddPatientPanel } from '@/components/patients/AddPatientPanel'
import { PatientListItem } from '@/components/patients/PatientListItem'
import { DashboardSidebar } from '@/components/shared/DashboardSidebar'
import { EmptyState } from '@/components/shared/EmptyState'
import { ListPageSkeleton } from '@/components/shared/ListPageSkeleton'
import { PageState } from '@/components/shared/PageState'
import { SearchInput } from '@/components/shared/SearchInput'
import { COLORS, FONT_SIZES } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { ROUTES } from '@/constants/routes'
import { listPatientsRequest } from '@/services/patient.service'
import type { User } from '@/types/user.types'
import { getToken } from '@/utils/storage'

const matches = (patient: User, query: string): boolean => {
  const haystack = [patient.fullName, patient.email, patient.phone].filter(Boolean).join(' ').toLowerCase()
  return haystack.includes(query)
}

const PatientsPage = (): JSX.Element => {
  const router = useRouter()
  const [patients, setPatients] = useState<User[]>([])
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const token = getToken()

  useEffect(() => {
    const token = getToken()
    if (!token) {
      // Physio-only route: stop loading and send them to log in rather than
      // leaving the skeleton up with nothing on its way.
      setIsLoading(false)
      void router.push(ROUTES.login)
      return
    }
    listPatientsRequest(token)
      .then((res) => {
        if (res.success) setPatients(res.data)
        else setError(res.message || MESSAGES.patients.loadFailed)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const handlePatientAdded = (patient: User): void => {
    setPatients((prev) => [...prev, patient])
  }

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return patients
    return patients.filter((patient) => matches(patient, normalized))
  }, [patients, query])

  if (isLoading) {
    return <ListPageSkeleton variant="grid" rows={6} />
  }

  if (error) {
    return <PageState tone="error" message={error} />
  }

  const count = filtered.length

  return (
    <div className="app-shell" style={{ minHeight: '100vh', background: COLORS.background }}>
      <DashboardSidebar />

      <div
        className="dashboard-content"
        style={{
          maxWidth: 1240,
          padding: '32px 40px 60px',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 20,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1 style={{ color: COLORS.text.primary, fontSize: FONT_SIZES.xl, fontWeight: 800, margin: 0 }}>
              {MESSAGES.patients.title}
            </h1>
            <p style={{ color: COLORS.text.secondary, fontSize: FONT_SIZES.md, margin: '6px 0 0' }}>
              {MESSAGES.patients.subtitle}
            </p>
          </div>
          {token && <AddPatientPanel token={token} onPatientAdded={handlePatientAdded} variant="primary" />}
        </header>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder={MESSAGES.patients.searchPlaceholder}
            style={{ flex: '1 1 320px' }}
          />
          <span style={{ color: COLORS.text.muted, fontSize: FONT_SIZES.base, fontWeight: 600 }}>
            {count === 1 ? MESSAGES.patients.countOne : MESSAGES.patients.countMany(count)}
          </span>
        </div>

        {patients.length === 0 ? (
          <EmptyState message={MESSAGES.patients.empty} />
        ) : filtered.length === 0 ? (
          <EmptyState message={MESSAGES.patients.noResults} />
        ) : (
          <ul
            className="patient-grid"
            style={{ listStyle: 'none', padding: 0, margin: 0 }}
          >
            {filtered.map((patient) => (
              <li key={patient.id}>
                <PatientListItem patient={patient} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default PatientsPage
