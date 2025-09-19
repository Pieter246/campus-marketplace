import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { decodeJwt } from "jose";
import { ServerActivityTracker } from "@/lib/serverActivityTracker";

/*
    This middleware runs before every request to the specified paths in the config matcher
    1. It checks if the user is authenticated and authorized to access certain pages
    2. It also refreshes the user's Firebase auth token 5 minutes before it expires if the user is still logged in and active
    3. Enforces 2-minute activity timeout - logs out users inactive for more than 2 minutes
*/

export async function middleware(request: NextRequest) {
    console.log("🔥 MIDDLEWARE RUNNING FOR:", request.url);
    console.log("🔍 REQUEST DETAILS:", {
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        nextUrl: {
            pathname: request.nextUrl.pathname,
            origin: request.nextUrl.origin,
            host: request.nextUrl.host
        }
    });
    
    if(request.method === "POST"){
        return NextResponse.next();
    }

    // Get cookies directly from request headers instead of cookies() helper
    const cookieHeader = request.headers.get('cookie') || '';
    console.log("🍪 RAW COOKIE HEADER:", cookieHeader);
    console.log("🍪 ALL REQUEST HEADERS:", Object.fromEntries(request.headers.entries()));
    
    // Parse cookies manually
    const cookies = new Map();
    if (cookieHeader) {
        cookieHeader.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (name && value) {
                cookies.set(name, decodeURIComponent(value));
            }
        });
    }
    
    console.log("🍪 PARSED COOKIES:", Array.from(cookies.keys()));
    const token = cookies.get("firebaseAuthToken");
    console.log("🔍 LOOKING FOR firebaseAuthToken:", token ? "FOUND" : "NOT FOUND");

    const { pathname } = request.nextUrl;

    // If a user is not logged in they are allowed to go to the login, register, forgot password, item-search and item pages
    if(!token && 
        (pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/reset-password") ||
        pathname.startsWith("/item-search") ||
        pathname.startsWith("/item"))
    ){
        console.log("🟢 ALLOWING UNAUTHENTICATED ACCESS TO:", pathname);
        return NextResponse.next();
    }

    // If a user is logged in they are not allowed to go to the login, register or forgot password page
    if(token && 
        (pathname.startsWith("/login") || 
        pathname.startsWith("/register") ||
        pathname.startsWith("/reset-password"))
    ){
        console.log("� AUTHENTICATED USER - REDIRECTING FROM AUTH PAGES TO HOME");
        return NextResponse.redirect(new URL("/", request.url));
    }

    // Assuming the user tries to access any other page without being logged in return to home page
    if(!token) {
        console.log("❌ NO TOKEN - REDIRECTING TO HOME");
        return NextResponse.redirect(new URL("/", request.url));
    }

    try {
        // Decode the JWT token to get its expiration time and user role (admin or user)
        const decodedToken = decodeJwt(token);
        console.log("🔓 DECODED TOKEN:", { 
            email: decodedToken.email, 
            admin: decodedToken.admin,
            exp: decodedToken.exp 
        });

        // Check if user has been inactive for more than 2 minutes
        const lastActivityStr = cookies.get("lastActivity");
        if (lastActivityStr) {
            const lastActivity = parseInt(lastActivityStr);
            const timeSinceActivity = Date.now() - lastActivity;
            const SESSION_TIMEOUT = 2 * 60 * 1000; // 2 minutes
            
            if (timeSinceActivity > SESSION_TIMEOUT) {
                console.log("⏰ USER INACTIVE - LOGGING OUT");
                const response = NextResponse.redirect(new URL("/login?reason=inactive", request.url));
                response.cookies.delete("firebaseAuthToken");
                response.cookies.delete("firebaseAuthRefreshToken");
                response.cookies.delete("lastActivity");
                return response;
            }
        }

        // Update activity timestamp
        const response = NextResponse.next();
        response.cookies.set("lastActivity", Date.now().toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        // Check if trying to access admin routes
        if (pathname.startsWith("/admin") || pathname.startsWith("/profile/admin")) {
            const isAdmin = decodedToken.admin === true;
            console.log("🛡️ ADMIN CHECK:", { pathname, isAdmin, adminClaim: decodedToken.admin });
            if (!isAdmin) {
                console.log("🚫 NOT ADMIN - REDIRECTING TO HOME");
                return NextResponse.redirect(new URL("/", request.url));
            }
        }

        // Check if token is going to expire within the next 5 minutes
        if(decodedToken.exp && (decodedToken.exp - 300) * 1000 < Date.now()) {
            console.log("🔄 TOKEN EXPIRING SOON - REFRESHING");
            return NextResponse.redirect(
                new URL(
                    `/api/refresh-token?redirect=${encodeURIComponent(pathname)}`,
                    request.url
                )
            );
        }

        console.log("✅ ACCESS GRANTED TO:", pathname);
        return response;
        
    } catch (error) {
        console.error("💥 ERROR IN MIDDLEWARE:", error);
        return NextResponse.redirect(new URL("/", request.url));
    }
}

export const config = {
    matcher: [
        "/profile",
        "/profile/:path*",
        "/item",
        "/item/:path*",
        "/account",
        "/account/:path*",
        "/item-search",
        "/admin",
        "/admin/:path*"
    ]
};