// src/app/api/conversations/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { authenticateRequest } from "@/firebase/server"

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

// GET - Get conversation messages between current user and specified user
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Authenticate the request
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { userId } = params
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100) // Max 100 messages
    const markAsRead = searchParams.get("markAsRead") === "true"

    if (userId === user.uid) {
      return NextResponse.json({ 
        message: "Cannot get conversation with yourself" 
      }, { status: 400 })
    }

    // Verify other user exists
    try {
      await adminAuth.getUser(userId)
    } catch (error) {
      return NextResponse.json({ 
        message: "User not found" 
      }, { status: 404 })
    }

    // Get messages between the two users
    const [sentSnapshot, receivedSnapshot] = await Promise.all([
      adminDb.collection("messages")
        .where("senderId", "==", user.uid)
        .where("receiverId", "==", userId)
        .orderBy("sentAt", "desc")
        .limit(limit / 2)
        .get(),
      adminDb.collection("messages")
        .where("senderId", "==", userId)
        .where("receiverId", "==", user.uid)
        .orderBy("sentAt", "desc")
        .limit(limit / 2)
        .get()
    ])

    // Combine and sort messages
    const messages = [
      ...sentSnapshot.docs.map((doc: any) => ({
        messageId: doc.id,
        ...doc.data(),
        sentAt: doc.data().sentAt?.toDate?.()?.toISOString(),
        readAt: doc.data().readAt?.toDate?.()?.toISOString(),
      })),
      ...receivedSnapshot.docs.map((doc: any) => ({
        messageId: doc.id,
        ...doc.data(),
        sentAt: doc.data().sentAt?.toDate?.()?.toISOString(),
        readAt: doc.data().readAt?.toDate?.()?.toISOString(),
      }))
    ]
    .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()) // Oldest first for conversation view
    .slice(-limit) // Take the most recent `limit` messages

    // Mark received messages as read if requested
    if (markAsRead) {
      const unreadMessages = receivedSnapshot.docs.filter((doc: any) => !doc.data().readAt)
      
      if (unreadMessages.length > 0) {
        const batch = adminDb.batch()
        unreadMessages.forEach((doc: any) => {
          batch.update(doc.ref, { readAt: new Date() })
        })
        await batch.commit()
        
        // Update the messages array to reflect the read status
        messages.forEach(msg => {
          if (msg.senderId === userId && msg.receiverId === user.uid && !msg.readAt) {
            msg.readAt = new Date().toISOString()
          }
        })
      }
    }

    // Get other user info
    const otherUserRecord = await adminAuth.getUser(userId)
    const otherUser = {
      uid: otherUserRecord.uid,
      email: otherUserRecord.email,
      displayName: otherUserRecord.displayName || otherUserRecord.email?.split('@')[0] || 'Unknown User'
    }

    return NextResponse.json({ 
      success: true, 
      messages,
      count: messages.length,
      participant: otherUser,
      conversationWith: userId
    })

  } catch (error) {
    console.error("Get conversation error:", error)
    return NextResponse.json(
      { 
        message: "Failed to get conversation",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
