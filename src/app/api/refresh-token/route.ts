import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
    const path = request.nextUrl.searchParams.get("redirect"); // Original destination of the user

    // If no path provided, redirect to home (If someone tries to access this API directly without a redirect path specified they have not come from the middleware)
    if(!path){
        return NextResponse.redirect(new URL("/", request.url)); 
    }

    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("firebaseAuthRefreshToken")?.value;

    // If no refresh token, redirect to home
    if(!refreshToken){
        return NextResponse.redirect(new URL("/", request.url));
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

        // Get new token and set it in the cookies
        const json = await response.json();
        const newToken = json.id_token;
        cookieStore.set("firebaseAuthToken", newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        });

        // Redirect back to the original path the user was trying to access
        return NextResponse.redirect(new URL(path, request.url));     
    }catch(e){

        // Error refreshing token, redirect to home
        console.log("Failed to refresh token:", e);
        return NextResponse.redirect(new URL("/", request.url));
    }
}