// Photo Upload Component
// Reusable component for uploading photos with preview and progress

'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { validateImageFile, STORAGE_LIMITS } from '../lib/photoUpload';

interface PhotoUploadProps {
  type: 'item' | 'profile';
  itemId?: string;
  userId?: string;
  maxPhotos?: number;
  onUploadSuccess?: (urls: string[]) => void;
  onUploadError?: (error: string) => void;
  existingPhotos?: string[];
  className?: string;
}

interface UploadedPhoto {
  file: File;
  preview: string;
  url?: string;
  uploading?: boolean;
  progress?: number;
  error?: string;
}

export default function PhotoUpload({
  type,
  itemId,
  userId,
  maxPhotos = type === 'profile' ? 1 : STORAGE_LIMITS.MAX_PHOTOS_PER_ITEM,
  onUploadSuccess,
  onUploadError,
  existingPhotos = [],
  className = ''
}: PhotoUploadProps) {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // Check if adding files would exceed limit
    const totalPhotos = existingPhotos.length + photos.length + files.length;
    if (totalPhotos > maxPhotos) {
      onUploadError?.(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    // Validate and add files
    const newPhotos: UploadedPhoto[] = [];
    
    for (const file of files) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        onUploadError?.(validation.error || 'Invalid file');
        continue;
      }

      const preview = URL.createObjectURL(file);
      newPhotos.push({ file, preview });
    }

    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const uploadPhoto = async (photo: UploadedPhoto): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const imageData = reader.result as string;
          
          const response = await fetch('/api/photos/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageData,
              fileName: photo.file.name,
              type,
              itemId,
              userId
            }),
          });

          const data = await response.json();
          
          if (data.success) {
            resolve(data.url);
          } else {
            reject(new Error(data.error || 'Upload failed'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(photo.file);
    });
  };

  const uploadAllPhotos = async () => {
    if (photos.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        
        // Update photo state to show uploading
        setPhotos(prev => {
          const updated = [...prev];
          updated[i] = { ...updated[i], uploading: true, progress: 0 };
          return updated;
        });

        try {
          const url = await uploadPhoto(photo);
          uploadedUrls.push(url);
          
          // Update photo state to show success
          setPhotos(prev => {
            const updated = [...prev];
            updated[i] = { ...updated[i], url, uploading: false, progress: 100 };
            return updated;
          });
        } catch (error) {
          // Update photo state to show error
          setPhotos(prev => {
            const updated = [...prev];
            updated[i] = { 
              ...updated[i], 
              uploading: false, 
              error: error instanceof Error ? error.message : 'Upload failed' 
            };
            return updated;
          });
        }
      }

      if (uploadedUrls.length > 0) {
        onUploadSuccess?.(uploadedUrls);
      }

    } catch (error) {
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const canAddMorePhotos = existingPhotos.length + photos.length < maxPhotos;

  return (
    <div className={`photo-upload ${className}`}>
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={STORAGE_LIMITS.ALLOWED_TYPES.join(',')}
        multiple={type === 'item' && maxPhotos > 1}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Button */}
      {canAddMorePhotos && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-4 disabled:opacity-50"
        >
          {type === 'profile' ? 'Choose Profile Picture' : 'Add Photos'}
          <span className="text-sm text-gray-200 ml-2">
            ({existingPhotos.length + photos.length}/{maxPhotos})
          </span>
        </button>
      )}

      {/* Photo Previews */}
      {photos.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative">
                <Image
                  src={photo.preview}
                  alt={`Preview ${index + 1}`}
                  width={200}
                  height={128}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                
                {/* Remove Button */}
                {!photo.uploading && (
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                )}

                {/* Upload Status */}
                {photo.uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                    <div className="text-white text-sm">Uploading...</div>
                  </div>
                )}

                {photo.error && (
                  <div className="absolute inset-0 bg-red-500 bg-opacity-75 rounded-lg flex items-center justify-center">
                    <div className="text-white text-xs text-center p-2">{photo.error}</div>
                  </div>
                )}

                {photo.url && (
                  <div className="absolute inset-0 bg-green-500 bg-opacity-75 rounded-lg flex items-center justify-center">
                    <div className="text-white text-sm">Uploaded</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Upload All Button */}
          {photos.some(p => !p.url && !p.error) && (
            <button
              type="button"
              onClick={uploadAllPhotos}
              disabled={uploading}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Photos'}
            </button>
          )}
        </div>
      )}

      {/* Existing Photos */}
      {existingPhotos.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Current Photos</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {existingPhotos.map((url, index) => (
              <Image
                key={index}
                src={url}
                alt={`Current ${index + 1}`}
                width={200}
                height={128}
                className="w-full h-32 object-cover rounded-lg border"
              />
            ))}
          </div>
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="mt-4 text-xs text-gray-500">
        <p>• Maximum file size: {STORAGE_LIMITS.MAX_FILE_SIZE / 1024 / 1024}MB</p>
        <p>• Supported formats: JPEG, PNG, WebP</p>
        {type === 'item' && <p>• Maximum {maxPhotos} photos per item</p>}
      </div>
    </div>
  );
}
