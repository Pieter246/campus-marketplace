import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  console.log("🔍 DEBUG ENDPOINT - All cookies:", allCookies.map(c => ({ 
    name: c.name, 
    hasValue: !!c.value,
    value: c.value?.substring(0, 20) + '...'
  })));
  
  return NextResponse.json({
    cookieCount: allCookies.length,
    cookieNames: allCookies.map(c => c.name),
    firebaseAuthToken: !!cookieStore.get("firebaseAuthToken"),
    timestamp: new Date().toISOString()
  });
}