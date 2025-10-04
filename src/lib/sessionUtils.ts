import { getAuth } from "firebase/auth";

/**
 * Force refresh the current user's ID token to get updated claims
 * This should be called after admin status changes to ensure immediate updates
 */
export async function refreshUserSession(): Promise<boolean> {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.warn("No authenticated user to refresh");
      return false;
    }
    
    // Force refresh the ID token to get updated custom claims
    await user.getIdToken(true);
    
    console.log("User session refreshed successfully");
    return true;
  } catch (error) {
    console.error("Error refreshing user session:", error);
    return false;
  }
}

/**
 * Get fresh user claims after a potential admin status change
 */
export async function getFreshUserClaims() {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      return null;
    }
    
    // Get fresh token result
    const tokenResult = await user.getIdTokenResult(true);
    return tokenResult.claims;
  } catch (error) {
    console.error("Error getting fresh user claims:", error);
    return null;
  }
}