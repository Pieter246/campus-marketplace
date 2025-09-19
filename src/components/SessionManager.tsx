'use client'

import { useSessionTimeout } from '@/hooks/useSessionTimeout'

export default function SessionManager({ children }: { children: React.ReactNode }) {
  // 15-minute inactivity timeout - logs users out after 15 minutes of inactivity
  useSessionTimeout()

  return <>{children}</>
}
