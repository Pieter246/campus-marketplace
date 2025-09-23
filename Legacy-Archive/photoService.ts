// Photo Management Service
// Handles photo upload integration with Firestore database

import { db } from './firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { deleteImage } from '../src/lib/photoUpload';

// Create a photo record in Firestore
export async function createPhotoRecord(photoData: {
  url: string;
  fileName: string;
  type: 'item' | 'profile';
  itemId?: string;
  userId?: string;
  originalFileName: string;
  fileSize: number;
}): Promise<{ id: string }> {
  try {
    const record = {
      photoId: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...photoData,
      uploadedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'photos'), record);
    return { id: docRef.id };
    
  } catch (error) {
    console.error('Error creating photo record:', error);
    throw error;
  }
}

// Add photo record to Firestore after successful upload
export async function addItemPhoto(
  itemId: string, 
  photoUrl: string, 
  photoOrder: number = 1
): Promise<string> {
  try {
    const photoData = {
      photoId: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      itemId,
      photoUrl,
      photoOrder,
      uploadedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'itemPhotos'), photoData);
    return docRef.id;
    
  } catch (error) {
    console.error('Error adding photo to database:', error);
    throw error;
  }
}

// Update user profile picture
export async function updateProfilePicture(
  userId: string, 
  photoUrl: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'userProfiles', userId), {
      profilePictureUrl: photoUrl,
      updatedAt: serverTimestamp()
    });
    
  } catch (error) {
    console.error('Error updating profile picture:', error);
    throw error;
  }
}

// Get all photos for an item
export async function getItemPhotos(itemId: string) {
  try {
    const q = query(
      collection(db, 'itemPhotos'), 
      where('itemId', '==', itemId),
      orderBy('photoOrder', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
  } catch (error) {
    console.error('Error getting item photos:', error);
    throw error;
  }
}

// Delete photo from both Storage and Firestore
export async function deleteItemPhoto(photoDocId: string, photoUrl: string): Promise<void> {
  try {
    // Delete from Firebase Storage
    await deleteImage(photoUrl);
    
    // Delete from Firestore
    await deleteDoc(doc(db, 'itemPhotos', photoDocId));
    
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
}

// Reorder item photos
export async function reorderItemPhotos(
  photoUpdates: { photoDocId: string; newOrder: number }[]
): Promise<void> {
  try {
    const updatePromises = photoUpdates.map(({ photoDocId, newOrder }) =>
      updateDoc(doc(db, 'itemPhotos', photoDocId), {
        photoOrder: newOrder,
        updatedAt: serverTimestamp()
      })
    );
    
    await Promise.all(updatePromises);
    
  } catch (error) {
    console.error('Error reordering photos:', error);
    throw error;
  }
}

// Clean up orphaned photos (photos without corresponding items)
export async function cleanupOrphanedPhotos(): Promise<number> {
  try {
    // This would need to be implemented carefully
    // Get all photos, check if their items exist, delete orphaned ones
    // For now, return 0 as placeholder
    console.warn('cleanupOrphanedPhotos not implemented yet');
    return 0;
    
  } catch (error) {
    console.error('Error cleaning up orphaned photos:', error);
    throw error;
  }
}

// Get photo usage statistics for a user
export async function getUserPhotoStats(userId: string): Promise<{
  totalPhotos: number;
  itemPhotos: number;
  profilePictures: number;
}> {
  try {
    // Get items by user
    const itemsQuery = query(
      collection(db, 'items'),
      where('sellerId', '==', userId)
    );
    const itemsSnapshot = await getDocs(itemsQuery);
    const itemIds = itemsSnapshot.docs.map(doc => doc.id);
    
    // Count photos for user's items
    let itemPhotosCount = 0;
    if (itemIds.length > 0) {
      const photosQuery = query(
        collection(db, 'itemPhotos'),
        where('itemId', 'in', itemIds.slice(0, 10)) // Firestore limit
      );
      const photosSnapshot = await getDocs(photosQuery);
      itemPhotosCount = photosSnapshot.size;
    }
    
    // Profile pictures count (0 or 1)
    const profileQuery = query(
      collection(db, 'userProfiles'),
      where('userId', '==', userId)
    );
    const profileSnapshot = await getDocs(profileQuery);
    const profilePicturesCount = profileSnapshot.docs.some(
      doc => doc.data().profilePictureUrl
    ) ? 1 : 0;
    
    return {
      totalPhotos: itemPhotosCount + profilePicturesCount,
      itemPhotos: itemPhotosCount,
      profilePictures: profilePicturesCount
    };
    
  } catch (error) {
    console.error('Error getting photo stats:', error);
    return { totalPhotos: 0, itemPhotos: 0, profilePictures: 0 };
  }
}

// Upload multiple photos for an item and save to database
export async function uploadAndSaveItemPhotos(
  itemId: string,
  photoUrls: string[]
): Promise<string[]> {
  try {
    const savePromises = photoUrls.map((url, index) =>
      addItemPhoto(itemId, url, index + 1)
    );
    
    return await Promise.all(savePromises);
    
  } catch (error) {
    console.error('Error saving item photos to database:', error);
    throw error;
  }
}

// Complete photo upload workflow for items
export async function completeItemPhotoUpload(
  itemId: string,
  photoUrls: string[]
): Promise<{ photoDocIds: string[]; success: boolean }> {
  try {
    // Update item document with new image URLs
    await updateDoc(doc(db, 'items', itemId), {
      images: photoUrls,
      updatedAt: serverTimestamp()
    });

    // Save photo records to database (optional - for detailed tracking)
    const photoDocIds = await uploadAndSaveItemPhotos(itemId, photoUrls);
    
    return { photoDocIds, success: true };
    
  } catch (error) {
    console.error('Error completing photo upload:', error);
    return { photoDocIds: [], success: false };
  }
}

// Complete photo upload workflow for profile
export async function completeProfilePhotoUpload(
  userId: string,
  photoUrl: string
): Promise<{ success: boolean }> {
  try {
    await updateProfilePicture(userId, photoUrl);
    return { success: true };
    
  } catch (error) {
    console.error('Error completing profile photo upload:', error);
    return { success: false };
  }
}
