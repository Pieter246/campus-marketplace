import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { decodeJwt } from "jose";
import { AUTH_TEMPORAL } from "@/app/api/refresh-token/app-config";

/*
    This middleware runs before every request to the specified paths in the config matcher
    1. It checks if the user is authenticated and authorized to access certain pages
    2. It also refreshes the user's Firebase auth token 5 minutes before it expires if the user is still logged in and active
*/

export async function middleware(request: NextRequest) {
    console.log("MIDDLEWARE: ", request.url);
    if(request.method === "POST"){
        return NextResponse.next();
    }
    const { pathname  } = request.nextUrl;

    const currentDate = new Date();
    if (currentDate >= AUTH_TEMPORAL) {
        // Request new token for user
        return NextResponse.redirect(
            new URL(
                `/api/refresh-token?redirect=${encodeURIComponent("/")}`, // Refresh token and then redirect to home
                request.url
            )
        );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("firebaseAuthToken")?.value;
    const hasSession = cookieStore.get("authSession")?.value;

    //const { pathname  } = request.nextUrl;

    // If a user is not logged in they are allowed to go to the login, register, forgot password and item-search page
    if(!token && 
        (pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/reset-password")) ||
        pathname.startsWith("/item-search") ||
        pathname.startsWith("/item")
    ){
        return NextResponse.next();
    }

    // If a user is logged in they are not allowed to go to the login, register or forgot password page
    if(token && 
        (pathname.startsWith("/login") || 
        pathname.startsWith("/register") ||
        pathname.startsWith("/reset-password"))
    ){
        return NextResponse.redirect(new URL("/", request.url));
    }

    // If the session has been checked (hasSession is true) and there's still no token,
    // then we can safely redirect to login.
    // This prevents the race condition on initial load.
    if (hasSession && !token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // If there is no token, redirect to login. This is the main protection for all other routes.
    // This check is placed after all the allowed paths for unauthenticated users.
    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    /* Decode the JWT token to get its expiration time and user role (admin or user)
       Only now we get decoded token because:
        1. The admin-dashboard and account/my-favourites pages need to know if user is admin or not for route protection
        2. Data needs to be loaded on these pages from server side so we need to have an up to date auth token stored in cookies */
    const decodedToken = decodeJwt(token);

    if(decodedToken.exp && (decodedToken.exp - 300) * 1000 < Date.now()) { //subtract 5 minutes (300 seconds) times 1000 to convert to milliseconds
        // Request new token for user
        return NextResponse.redirect(
            new URL(
                `/api/refresh-token?redirect=${encodeURIComponent(pathname)}`, // Redirect back to the original path after refreshing token
                request.url
            )
        );
    }

    // User and admin can query data from the server with up to date auth token
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/profile",
        "/profile/:path*",
        "/item",
        "/item/:path*",
        "/login",
        "/register",
        "/reset-password",
        "/account",
        "/account/:path*",
        "/item-search"
    ]
};