import { CONFIG } from '@/constants/config'

let scriptPromise: Promise<void> | null = null

export const loadJitsiScript = (): Promise<void> => {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.JitsiMeetExternalAPI) return Promise.resolve()

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = `https://${CONFIG.jitsi.domain}/external_api.js`
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Jitsi script'))
      document.body.appendChild(script)
    })
  }

  return scriptPromise
}

export const JITSI_INTERFACE_CONFIG = {
  SHOW_JITSI_WATERMARK: false,
  SHOW_WATERMARK_FOR_GUESTS: false,
  SHOW_BRAND_WATERMARK: false,
  SHOW_CHROME_EXTENSION_BANNER: false,
  SHOW_POWERED_BY: false,
  DISPLAY_WELCOME_PAGE_CONTENT: false,
  DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
  TOOLBAR_BUTTONS: [],
} as const

export const JITSI_CONFIG_OVERWRITE = {
  startWithAudioMuted: false,
  disableDeepLinking: true,
  hideConferenceSubject: true,
  hideConferenceTimer: true,
  disableInviteFunctions: true,
  enableNoisyMicDetection: false,
} as const
