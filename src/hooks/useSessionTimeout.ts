// 7-day session timeout hook
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

export function useSessionTimeout() {
  const router = useRouter()

  useEffect(() => {
    const checkSession = () => {
      const loginTime = localStorage.getItem('loginTime')
      
      if (loginTime) {
        const timeSinceLogin = Date.now() - parseInt(loginTime)
        
        if (timeSinceLogin > SEVEN_DAYS) {
          // Auto logout after 7 days
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

    // Check session every hour
    const intervalId = setInterval(checkSession, 60 * 60 * 1000) // 1 hour

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
