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
  // Legacy location. Current Jitsi reads configOverwrite.toolbarButtons
  // instead; kept for older deployments, which is why both are set.
  TOOLBAR_BUTTONS: [],
} as const

export const JITSI_CONFIG_OVERWRITE = {
  startWithAudioMuted: false,
  disableDeepLinking: true,
  hideConferenceSubject: true,
  hideConferenceTimer: true,
  disableInviteFunctions: true,
  enableNoisyMicDetection: false,
  // Both keys are set because Jitsi Meet migrated this setting into a nested
  // config across versions — meet.jit.si's exact deployed version isn't
  // pinned, so we can't be sure which one it still reads.
  prejoinPageEnabled: false,
  prejoinConfig: { enabled: false },
  // The same migration happened to the toolbar: TOOLBAR_BUTTONS in
  // interfaceConfigOverwrite is ignored by current builds, so Jitsi kept
  // drawing its own bar underneath ours. We supply every control ourselves.
  toolbarButtons: [],
  // The physio locks the room, so every patient is held in the lobby. Jitsi
  // asks them to press "Ask to join" there — a second button for a decision
  // they already made on our own join screen a moment earlier. Knocking
  // automatically leaves one press, and the waiting itself is unchanged: the
  // physio still admits them.
  lobby: {
    autoKnock: true,
    enableChat: false,
  },
  // We draw the admission prompt ourselves from the knockingParticipant event,
  // so Jitsi's own was a second popup for the same person — two Admit buttons,
  // and whichever the physio ignored sat there looking unanswered. Its own
  // lobby toggle notice goes too: the physio never toggled it, the code did.
  disabledNotifications: [
    'notify.participantWantsToJoin',
    'notify.participantsWantToJoin',
    'lobby.notificationTitle',
  ],
  securityUi: {
    // "Enter meeting password" sits beside the knock as a way for a host to
    // let themselves in. There are no passwords here — the physio is the
    // moderator by JWT — so it can only confuse a patient.
    disableLobbyPassword: true,
    hideLobbyButton: true,
  },
} as const
