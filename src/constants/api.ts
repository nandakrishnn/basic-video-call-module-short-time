// Every backend API endpoint used by the frontend. Never hardcode a URL string elsewhere.

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

export const API = {
  auth: {
    login: `${BASE_URL}/api/auth/login`,
    patientRequestOtp: `${BASE_URL}/api/auth/patient/request-otp`,
    patientVerifyOtp: `${BASE_URL}/api/auth/patient/verify-otp`,
    me: `${BASE_URL}/api/auth/me`,
  },

  sessions: {
    create: `${BASE_URL}/api/sessions/create`,
    detail: (id: string) => `${BASE_URL}/api/sessions/${id}`,
    start: (id: string) => `${BASE_URL}/api/sessions/${id}/start`,
    end: (id: string) => `${BASE_URL}/api/sessions/${id}/end`,
    joinToken: (id: string) => `${BASE_URL}/api/sessions/${id}/join-token`,
    shareLog: (id: string) => `${BASE_URL}/api/sessions/${id}/share-log`,
  },

  appointments: {
    create: `${BASE_URL}/api/appointments/create`,
    byPhysio: (physioId: string) => `${BASE_URL}/api/appointments/physio/${physioId}`,
    byPatient: (patientId: string) => `${BASE_URL}/api/appointments/patient/${patientId}`,
    update: (id: string) => `${BASE_URL}/api/appointments/${id}`,
    cancel: (id: string) => `${BASE_URL}/api/appointments/${id}`,
  },

  notes: {
    create: `${BASE_URL}/api/notes/create`,
    enhance: (id: string) => `${BASE_URL}/api/notes/${id}/enhance`,
    approve: (id: string) => `${BASE_URL}/api/notes/${id}/approve`,
    generatePdf: (id: string) => `${BASE_URL}/api/notes/${id}/generate-pdf`,
    send: (id: string) => `${BASE_URL}/api/notes/${id}/send`,
  },

  dashboard: {
    physio: `${BASE_URL}/api/dashboard/physio`,
    patient: `${BASE_URL}/api/dashboard/patient`,
    admin: `${BASE_URL}/api/dashboard/admin`,
  },

  patients: {
    list: `${BASE_URL}/api/patients`,
    create: `${BASE_URL}/api/patients/create`,
  },
} as const
