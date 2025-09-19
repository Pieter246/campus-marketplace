// src/app/api/messages/[messageId]/route.ts
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

// PUT - Mark message as read
export async function PUT(
  req: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    // Authenticate the request
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { messageId } = params

    // Get the message
    const messageDoc = await adminDb.collection("messages").doc(messageId).get()
    
    if (!messageDoc.exists) {
      return NextResponse.json({ 
        message: "Message not found" 
      }, { status: 404 })
    }

    const messageData = messageDoc.data()

    // Verify user is the receiver of this message
    if (messageData?.receiverId !== user.uid) {
      return NextResponse.json({ 
        message: "You can only mark your own received messages as read" 
      }, { status: 403 })
    }

    // Mark as read if not already read
    if (!messageData.readAt) {
      await messageDoc.ref.update({
        readAt: new Date()
      })
    }

    return NextResponse.json({
      success: true,
      message: "Message marked as read",
      messageId,
      readAt: new Date().toISOString()
    })

  } catch (error) {
    console.error("Mark message as read error:", error)
    return NextResponse.json(
      { 
        message: "Failed to mark message as read",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete message (only sender can delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    // Authenticate the request
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { messageId } = params

    // Get the message
    const messageDoc = await adminDb.collection("messages").doc(messageId).get()
    
    if (!messageDoc.exists) {
      return NextResponse.json({ 
        message: "Message not found" 
      }, { status: 404 })
    }

    const messageData = messageDoc.data()

    // Verify user is the sender of this message
    if (messageData?.senderId !== user.uid) {
      return NextResponse.json({ 
        message: "You can only delete your own sent messages" 
      }, { status: 403 })
    }

    // Delete the message
    await messageDoc.ref.delete()

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully",
      messageId
    })

  } catch (error) {
    console.error("Delete message error:", error)
    return NextResponse.json(
      { 
        message: "Failed to delete message",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
