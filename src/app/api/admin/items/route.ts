import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest, firestore } from '@/firebase/server'
import { removeItemFromAllCarts } from '@/lib/cartCleanup'

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!authResult.admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    if (!authResult.admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get items from Firestore
    const itemsCollection = firestore.collection('items')
    const itemsSnapshot = await itemsCollection
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get()

    const items = itemsSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title || 'Untitled',
        price: data.price || 0,
        condition: data.condition || 'unknown',
        status: data.status || 'pending',
        thumbnail: data.photos?.[0] || null,
        sellerId: data.sellerId,
        sellerEmail: data.sellerEmail || 'Unknown',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        category: data.category || 'other'
      }
    })

    return NextResponse.json({ success: true, items })
  } catch (error) {
    console.error('Admin items API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!authResult.admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { itemId, action, status } = await request.json()

    if (!itemId || !action) {
      return NextResponse.json({ error: 'Item ID and action are required' }, { status: 400 })
    }

    const itemRef = firestore.collection('items').doc(itemId)
    const itemDoc = await itemRef.get()

    if (!itemDoc.exists) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Get current status for cart cleanup logic
    const currentData = itemDoc.data()
    const currentStatus = currentData?.status

    const updateData: { status?: string; updatedAt: Date } = {
      updatedAt: new Date()
    }

    switch (action) {
      case 'approve':
        updateData.status = 'approved'
        break
      case 'reject':
        updateData.status = 'rejected'
        break
      case 'suspend':
        updateData.status = 'suspended'
        break
      case 'delete':
        // Remove from all carts before deleting
        try {
          await removeItemFromAllCarts(itemId)
        } catch (cartError) {
          console.error(`Error removing item ${itemId} from carts before deletion:`, cartError)
        }
        await itemRef.delete()
        return NextResponse.json({ success: true, message: 'Item deleted' })
      default:
        if (status) {
          updateData.status = status
        } else {
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }
    }

    await itemRef.update(updateData)

    // If status is changing away from 'for-sale', remove item from all carts
    if (currentStatus === 'for-sale' && updateData.status !== 'for-sale') {
      try {
        await removeItemFromAllCarts(itemId)
        console.log(`Removed item ${itemId} from all carts due to admin action: ${action}`)
      } catch (cartError) {
        console.error(`Error removing item ${itemId} from carts:`, cartError)
        // Don't fail the update if cart cleanup fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Item ${action}d successfully`,
      itemId,
      newStatus: updateData.status
    })
  } catch (error) {
    console.error('Admin items update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}