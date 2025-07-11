'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Sparkles as SparklesIcon, Check, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

import { CuliCurveLogo, CuliLogoLoading } from '@/app/components/CuliCurveLogo'
import { TextGenerateEffect } from '@/app/components/ui/text-generate-effect'
import { HoverBorderGradient } from '@/app/components/ui/hover-border-gradient'
import { Sparkles } from '@/app/components/ui/sparkles'
import { BackgroundBeams } from '@/app/components/ui/background-beams'
import { Spotlight } from '@/app/components/ui/spotlight'
import { Button } from '@/app/components/ui/button'
import { cn } from '@/lib/utils'
import { EXTRACTION_CONFIG } from '@/lib/config/extraction'

type Step = 'welcome' | 'upload' | 'extracting' | 'complete'

interface MenuData {
  id: string
  blobUrl: string
  thumbnailUrl: string
  enhancedUrl: string
}

interface MenuUploadClientProps {
  restaurantId: string
  locale: string
}

export default function MenuUploadClient({ restaurantId, locale }: MenuUploadClientProps) {
  const [currentStep, setCurrentStep] = useState<Step>('welcome')
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [, setMenuData] = useState<MenuData | null>(null)
  const [showSparkles, setShowSparkles] = useState(false)
  
  const router = useRouter()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = (file: File) => {
    // Validate file
    if (!EXTRACTION_CONFIG.UPLOAD.ALLOWED_TYPES.includes(file.type as typeof EXTRACTION_CONFIG.UPLOAD.ALLOWED_TYPES[number])) {
      toast.error('Please upload a JPEG, PNG, WebP, or PDF file')
      return
    }

    if (file.size > EXTRACTION_CONFIG.UPLOAD.MAX_FILE_SIZE) {
      toast.error(`File size must be less than ${EXTRACTION_CONFIG.UPLOAD.MAX_FILE_SIZE / 1024 / 1024}MB`)
      return
    }

    setSelectedFile(file)
    
    // Create preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadFile = async () => {
    if (!selectedFile || !restaurantId || isUploading) return

    setIsUploading(true)
    setShowSparkles(true)

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
      setMenuData({
        id: data.menu.id,
        blobUrl: data.menu.blobUrl,
        thumbnailUrl: data.menu.thumbnailUrl,
        enhancedUrl: data.menu.enhancedUrl
      })

      // Move to extraction step
      setCurrentStep('extracting')
      
      // Auto-navigate to validation after a brief moment
      setTimeout(() => {
        router.push(`/${locale}/dashboard/menu/validate?menuId=${data.menu.id}`)
      }, 2000)
      
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Upload failed')
      setIsUploading(false)
      setShowSparkles(false)
    }
  }

  return (
    <div className="min-h-screen bg-seasalt relative overflow-hidden">
      {/* Background Effects */}
      <BackgroundBeams className="opacity-30" />
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="var(--spanish-orange)" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="py-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3"
          >
            <CuliCurveLogo size={40} />
            <h1 className="text-2xl font-black text-eerie-black">
              Menu Upload
            </h1>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4">
          <AnimatePresence mode="wait">
            {/* Welcome Step */}
            {currentStep === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-16"
              >
                <div className="mb-8">
                  <TextGenerateEffect
                    words="Let's add your menu to Culi's AI brain"
                    className="text-3xl font-bold text-eerie-black"
                  />
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 }}
                >
                  <HoverBorderGradient
                    containerClassName="rounded-full"
                    className="px-8 py-4 text-lg font-medium"
                    onClick={() => setCurrentStep('upload')}
                  >
                    <span className="flex items-center gap-2">
                      Get Started
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </HoverBorderGradient>
                </motion.div>
              </motion.div>
            )}

            {/* Upload Step */}
            {currentStep === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="py-8"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-eerie-black mb-2">
                    Upload Your Menu
                  </h2>
                  <p className="text-cinereous">
                    Drag and drop or click to browse
                  </p>
                </div>

                <div className="relative">
                  {showSparkles && (
                    <Sparkles
                      className="absolute inset-0 z-0"
                      particleColor="var(--spanish-orange)"
                      particleDensity={30}
                      minSize={0.8}
                      maxSize={1.5}
                    />
                  )}
                  
                  <div
                    className={cn(
                      'relative z-10 rounded-2xl border-2 border-dashed transition-all duration-300',
                      'bg-white/80 backdrop-blur-sm',
                      isDragging ? 'border-spanish-orange bg-spanish-orange/5' : 'border-gray-300',
                      isUploading && 'pointer-events-none opacity-60'
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-input"
                      disabled={isUploading}
                    />
                    
                    {!selectedFile ? (
                      <label
                        htmlFor="file-input"
                        className="block p-16 text-center cursor-pointer"
                      >
                        <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                        <p className="text-lg text-gray-600 mb-2">
                          Drop your menu here
                        </p>
                        <p className="text-sm text-gray-500">
                          or click to browse
                        </p>
                        <p className="mt-4 text-xs text-gray-400">
                          Supports JPEG, PNG, WebP, and PDF up to 10MB
                        </p>
                      </label>
                    ) : (
                      <div className="p-8">
                        <div className="flex items-center gap-6">
                          {previewUrl && (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={previewUrl}
                                alt="Menu preview"
                                className="h-32 w-32 rounded-lg object-cover shadow-warm"
                              />
                            </>
                          )}
                          
                          <div className="flex-1">
                            <p className="font-semibold text-lg text-eerie-black">
                              {selectedFile.name}
                            </p>
                            <p className="text-sm text-cinereous mt-1">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            
                            {!isUploading && (
                              <div className="mt-4 flex gap-3">
                                <Button
                                  onClick={uploadFile}
                                  className="bg-spanish-orange hover:bg-spanish-orange/90"
                                >
                                  <SparklesIcon className="w-4 h-4 mr-2" />
                                  Start AI Analysis
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedFile(null)
                                    setPreviewUrl(null)
                                  }}
                                >
                                  Change File
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {isUploading && (
                          <div className="mt-6 text-center">
                            <CuliLogoLoading size={48} className="mx-auto mb-4" />
                            <TextGenerateEffect
                              words="Uploading and preparing for AI analysis..."
                              className="text-sm text-cinereous"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Extracting Step */}
            {currentStep === 'extracting' && (
              <motion.div
                key="extracting"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-16 text-center"
              >
                <Sparkles
                  className="absolute inset-0 z-0"
                  particleColor="var(--spanish-orange)"
                  particleDensity={50}
                  minSize={0.6}
                  maxSize={1.2}
                />
                
                <div className="relative z-10">
                  <CuliLogoLoading size={80} className="mx-auto mb-8" />
                  
                  <h2 className="text-2xl font-bold text-eerie-black mb-4">
                    AI Magic in Progress
                  </h2>
                  
                  <TextGenerateEffect
                    words="Analyzing your menu and extracting every delicious detail..."
                    className="text-lg text-cinereous max-w-lg mx-auto"
                  />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="mt-8 flex items-center justify-center gap-2 text-sm text-cinereous"
                  >
                    <Check className="w-4 h-4 text-green-500" />
                    Redirecting to validation...
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}