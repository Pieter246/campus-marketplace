// Photo Upload API Route
// Handles image uploads with compression and Firebase Storage

import { NextRequest, NextResponse } from 'next/server';
import { uploadToFirebaseStorage, compressImage } from '../../../../lib/photoUpload';
import { createPhotoRecord } from '../../../../lib/photoService';

interface UploadRequest {
  imageData: string;
  fileName: string;
  type: 'item' | 'profile';
  itemId?: string;
  userId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: UploadRequest = await request.json();
    const { imageData, fileName, type, itemId, userId } = body;

    // Validate required fields
    if (!imageData || !fileName || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (type === 'item' && !itemId) {
      return NextResponse.json(
        { success: false, error: 'itemId required for item photos' },
        { status: 400 }
      );
    }

    if (type === 'profile' && !userId) {
      return NextResponse.json(
        { success: false, error: 'userId required for profile photos' },
        { status: 400 }
      );
    }

    // Convert base64 to buffer
    const base64Data = imageData.split(',')[1];
    if (!base64Data) {
      return NextResponse.json(
        { success: false, error: 'Invalid image data format' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(base64Data, 'base64');

    // Compress image
    const compressedBuffer = await compressImage(buffer);

    // Generate file path
    const timestamp = Date.now();
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
    const storagePath = type === 'profile' 
      ? `profile-photos/${userId}/${timestamp}.${fileExtension}`
      : `item-photos/${itemId}/${timestamp}.${fileExtension}`;

    // Upload to Firebase Storage
    const downloadURL = await uploadToFirebaseStorage(compressedBuffer, storagePath);

    // Create photo record in Firestore
    const photoRecord = await createPhotoRecord({
      url: downloadURL,
      fileName: `${timestamp}.${fileExtension}`,
      type,
      itemId,
      userId,
      originalFileName: fileName,
      fileSize: compressedBuffer.length
    });

    return NextResponse.json({
      success: true,
      url: downloadURL,
      photoId: photoRecord.id,
      message: 'Photo uploaded successfully'
    });

  } catch (error) {
    console.error('Photo upload error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}
