import { useEffect, useState } from 'react'

export const useCallTimer = (isActive: boolean): string => {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => setSeconds((prev) => prev + 1), 1000)
    return () => clearInterval(interval)
  }, [isActive])

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}
