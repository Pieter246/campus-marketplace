// 2-minute session timeout hook with activity tracking
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { ActivityTracker, initializeActivityTracking } from '@/lib/activityTracker'

const SESSION_TIMEOUT = 2 * 60 * 1000 // 2 minutes in milliseconds

export function useSessionTimeout() {
  const router = useRouter()

  useEffect(() => {
    // Initialize activity tracking for user interactions
    initializeActivityTracking()

    const checkSession = () => {
      // Only check if user is authenticated
      if (!auth.currentUser) {
        ActivityTracker.clearActivity()
        return
      }

      // Check if user should be logged out due to inactivity
      if (ActivityTracker.shouldLogout()) {
        console.log('User inactive for more than 30 minutes, logging out')
        
        // Clear activity data
        ActivityTracker.clearActivity()
        
        // Sign out user
        auth.signOut()
        
        // Redirect to login with session expired message
        router.push('/login?reason=session-expired')
        return
      }

      // Log remaining session time for debugging
      const timeRemaining = ActivityTracker.getTimeUntilExpiry()
      if (timeRemaining !== null) {
        console.log(`Session expires in: ${Math.floor(timeRemaining / 60000)} minutes`)
      }
    }

    // Set login time when user is authenticated
    const handleAuthStateChange = (user: any) => {
      if (user) {
        // User just logged in, record login time and activity
        ActivityTracker.setLoginTime()
        console.log('User logged in, activity tracking started')
      } else {
        // User logged out, clear activity data
        ActivityTracker.clearActivity()
        console.log('User logged out, activity tracking cleared')
      }
    }

    // Check session on initial load
    checkSession()

    // Check session every 5 minutes
    const intervalId = setInterval(checkSession, 5 * 60 * 1000) // 5 minutes

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged(handleAuthStateChange)

    // Cleanup
    return () => {
      clearInterval(intervalId)
      unsubscribe()
    }
  }, [router])
}
