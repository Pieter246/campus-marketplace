import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/firebase/server'

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return current admin status (this already checks environment + database)
    return NextResponse.json({ 
      isAdmin: authResult.admin || false,
      uid: authResult.uid,
      email: authResult.email 
    })
  } catch (error) {
    console.error('Admin status check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}