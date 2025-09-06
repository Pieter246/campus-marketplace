'use client'

import { useSessionTimeout } from '@/hooks/useSessionTimeout'

export default function SessionManager({ children }: { children: React.ReactNode }) {
  // 7-day session timeout - logs users out after 7 days
  useSessionTimeout()

  return <>{children}</>
}
