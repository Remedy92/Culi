'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EXTRACTION_CONFIG } from '@/lib/config/extraction';

interface MenuUploadZoneProps {
  restaurantId: string;
  onUploadComplete: (menuData: {
    id: string;
    blobUrl: string;
    thumbnailUrl: string;
    enhancedUrl: string;
  }) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function MenuUploadZone({
  restaurantId,
  onUploadComplete,
  onError,
  className
}: MenuUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFile = useCallback((file: File) => {
    // Validate file type
    if (!EXTRACTION_CONFIG.UPLOAD.ALLOWED_TYPES.includes(file.type)) {
      onError?.('Please upload a JPEG, PNG, WebP, or PDF file');
      return;
    }

    // Validate file size
    if (file.size > EXTRACTION_CONFIG.UPLOAD.MAX_FILE_SIZE) {
      onError?.(`File size must be less than ${EXTRACTION_CONFIG.UPLOAD.MAX_FILE_SIZE / 1024 / 1024}MB`);
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  }, [onError]);

  const uploadFile = useCallback(async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('restaurantId', restaurantId);

      const response = await fetch('/api/menu/upload', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      setUploadProgress(100);

      // Call success callback
      onUploadComplete({
        id: data.menu.id,
        blobUrl: data.menu.blobUrl,
        thumbnailUrl: data.menu.thumbnailUrl,
        enhancedUrl: data.menu.enhancedUrl
      });

    } catch (error) {
      console.error('Upload error:', error);
      onError?.(error instanceof Error ? error.message : 'Upload failed');
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [selectedFile, restaurantId, onUploadComplete, onError]);

  const clearSelection = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'relative rounded-lg border-2 border-dashed transition-all duration-200',
          isDragging ? 'border-primary bg-primary/5' : 'border-gray-300',
          isUploading && 'pointer-events-none opacity-60'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!selectedFile) fileInputRef.current?.click();
          }
        }}
        aria-label="Upload menu file"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Select file"
        />

        <AnimatePresence mode="wait">
          {!selectedFile ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-12 text-center"
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-sm text-gray-600">
                Drag and drop your menu here, or{' '}
                <span className="text-primary font-medium">browse</span>
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Supports JPEG, PNG, WebP, and PDF up to {EXTRACTION_CONFIG.UPLOAD.MAX_FILE_SIZE / 1024 / 1024}MB
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="selected"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6"
            >
              <div className="flex items-start space-x-4">
                {previewUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Menu preview"
                      className="h-24 w-24 rounded object-cover"
                    />
                  </>
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded bg-gray-100">
                    <FileText className="h-12 w-12 text-gray-400" />
                  </div>
                )}

                <div className="flex-1">
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>

                  {isUploading ? (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <motion.div
                          className="h-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          uploadFile();
                        }}
                        className="rounded-md bg-primary px-3 py-1 text-sm font-medium text-white hover:bg-primary/90"
                        aria-label="Upload file"
                      >
                        Upload
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearSelection();
                        }}
                        className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        aria-label="Clear selection"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {!isUploading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearSelection();
                    }}
                    className="text-gray-400 hover:text-gray-500"
                    aria-label="Remove file"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Accessibility announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        {isUploading && `Upload progress: ${uploadProgress}%`}
        {selectedFile && !isUploading && `Selected file: ${selectedFile.name}`}
      </div>
    </div>
  );
}