import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const SESSION_TIMEOUT = 2 * 60 * 1000; // 2 minutes in milliseconds

export const GET = async (request: NextRequest) => {
    const path = request.nextUrl.searchParams.get("redirect"); // Original destination of the user

    // If no path provided, redirect to home (If someone tries to access this API directly without a redirect path specified they have not come from the middleware)
    if(!path){
        return NextResponse.redirect(new URL("/", request.url)); 
    }

    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("firebaseAuthRefreshToken")?.value;
    const lastActivityCookie = cookieStore.get("lastActivity")?.value;

    // If no refresh token, redirect to home
    if(!refreshToken){
        return NextResponse.redirect(new URL("/", request.url));
    }

    // Check if user has been inactive for more than 2 minutes
    if (lastActivityCookie) {
        const lastActivity = parseInt(lastActivityCookie);
        const timeSinceActivity = Date.now() - lastActivity;
        
        if (timeSinceActivity > SESSION_TIMEOUT) {
            // User has been inactive for more than 2 minutes - log them out
            console.log("User inactive for more than 2 minutes, logging out");
            
            // Clear auth cookies
            cookieStore.delete("firebaseAuthToken");
            cookieStore.delete("firebaseAuthRefreshToken");
            cookieStore.delete("lastActivity");
            
            // Redirect to login with session expired message
            return NextResponse.redirect(new URL("/login?reason=session-expired", request.url));
        }
    }

    try{
        // Get a new auth token for the currently logged in user using their firebase auth refresh token
        const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                grant_type: "refresh_token",
                refresh_token: refreshToken
            })
        })

        if (!response.ok) {
            throw new Error(`Token refresh failed: ${response.status}`);
        }

        // Get new token and set it in the cookies
        const json = await response.json();
        const newToken = json.id_token;
        
        if (!newToken) {
            throw new Error("No token received from refresh");
        }

        cookieStore.set("firebaseAuthToken", newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        });

        // Update last activity time since user is actively using the app
        cookieStore.set("lastActivity", Date.now().toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        });

        console.log("Token refreshed successfully for active user");

        // Redirect back to the original path the user was trying to access
        return NextResponse.redirect(new URL(path, request.url));     
    }catch(e){
        // Error refreshing token, redirect to home and clear cookies
        console.log("Failed to refresh token:", e);
        
        cookieStore.delete("firebaseAuthToken");
        cookieStore.delete("firebaseAuthRefreshToken");
        cookieStore.delete("lastActivity");
        
        return NextResponse.redirect(new URL("/login?reason=token-refresh-failed", request.url));
    }
}