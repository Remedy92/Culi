'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

import { CuliCurveLogo } from '@/app/components/CuliCurveLogo'
import { Button } from '@/components/ui/button'
import { FileUpload } from '@/components/ui/file-upload'
import { AnimatedModal } from '@/components/ui/animated-modal'
import { AnalysisProgressModal } from './components/AnalysisProgressModal'
import { EXTRACTION_CONFIG } from '@/lib/config/extraction'
import { FileText, Sparkles, QrCode, CheckCircle } from 'lucide-react'

type Step = 'upload' | 'extracting' | 'complete'


interface MenuUploadClientProps {
  restaurantId: string
  locale: string
}


export default function MenuUploadClient({ restaurantId, locale }: MenuUploadClientProps) {
  const [currentStep, setCurrentStep] = useState<Step>('upload')
  const [isExtracting, setIsExtracting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showModal, setShowModal] = useState(true)
  const [extractionError, setExtractionError] = useState<string | undefined>()
  const router = useRouter()
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      localStorage.removeItem('lastMenuId')
    }
  }, [])

  const handleFileChange = (files: File[]) => {
    if (files.length === 0) return
    
    const file = files[0]
    // Validation is now handled by FileUpload component
    setSelectedFile(file)
  }

  const uploadFile = async () => {
    if (!selectedFile || !restaurantId) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('restaurantId', restaurantId)

      const response = await fetch('/api/menu/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await response.json()
      
      // Start extraction animation after successful upload
      setIsUploading(false)
      setIsExtracting(true)
      setExtractionError(undefined)
      setCurrentStep('extracting')
      
      // Validate URLs exist
      if (!data.menu?.thumbnailUrl) {
        throw new Error('Missing thumbnail URL from upload response')
      }
      
      // Start extraction process
      try {
        const extractResponse = await fetch('/api/menu/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            menuId: data.menu.id,
            restaurantId: restaurantId,
            thumbnailUrl: data.menu.thumbnailUrl,
            enhancedUrl: data.menu.enhancedUrl || data.menu.thumbnailUrl
          })
        })

        if (!extractResponse.ok) {
          const error = await extractResponse.json()
          throw new Error(error.error || 'Extraction failed')
        }

        const extractData = await extractResponse.json()
        
        console.log('Extraction response:', extractData)
        
        // Verify extraction was saved
        if (!extractData.hasExtractedData) {
          throw new Error('Extraction completed but data was not saved properly')
        }
        
        // Show any warnings as non-blocking toasts
        if (extractData.warnings?.length > 0) {
          extractData.warnings.forEach((warning: string) => {
            toast.warning(warning)
          })
        }
        
        // Store menu ID for navigation
        localStorage.setItem('lastMenuId', data.menu.id)
        
        // Show success toast with metrics
        const itemCount = extractData.metrics?.itemsExtracted || 0
        const confidence = extractData.metrics?.confidence || 0
        toast.success(`Menu analysis complete! Found ${itemCount} items (${confidence}% confidence)`)
        
        // Navigate after a brief delay to show success state
        // Don't rely on modal callback - navigate directly
        setTimeout(() => {
          console.log('Navigating to validation page with menuId:', data.menu.id)
          setIsExtracting(false)
          router.push(`/${locale}/dashboard/menu/validate?menuId=${data.menu.id}`)
        }, 1500) // Show success animation briefly
        
      } catch (extractError) {
        console.error('Extraction error:', extractError)
        const errorMessage = extractError instanceof Error ? extractError.message : 'AI analysis failed. Please try again.'
        setExtractionError(errorMessage)
        toast.error(errorMessage)
        setIsExtracting(false)
        setCurrentStep('upload')
      }
      
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Upload failed')
      setIsUploading(false)
      setIsExtracting(false)
      setCurrentStep('upload')
    }
  }

  const handleSkip = () => {
    localStorage.setItem('menuUploadSkipped', 'true')
    router.push(`/${locale}/dashboard`)
  }
  
  const handleRetryExtraction = () => {
    setExtractionError(undefined)
    if (selectedFile) {
      uploadFile()
    }
  }

  // Check if modal was already shown/skipped
  useEffect(() => {
    const hasSkipped = localStorage.getItem('menuUploadSkipped')
    if (hasSkipped) {
      setShowModal(false)
    }
  }, [])

  return (
    <>
      <AnalysisProgressModal
        open={isExtracting}
        error={extractionError}
        onRetry={handleRetryExtraction}
      />

      {/* Welcome Modal */}
      <AnimatedModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Get your menu on Culi"
        description="AI-powered menu assistant in minutes"
        showCloseButton={false}
      >
        <div className="space-y-4">
          {/* Process Steps - Minimalist */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-9 h-9 bg-spanish-orange/10 rounded-full flex items-center justify-center">
                <FileText className="w-4.5 h-4.5 text-spanish-orange" />
              </div>
              <p className="text-sm font-medium text-eerie-black">Upload menu</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-9 h-9 bg-spanish-orange/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-4.5 h-4.5 text-spanish-orange" />
              </div>
              <p className="text-sm font-medium text-eerie-black">AI extracts content</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-9 h-9 bg-spanish-orange/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4.5 h-4.5 text-spanish-orange" />
              </div>
              <p className="text-sm font-medium text-eerie-black">Review & edit</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-9 h-9 bg-spanish-orange/10 rounded-full flex items-center justify-center">
                <QrCode className="w-4.5 h-4.5 text-spanish-orange" />
              </div>
              <p className="text-sm font-medium text-eerie-black">Get QR code</p>
            </div>
          </div>

          {/* Action Buttons - Smaller */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => setShowModal(false)}
              className="flex-1 bg-spanish-orange hover:bg-spanish-orange/90"
              size="default"
            >
              Get Started
            </Button>
            <Button
              onClick={handleSkip}
              variant="outline"
              className="flex-1"
              size="default"
            >
              Skip for now
            </Button>
          </div>
        </div>
      </AnimatedModal>
      
      <div className="min-h-screen bg-seasalt">
        <div>
          {/* Header - matching onboarding style */}
          <div className="w-full py-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 sm:gap-3"
            >
              <CuliCurveLogo size={32} className="sm:w-9 sm:h-9" />
              <div className="relative">
                <span className="text-2xl sm:text-3xl font-black text-eerie-black">
                  <span className="text-3xl sm:text-4xl font-serif">C</span>uli
                </span>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="max-w-container-wide mx-auto px-4">
            <AnimatePresence mode="wait">
              {/* Upload Step - Now the default step */}
              {currentStep === 'upload' && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="py-8 max-w-container-narrow mx-auto"
                >
                  {/* Page Context */}
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-semibold text-eerie-black mb-2">
                      Add your menu
                    </h1>
                    <p className="text-base text-gray-600">
                      Upload your menu to get started with Culi
                    </p>
                  </div>

                  <FileUpload 
                    onChange={handleFileChange}
                    onRemove={() => {
                      setSelectedFile(null)
                    }}
                    value={selectedFile}
                    accept={{
                      'image/jpeg': ['.jpg', '.jpeg'],
                      'image/png': ['.png'],
                      'image/webp': ['.webp'],
                      'application/pdf': ['.pdf']
                    }}
                    maxSize={EXTRACTION_CONFIG.UPLOAD.MAX_FILE_SIZE}
                    loading={isUploading}
                  />
                  
                  {selectedFile && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 text-center"
                    >
                      <Button
                        onClick={uploadFile}
                        className="bg-eerie-black hover:bg-eerie-black/90 text-white"
                        size="lg"
                        disabled={isUploading}
                      >
                        {isUploading ? 'Uploading...' : 'Start AI analysis'}
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  )
}