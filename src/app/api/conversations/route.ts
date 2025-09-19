// src/app/api/conversations/route.ts
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

// GET - Get user's conversations (grouped by other participant)
export async function GET(req: NextRequest) {
  try {
    // Authenticate the request
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50) // Max 50 conversations

    // Get all messages where user is sender or receiver
    const [sentSnapshot, receivedSnapshot] = await Promise.all([
      adminDb.collection("messages")
        .where("senderId", "==", user.uid)
        .orderBy("sentAt", "desc")
        .get(),
      adminDb.collection("messages")
        .where("receiverId", "==", user.uid)
        .orderBy("sentAt", "desc")
        .get()
    ])

    // Combine and sort all messages
    const allMessages = [
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
    ].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())

    // Group messages by conversation partner
    const conversationsMap = new Map()

    for (const message of allMessages) {
      // Determine the other participant
      const otherParticipant = message.senderId === user.uid ? message.receiverId : message.senderId
      
      if (!conversationsMap.has(otherParticipant)) {
        // Get participant details
        let participantInfo = null
        try {
          const userRecord = await adminAuth.getUser(otherParticipant)
          participantInfo = {
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName || userRecord.email?.split('@')[0] || 'Unknown User'
          }
        } catch (error) {
          participantInfo = {
            uid: otherParticipant,
            email: 'Unknown',
            displayName: 'Unknown User'
          }
        }

        // Count unread messages from this participant
        const unreadCount = allMessages.filter(msg => 
          msg.senderId === otherParticipant && 
          msg.receiverId === user.uid && 
          !msg.readAt
        ).length

        conversationsMap.set(otherParticipant, {
          participantId: otherParticipant,
          participant: participantInfo,
          lastMessage: message,
          unreadCount,
          messages: [message]
        })
      } else {
        // Add message to existing conversation
        conversationsMap.get(otherParticipant).messages.push(message)
      }
    }

    // Convert to array and sort by last message time
    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.lastMessage.sentAt).getTime() - new Date(a.lastMessage.sentAt).getTime())
      .slice(0, limit)
      .map(conv => ({
        ...conv,
        messageCount: conv.messages.length,
        messages: undefined // Don't send all messages, just the summary
      }))

    return NextResponse.json({ 
      success: true, 
      conversations,
      count: conversations.length
    })

  } catch (error) {
    console.error("Get conversations error:", error)
    return NextResponse.json(
      { 
        message: "Failed to get conversations",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
