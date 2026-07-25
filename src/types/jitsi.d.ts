export {}

declare global {
  interface JitsiMeetExternalApiOptions {
    roomName: string
    width?: string | number
    height?: string | number
    parentNode: HTMLElement
    userInfo?: { displayName: string }
    interfaceConfigOverwrite?: Record<string, unknown>
    configOverwrite?: Record<string, unknown>
    jwt?: string
  }

  interface JitsiMeetExternalApiInstance {
    executeCommand: (command: string, ...args: unknown[]) => void
    addListener: (event: string, listener: (...args: unknown[]) => void) => void
    removeListener: (event: string, listener: (...args: unknown[]) => void) => void
    dispose: () => void
  }

  interface Window {
    JitsiMeetExternalAPI?: new (
      domain: string,
      options: JitsiMeetExternalApiOptions,
    ) => JitsiMeetExternalApiInstance
  }
}
