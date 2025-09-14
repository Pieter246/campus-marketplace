// src/app/api/messages/route.ts
import { NextRequest, NextResponse } from "next/server"
import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { authenticateRequest } from "@/lib/auth-middleware"

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const adminAuth = getAuth()
const adminDb = getFirestore()

interface SendMessageRequest {
  receiverId: string
  itemId?: string
  subject: string
  messageContent: string
  messageType: 'inquiry' | 'negotiation' | 'arrangement' | 'general'
}

// POST - Send a new message
export async function POST(req: NextRequest) {
  try {
    // Authenticate the request
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body: SendMessageRequest = await req.json()
    const { receiverId, itemId, subject, messageContent, messageType } = body

    // Validation
    if (!receiverId || !subject || !messageContent || !messageType) {
      return NextResponse.json({ 
        message: "Missing required fields: receiverId, subject, messageContent, messageType" 
      }, { status: 400 })
    }

    if (user.uid === receiverId) {
      return NextResponse.json({ 
        message: "Cannot send message to yourself" 
      }, { status: 400 })
    }

    // Verify receiver exists
    try {
      await adminAuth.getUser(receiverId)
    } catch (error) {
      return NextResponse.json({ 
        message: "Receiver not found" 
      }, { status: 404 })
    }

    // If itemId provided, verify item exists
    if (itemId) {
      const itemDoc = await adminDb.collection("items").doc(itemId).get()
      if (!itemDoc.exists) {
        return NextResponse.json({ 
          message: "Item not found" 
        }, { status: 404 })
      }
    }

    // Create message document
    const messageRef = adminDb.collection("messages").doc()
    await messageRef.set({
      messageId: messageRef.id,
      senderId: user.uid,
      receiverId,
      itemId: itemId || null,
      subject: subject.trim(),
      messageContent: messageContent.trim(),
      sentAt: new Date(),
      readAt: null,
      messageType
    })

    console.log(`Message sent from ${user.uid} to ${receiverId}`)

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      messageId: messageRef.id
    }, { status: 201 })

  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json(
      { 
        message: "Failed to send message",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// GET - Get user's messages (inbox/outbox)
export async function GET(req: NextRequest) {
  try {
    // Authenticate the request
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || "received" // "received", "sent", or "all"
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100) // Max 100 messages
    const itemId = searchParams.get("itemId")

    let query: any = adminDb.collection("messages")

    // Filter by message type
    if (type === "received") {
      query = query.where("receiverId", "==", user.uid)
    } else if (type === "sent") {
      query = query.where("senderId", "==", user.uid)
    } else if (type === "all") {
      // Get both sent and received - we'll need to do two queries and merge
      const receivedQuery = adminDb.collection("messages")
        .where("receiverId", "==", user.uid)
        .orderBy("sentAt", "desc")
        .limit(limit / 2)
      
      const sentQuery = adminDb.collection("messages")
        .where("senderId", "==", user.uid)
        .orderBy("sentAt", "desc")
        .limit(limit / 2)

      const [receivedSnapshot, sentSnapshot] = await Promise.all([
        receivedQuery.get(),
        sentQuery.get()
      ])

      const messages = [
        ...receivedSnapshot.docs.map(doc => ({
          messageId: doc.id,
          ...doc.data(),
          sentAt: doc.data().sentAt?.toDate?.()?.toISOString(),
          readAt: doc.data().readAt?.toDate?.()?.toISOString(),
        })),
        ...sentSnapshot.docs.map(doc => ({
          messageId: doc.id,
          ...doc.data(),
          sentAt: doc.data().sentAt?.toDate?.()?.toISOString(),
          readAt: doc.data().readAt?.toDate?.()?.toISOString(),
        }))
      ].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
      .slice(0, limit)

      return NextResponse.json({ 
        success: true, 
        messages,
        count: messages.length
      })
    }

    // Filter by item if specified
    if (itemId) {
      query = query.where("itemId", "==", itemId)
    }

    // Apply sorting and limit
    query = query.orderBy("sentAt", "desc").limit(limit)

    const messagesSnapshot = await query.get()

    const messages = messagesSnapshot.docs.map((doc: any) => ({
      messageId: doc.id,
      ...doc.data(),
      sentAt: doc.data().sentAt?.toDate?.()?.toISOString(),
      readAt: doc.data().readAt?.toDate?.()?.toISOString(),
    }))

    return NextResponse.json({ 
      success: true, 
      messages,
      count: messages.length,
      type,
      itemId
    })

  } catch (error) {
    console.error("Get messages error:", error)
    return NextResponse.json(
      { 
        message: "Failed to get messages",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
