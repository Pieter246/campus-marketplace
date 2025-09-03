import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { decodeJwt } from "jose";

export async function middleware(request: NextRequest) {
    console.log("Middleware", request.url);

    //Dont run if server actions are executed (server actions are POST requests)
    if(request.method === "POST") {
        return NextResponse.next();
    }

    // Get token string from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("firebaseAuthToken")?.value;

    // If no token redirect to home page
    if(!token){
        return NextResponse.redirect(new URL("/", request.url)); // CANNOT return NextResponse.redirect("/"); (need to specify absolute URL rather than relative URL)
    }

    // Decode token from token string
    const decodedToken = decodeJwt(token);

    // If user is not admin redirect to home page
    if(!decodedToken.admin){
        return NextResponse.redirect(new URL("/", request.url));
    }

    // Continue to requested page
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin-dashboard"
    ]
};