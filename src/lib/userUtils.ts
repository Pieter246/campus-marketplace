import { firestore } from "@/firebase/server";

/**
 * Ensure user document exists in Firestore with proper admin status
 * This should be called during user authentication/registration
 */
export async function ensureUserDocument(uid: string, email: string, userData?: Record<string, unknown>) {
  try {
    const userRef = firestore.collection("users").doc(uid);
    const userDoc = await userRef.get();

    // Get admin emails from environment
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);
    const isEnvironmentAdmin = adminEmails.includes(email);

    if (!userDoc.exists) {
      // Create new user document
      const newUserData = {
        email,
        isAdmin: isEnvironmentAdmin, // Set admin status based on environment
        isActive: true,
        emailVerified: userData?.emailVerified || false,
        adminSource: isEnvironmentAdmin ? 'environment' : null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...userData
      };

      await userRef.set(newUserData);
      console.log(`Created user document for ${email} with admin status: ${isEnvironmentAdmin}`);
      
      return newUserData;
    } else {
      // Update existing user document - ALWAYS sync with environment
      const existingData = userDoc.data();
      let needsUpdate = false;
      const updates: Record<string, unknown> = {};
      
      // If user WAS environment admin but email removed from .env, remove admin status
      if (!isEnvironmentAdmin && existingData?.isAdmin && existingData?.adminSource === 'environment') {
        updates.isAdmin = false;
        updates.adminSource = null;
        updates.adminRemovedAt = new Date();
        updates.adminRemovedReason = 'environment_configuration_removed';
        needsUpdate = true;
        console.log(`Removing admin status from ${email} - no longer in environment configuration`);
      }
      
      // If user is environment admin but not marked as admin in database, update it
      if (isEnvironmentAdmin && !existingData?.isAdmin) {
        updates.isAdmin = true;
        updates.adminSource = 'environment';
        updates.adminPromotedAt = new Date();
        needsUpdate = true;
        console.log(`Adding admin status to ${email} based on environment configuration`);
      }
      
      // Always update the timestamp
      updates.updatedAt = new Date();
      
      if (needsUpdate) {
        await userRef.update(updates);
      }
      
      return { ...existingData, ...updates };
    }
  } catch (error) {
    console.error(`Error ensuring user document for ${uid}:`, error);
    throw error;
  }
}

/**
 * Get user with current admin status (always checks environment)
 */
export async function getUserWithAdminStatus(uid: string) {
  try {
    const userDoc = await firestore.collection("users").doc(uid).get();
    
    if (!userDoc.exists) {
      return null;
    }
    
    const userData = userDoc.data();
    
    // Get admin emails from environment
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);
    const isEnvironmentAdmin = adminEmails.includes(userData?.email || '');
    
    // Final admin status: database admin OR environment admin
    const finalAdminStatus = userData?.isAdmin || isEnvironmentAdmin;
    
    return {
      ...userData,
      uid,
      isAdmin: finalAdminStatus,
      admin: finalAdminStatus, // For backward compatibility
      isEnvironmentAdmin
    };
  } catch (error) {
    console.error(`Error getting user admin status for ${uid}:`, error);
    return null;
  }
}

/**
 * Check if user is currently admin (used for real-time checks)
 */
export async function checkCurrentAdminStatus(uid: string, email: string): Promise<boolean> {
  try {
    // First check environment
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);
    const isEnvironmentAdmin = adminEmails.includes(email);
    
    // Then check database
    const userDoc = await firestore.collection("users").doc(uid).get();
    const isDatabaseAdmin = userDoc.exists ? userDoc.data()?.isAdmin || false : false;
    
    // User is admin if they're EITHER environment admin OR database admin
    return isEnvironmentAdmin || isDatabaseAdmin;
  } catch (error) {
    console.error(`Error checking admin status for ${uid}:`, error);
    return false;
  }
}