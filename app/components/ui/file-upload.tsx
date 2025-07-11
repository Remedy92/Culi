"use client"

import React, { useCallback } from "react"
import { useDropzone, FileRejection } from "react-dropzone"
import { Upload, X, File, FileText, Image } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onChange?: (files: File[]) => void
  onRemove?: () => void
  className?: string
  accept?: Record<string, string[]>
  maxSize?: number
  multiple?: boolean
  value?: File | null
}

export function FileUpload({
  onChange,
  onRemove,
  className,
  accept,
  maxSize,
  multiple = false,
  value,
}: FileUploadProps) {
  const [error, setError] = React.useState<string | null>(null)
  const [isHovered, setIsHovered] = React.useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setError(null)
      
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0]
        if (rejection.errors[0]?.code === "file-too-large") {
          setError(`File size must be less than ${maxSize ? maxSize / 1024 / 1024 : 10}MB`)
        } else if (rejection.errors[0]?.code === "file-invalid-type") {
          setError("Invalid file type")
        } else {
          setError("Failed to upload file")
        }
        return
      }

      if (acceptedFiles.length > 0) {
        onChange?.(acceptedFiles)
      }
    },
    [onChange, maxSize]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
  })

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-5 h-5 text-gray-600" aria-hidden="true" alt="" />
    }
    if (file.type === 'application/pdf') {
      return <FileText className="w-5 h-5 text-gray-600" aria-hidden="true" />
    }
    return <File className="w-5 h-5 text-gray-600" aria-hidden="true" />
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRemove?.()
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        tabIndex={0}
        aria-label={value ? `Selected file: ${value.name}. Press Enter to change or Delete to remove` : "Upload area. Click or drag a file here to upload"}
        aria-describedby={error ? "file-upload-error" : "file-upload-description"}
        className={cn(
          "relative border-2 rounded-lg p-6 transition-all cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-spanish-orange focus:ring-offset-2",
          !value && (
            isDragActive
              ? "border-spanish-orange bg-spanish-orange/5 border-dashed"
              : "border-gray-200 hover:border-gray-300 bg-gray-50 border-dashed"
          ),
          value && "border-gray-200 bg-white hover:border-gray-300 border-solid",
          error && "border-red-300"
        )}
      >
        <input {...getInputProps()} aria-hidden="true" />
        
        {!value ? (
          // Empty state - Drop zone
          <div className="flex flex-col items-center">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors",
              isDragActive ? "bg-spanish-orange/10" : "bg-gray-100"
            )}>
              <Upload className={cn(
                "w-6 h-6 transition-colors",
                isDragActive ? "text-spanish-orange" : "text-gray-600"
              )} />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              {isDragActive ? "Drop your file here" : "Click to upload or drag and drop"}
            </p>
            <p id="file-upload-description" className="text-xs text-gray-600">
              PDF, JPG, PNG or WebP (max {maxSize ? maxSize / 1024 / 1024 : 10}MB)
            </p>
          </div>
        ) : (
          // File selected state - Replace entire drop zone
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-50 rounded flex items-center justify-center flex-shrink-0">
                {getFileIcon(value)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {value.name}
                </p>
                <p className="text-xs text-gray-600">
                  {(value.size / 1024 / 1024).toFixed(2)} MB
                  {isHovered && <span className="ml-2">• Click to change file</span>}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-spanish-orange focus:ring-offset-2"
              aria-label="Remove file"
              type="button"
            >
              <X className="w-4 h-4 text-gray-600" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <p id="file-upload-error" className="mt-2 text-sm text-red-600 text-center" role="alert">
          {error}
        </p>
      )}
      
      {/* Live region for screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {value && `File selected: ${value.name}, ${(value.size / 1024 / 1024).toFixed(2)} MB`}
      </div>
    </div>
  )
}