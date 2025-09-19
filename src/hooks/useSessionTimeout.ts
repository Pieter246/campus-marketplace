// 15-minute inactivity timeout hook
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/firebase/client'

const INACTIVITY_TIMEOUT = 15 * 60 * 1000 // 15 minutes in milliseconds
const ACTIVITY_KEY = 'lastActivity'
const STORAGE_EVENT_KEY = 'session-activity'

export function useSessionTimeout() {
  const router = useRouter()

  useEffect(() => {
    const updateActivity = () => {
      const now = Date.now().toString()
      localStorage.setItem(ACTIVITY_KEY, now)
      // Broadcast activity to other tabs
      localStorage.setItem(STORAGE_EVENT_KEY, now)
    }

    const checkSession = () => {
      const lastActivity = localStorage.getItem(ACTIVITY_KEY)
      
      if (lastActivity && auth.currentUser) {
        const timeSinceActivity = Date.now() - parseInt(lastActivity)
        
        if (timeSinceActivity > INACTIVITY_TIMEOUT) {
          // Auto logout after 15 minutes of inactivity
          localStorage.removeItem(ACTIVITY_KEY)
          localStorage.removeItem(STORAGE_EVENT_KEY)
          auth.signOut()
          router.push('/login?reason=session-expired')
        }
      }
    }

    const handleActivity = () => {
      if (auth.currentUser) {
        updateActivity()
      }
    }

    const handleStorageChange = (e: StorageEvent) => {
      // Sync activity across tabs
      if (e.key === STORAGE_EVENT_KEY && e.newValue) {
        localStorage.setItem(ACTIVITY_KEY, e.newValue)
      }
    }

    // Activity event listeners
    const activityEvents = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'focus'
    ]

    // Set initial activity time when user is authenticated
    const setInitialActivity = () => {
      if (auth.currentUser) {
        updateActivity()
      }
    }

    // Initialize
    setInitialActivity()
    checkSession()

    // Add activity listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })

    // Listen for storage changes (cross-tab communication)
    window.addEventListener('storage', handleStorageChange)

    // Check session every minute
    const intervalId = setInterval(checkSession, 60 * 1000) // 1 minute

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        updateActivity()
      } else {
        localStorage.removeItem(ACTIVITY_KEY)
        localStorage.removeItem(STORAGE_EVENT_KEY)
      }
    })

    return () => {
      clearInterval(intervalId)
      unsubscribe()
      
      // Remove activity listeners
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
      
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [router])
}
