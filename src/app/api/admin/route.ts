import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/firebase/server'

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    
    if (!authResult || !authResult.success || !authResult.decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!authResult.decodedToken.admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Mock admin dashboard data
    const stats = {
      totalUsers: 150,
      activeItems: 89,
      totalTransactions: 245,
      revenue: 15420
    }

    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error('Admin API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}