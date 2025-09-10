// 30-minute session timeout hook
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'

const THIRTY_MINUTES = 30 * 60 * 1000 // 30 minutes in milliseconds

export function useSessionTimeout() {
  const router = useRouter()

  useEffect(() => {
    const checkSession = () => {
      const loginTime = localStorage.getItem('loginTime')
      
      if (loginTime) {
        const timeSinceLogin = Date.now() - parseInt(loginTime)
        
        if (timeSinceLogin > THIRTY_MINUTES) {
          // Auto logout after 30 minutes
          localStorage.removeItem('loginTime')
          auth.signOut()
          router.push('/login?reason=session-expired')
        }
      }
    }

    // Set login time when user is authenticated
    const setLoginTime = () => {
      if (auth.currentUser && !localStorage.getItem('loginTime')) {
        localStorage.setItem('loginTime', Date.now().toString())
      }
    }

    // Check session on load
    checkSession()
    setLoginTime()

    // Check session every 5 minutes
    const intervalId = setInterval(checkSession, 5 * 60 * 1000) // 5 minutes

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setLoginTime()
      } else {
        localStorage.removeItem('loginTime')
      }
    })

    return () => {
      clearInterval(intervalId)
      unsubscribe()
    }
  }, [router])
}
