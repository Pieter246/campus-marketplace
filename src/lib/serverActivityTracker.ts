// Server-side activity tracking for middleware
import { cookies } from "next/headers";

const SESSION_TIMEOUT = 2 * 60 * 1000; // 2 minutes in milliseconds

export class ServerActivityTracker {
  /**
   * Updates the last activity time in server-side cookies
   */
  static async updateActivity(): Promise<void> {
    try {
      const cookieStore = await cookies();
      cookieStore.set("lastActivity", Date.now().toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
    } catch (error) {
      console.error("Failed to update activity:", error);
    }
  }

  /**
   * Gets the last activity time from server-side cookies
   */
  static async getLastActivity(): Promise<number | null> {
    try {
      const cookieStore = await cookies();
      const lastActivity = cookieStore.get("lastActivity")?.value;
      return lastActivity ? parseInt(lastActivity) : null;
    } catch (error) {
      console.error("Failed to get last activity:", error);
      return null;
    }
  }

  /**
   * Checks if the user has been inactive for more than 2 minutes
   */
  static async isInactive(): Promise<boolean> {
    const lastActivity = await this.getLastActivity();
    if (!lastActivity) return true;

    const timeSinceActivity = Date.now() - lastActivity;
    return timeSinceActivity > SESSION_TIMEOUT;
  }

  /**
   * Checks if user should be logged out (inactive for > 2 minutes)
   */
  static async shouldLogout(): Promise<boolean> {
    return await this.isInactive();
  }

  /**
   * Clears activity data from server-side cookies
   */
  static async clearActivity(): Promise<void> {
    try {
      const cookieStore = await cookies();
      cookieStore.delete("lastActivity");
    } catch (error) {
      console.error("Failed to clear activity:", error);
    }
  }

  /**
   * Gets time since last activity in milliseconds
   */
  static async getTimeSinceLastActivity(): Promise<number | null> {
    const lastActivity = await this.getLastActivity();
    if (!lastActivity) return null;
    
    return Date.now() - lastActivity;
  }
}