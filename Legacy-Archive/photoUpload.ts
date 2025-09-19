// Photo Upload Service for Firebase Storage
// Handles image upload, compression, and storage management

import { storage } from './firebase';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  uploadBytesResumable,
  UploadTaskSnapshot 
} from 'firebase/storage';

// Server-side image compression for API routes
export async function compressImage(buffer: Buffer): Promise<Buffer> {
  // For server-side, we'll do basic processing
  // In a production app, you'd use Sharp or similar
  // For now, return the buffer as-is and rely on client compression
  return buffer;
}

// Upload to Firebase Storage from server
export async function uploadToFirebaseStorage(buffer: Buffer, storagePath: string): Promise<string> {
  try {
    const storageRef = ref(storage, storagePath);
    const snapshot = await uploadBytes(storageRef, buffer);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Error uploading to Firebase Storage:', error);
    throw error;
  }
}

// Browser-side compression using Canvas
function compressImageBrowser(file: File, maxWidth: number = 800, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          resolve(new Blob());
        }
      }, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
}

// Validate image file
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Only JPEG, PNG, and WebP images are allowed' 
    };
  }
  
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: 'Image must be less than 5MB' 
    };
  }
  
  return { valid: true };
}

// Generate storage path for item photos
export function generatePhotoPath(itemId: string, fileName: string): string {
  const timestamp = Date.now();
  const fileExtension = fileName.split('.').pop();
  return `items/${itemId}/${timestamp}.${fileExtension}`;
}

// Generate storage path for profile pictures
export function generateProfilePicturePath(userId: string, fileName: string): string {
  const timestamp = Date.now();
  const fileExtension = fileName.split('.').pop();
  return `profiles/${userId}/${timestamp}.${fileExtension}`;
}

// Upload single image with compression
export async function uploadImage(
  file: File, 
  storagePath: string,
  options: {
    compress?: boolean;
    maxWidth?: number;
    quality?: number;
    onProgress?: (progress: number) => void;
  } = {}
): Promise<string> {
  try {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Compress image if requested
    let uploadFile: File | Blob = file;
    if (options.compress !== false) {
      uploadFile = await compressImageBrowser(
        file, 
        options.maxWidth || 800, 
        options.quality || 0.8
      );
    }

    // Create storage reference
    const storageRef = ref(storage, storagePath);
    
    // Upload with progress tracking
    if (options.onProgress) {
      const uploadTask = uploadBytesResumable(storageRef, uploadFile);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot: UploadTaskSnapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            options.onProgress!(progress);
          },
          (error) => reject(error),
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    } else {
      // Simple upload without progress
      const snapshot = await uploadBytes(storageRef, uploadFile);
      return await getDownloadURL(snapshot.ref);
    }
    
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// Upload multiple images for an item
export async function uploadItemPhotos(
  itemId: string,
  files: File[],
  options: {
    onProgress?: (fileIndex: number, progress: number) => void;
    onComplete?: (fileIndex: number, url: string) => void;
  } = {}
): Promise<string[]> {
  try {
    const uploadPromises = files.map(async (file, index) => {
      const storagePath = generatePhotoPath(itemId, file.name);
      
      const url = await uploadImage(file, storagePath, {
        compress: true,
        maxWidth: 800,
        quality: 0.8,
        onProgress: (progress) => {
          options.onProgress?.(index, progress);
        }
      });
      
      options.onComplete?.(index, url);
      return url;
    });

    return await Promise.all(uploadPromises);
    
  } catch (error) {
    console.error('Error uploading item photos:', error);
    throw error;
  }
}

// Upload profile picture
export async function uploadProfilePicture(
  userId: string,
  file: File,
  options: {
    onProgress?: (progress: number) => void;
  } = {}
): Promise<string> {
  try {
    const storagePath = generateProfilePicturePath(userId, file.name);
    
    return await uploadImage(file, storagePath, {
      compress: true,
      maxWidth: 300,
      quality: 0.9,
      onProgress: options.onProgress
    });
    
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
}

// Delete image from storage
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // Extract storage path from URL
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
    
    if (!pathMatch) {
      throw new Error('Invalid Firebase Storage URL');
    }
    
    const storagePath = decodeURIComponent(pathMatch[1]);
    const storageRef = ref(storage, storagePath);
    
    await deleteObject(storageRef);
    
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

// Get storage usage for a user (items + profile)
export async function getUserStorageUsage(): Promise<number> {
  // Note: Firebase doesn't provide direct storage usage API
  // This would need to be tracked in Firestore or implement custom solution
  // For now, return 0 - implement tracking in your database
  return 0;
}

// Storage limits and configurations
export const STORAGE_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_PHOTOS_PER_ITEM: 5,
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  COMPRESSION: {
    ITEM_PHOTOS: { maxWidth: 800, quality: 0.8 },
    PROFILE_PICTURES: { maxWidth: 300, quality: 0.9 },
    THUMBNAILS: { maxWidth: 200, quality: 0.7 }
  }
};

// Helper to create thumbnail
export async function createThumbnail(file: File): Promise<Blob> {
  return compressImageBrowser(
    file, 
    STORAGE_LIMITS.COMPRESSION.THUMBNAILS.maxWidth,
    STORAGE_LIMITS.COMPRESSION.THUMBNAILS.quality
  );
}
