# Photo Upload and Storage Guide

## Overview
The campus marketplace handles photo uploads and storage using Firebase Storage with automatic compression, validation, and database integration.

## Architecture

### Storage Structure
```
Firebase Storage
├── items/
│   ├── {itemId}/
│   │   ├── {timestamp}.jpg
│   │   └── {timestamp}.jpg
└── profiles/
    ├── {userId}/
    │   └── {timestamp}.jpg
```

### Database Integration
- **itemPhotos** collection stores metadata for item photos
- **userProfiles** collection stores profile picture URLs
- Automatic cleanup and validation

## Components

### 1. PhotoUpload Component
**Location**: `src/components/PhotoUpload.tsx`

Reusable React component for photo uploads with:
- Drag & drop interface
- Preview functionality
- Progress tracking
- Validation and error handling
- Support for multiple photos (items) or single photo (profile)

**Usage**:
```tsx
// For item photos
<PhotoUpload
  type="item"
  itemId="item-123"
  maxPhotos={5}
  onUploadSuccess={(urls) => console.log('Uploaded:', urls)}
  onUploadError={(error) => console.log('Error:', error)}
/>

// For profile picture
<PhotoUpload
  type="profile"
  userId="user-123"
  maxPhotos={1}
  onUploadSuccess={(urls) => console.log('Profile updated:', urls[0])}
/>
```

### 2. Photo Upload Service
**Location**: `src/lib/photoUpload.ts`

Core service handling:
- Image compression (configurable quality/size)
- File validation (type, size limits)
- Firebase Storage upload
- Storage path generation
- Progress tracking

### 3. Photo Management Service
**Location**: `src/lib/photoService.ts`

Database integration service:
- Saving photo metadata to Firestore
- Retrieving item photos
- Managing photo order
- Cleanup operations
- Usage statistics

### 4. API Endpoints
**Location**: `src/pages/api/photos/upload.ts`

REST API for photo uploads:
- **POST** `/api/photos/upload` - Upload single photo
- Handles base64 image data
- Validates files server-side
- Returns download URLs

## Configuration

### Storage Limits
```typescript
const STORAGE_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_PHOTOS_PER_ITEM: 5,
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  COMPRESSION: {
    ITEM_PHOTOS: { maxWidth: 800, quality: 0.8 },
    PROFILE_PICTURES: { maxWidth: 300, quality: 0.9 },
    THUMBNAILS: { maxWidth: 200, quality: 0.7 }
  }
};
```

### Security Rules
**Location**: `storage.rules`

Firebase Storage security rules:
- Authenticated users can read all images
- Users can only upload to their own items/profile
- File type and size validation
- 5MB per file limit

## Implementation Examples

### 1. Adding Photos to New Item
```typescript
// When creating a new item
const handleCreateItem = async (itemData: any, photos: File[]) => {
  // 1. Create item in Firestore
  const itemRef = await addDoc(collection(db, 'items'), itemData);
  
  // 2. Upload photos
  const photoUrls = await uploadItemPhotos(itemRef.id, photos);
  
  // 3. Save photo metadata
  await uploadAndSaveItemPhotos(itemRef.id, photoUrls);
};
```

### 2. Updating Profile Picture
```typescript
const handleProfilePictureUpload = async (file: File, userId: string) => {
  // 1. Upload to storage
  const photoUrl = await uploadProfilePicture(userId, file);
  
  // 2. Update user profile
  await updateProfilePicture(userId, photoUrl);
};
```

### 3. Managing Item Photos
```typescript
// Get photos for display
const photos = await getItemPhotos(itemId);

// Delete a photo
await deleteItemPhoto(photoDocId, photoUrl);

// Reorder photos
await reorderItemPhotos([
  { photoDocId: 'doc1', newOrder: 1 },
  { photoDocId: 'doc2', newOrder: 2 }
]);
```

## Best Practices

### 1. Client-Side Optimization
- **Compress before upload**: Reduce file size automatically
- **Show previews**: Let users see images before uploading
- **Progress feedback**: Display upload progress
- **Error handling**: Clear error messages for users

### 2. Server-Side Validation
- **File type checking**: Only allow image formats
- **Size limits**: Enforce maximum file sizes
- **Rate limiting**: Prevent abuse (implement if needed)
- **Authentication**: Verify user permissions

### 3. Storage Management
- **Organized structure**: Use consistent folder structure
- **Metadata tracking**: Store photo info in Firestore
- **Cleanup procedures**: Remove orphaned files
- **Performance**: Use appropriate compression settings

### 4. Security Considerations
- **User permissions**: Users can only modify their own content
- **Input validation**: Validate all file inputs
- **Storage rules**: Enforce rules at Firebase level
- **Content moderation**: Consider implementing if needed

## Troubleshooting

### Common Issues

1. **Upload fails silently**
   - Check Firebase project configuration
   - Verify Storage rules are deployed
   - Ensure user is authenticated

2. **Images not displaying**
   - Check download URLs are public
   - Verify CORS settings in Firebase
   - Check browser network tab for errors

3. **File size errors**
   - Verify compression is working
   - Check STORAGE_LIMITS configuration
   - Ensure client-side validation matches server

4. **Permission errors**
   - Check Firebase Storage rules
   - Verify user authentication
   - Ensure itemId/userId ownership

### Development Testing
```bash
# Start development server
npm run dev

# Test photo upload endpoint
curl -X POST http://localhost:3000/api/photos/upload \
  -H "Content-Type: application/json" \
  -d '{
    "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...",
    "fileName": "test.jpg",
    "type": "item",
    "itemId": "test-item-id"
  }'
```

## Deployment

### Firebase Storage Rules
```bash
# Deploy storage rules
firebase deploy --only storage
```

### Environment Variables
Ensure these are set in `.env.local`:
```
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket-name
```

## Future Enhancements

1. **Image Processing Pipeline**
   - Automatic thumbnail generation
   - Multiple sizes for responsive images
   - Format optimization (WebP conversion)

2. **Advanced Features**
   - Drag & drop photo reordering
   - Bulk photo operations
   - Image editing capabilities
   - Photo tagging and search

3. **Performance Optimizations**
   - CDN integration
   - Lazy loading
   - Progressive image loading
   - Caching strategies
