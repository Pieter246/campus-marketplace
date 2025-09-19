// Activity tracking utility for managing user session timeouts
// Tracks user activity to determine if they should be logged out after 2 minutes of inactivity

const SESSION_TIMEOUT = 2 * 60 * 1000; // 2 minutes in milliseconds
const ACTIVITY_KEY = 'lastActivity';
const LOGIN_TIME_KEY = 'loginTime';

export class ActivityTracker {
  /**
   * Records the current time as the last activity time
   */
  static updateActivity(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACTIVITY_KEY, Date.now().toString());
    }
  }

  /**
   * Records the login time when user first logs in
   */
  static setLoginTime(): void {
    if (typeof window !== 'undefined') {
      const now = Date.now().toString();
      localStorage.setItem(LOGIN_TIME_KEY, now);
      localStorage.setItem(ACTIVITY_KEY, now);
    }
  }

  /**
   * Gets the last activity time from localStorage
   */
  static getLastActivity(): number | null {
    if (typeof window === 'undefined') return null;
    
    const lastActivity = localStorage.getItem(ACTIVITY_KEY);
    return lastActivity ? parseInt(lastActivity) : null;
  }

  /**
   * Gets the login time from localStorage
   */
  static getLoginTime(): number | null {
    if (typeof window === 'undefined') return null;
    
    const loginTime = localStorage.getItem(LOGIN_TIME_KEY);
    return loginTime ? parseInt(loginTime) : null;
  }

  /**
   * Checks if the user has been inactive for more than 30 minutes
   */
  static isInactive(): boolean {
    const lastActivity = this.getLastActivity();
    if (!lastActivity) return true;

    const timeSinceActivity = Date.now() - lastActivity;
    return timeSinceActivity > SESSION_TIMEOUT;
  }

  /**
   * Checks if user should be logged out (inactive for > 30 minutes)
   */
  static shouldLogout(): boolean {
    return this.isInactive();
  }

  /**
   * Clears all activity and login time data
   */
  static clearActivity(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACTIVITY_KEY);
      localStorage.removeItem(LOGIN_TIME_KEY);
    }
  }

  /**
   * Gets time since last activity in milliseconds
   */
  static getTimeSinceLastActivity(): number | null {
    const lastActivity = this.getLastActivity();
    if (!lastActivity) return null;
    
    return Date.now() - lastActivity;
  }

  /**
   * Gets time until session expires in milliseconds
   */
  static getTimeUntilExpiry(): number | null {
    const lastActivity = this.getLastActivity();
    if (!lastActivity) return null;
    
    const timeSinceActivity = Date.now() - lastActivity;
    const timeRemaining = SESSION_TIMEOUT - timeSinceActivity;
    return timeRemaining > 0 ? timeRemaining : 0;
  }
}

// Auto-track user activity on common user interactions
export function initializeActivityTracking(): void {
  if (typeof window === 'undefined') return;

  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  
  const updateActivityThrottled = throttle(() => {
    ActivityTracker.updateActivity();
  }, 60000); // Update at most once per minute

  events.forEach(event => {
    document.addEventListener(event, updateActivityThrottled, true);
  });
}

// Throttle function to limit how often activity is recorded
function throttle(func: Function, limit: number): () => void {
  let inThrottle: boolean;
  return function(this: any) {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}