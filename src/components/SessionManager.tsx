'use client'

import { useSessionTimeout } from '@/hooks/useSessionTimeout'

export default function SessionManager({ children }: { children: React.ReactNode }) {
  // 30-minute session timeout - logs users out after 30 minutes
  useSessionTimeout()

  return <>{children}</>
}
