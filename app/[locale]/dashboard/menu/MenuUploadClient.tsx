'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles as SparklesIcon, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

import { CuliCurveLogo } from '@/app/components/CuliCurveLogo'
import { TextGenerateEffect } from '@/app/components/ui/text-generate-effect'
import { HoverBorderGradient } from '@/app/components/ui/hover-border-gradient'
import { Sparkles } from '@/app/components/ui/sparkles'
import { BackgroundBeams } from '@/app/components/ui/background-beams'
import { Spotlight } from '@/app/components/ui/spotlight'
import { FileUpload } from '@/app/components/ui/file-upload'
import { MultiStepLoader } from '@/app/components/ui/multi-step-loader'
import { EXTRACTION_CONFIG } from '@/lib/config/extraction'

type Step = 'welcome' | 'upload' | 'extracting' | 'complete'


interface MenuUploadClientProps {
  restaurantId: string
  locale: string
}

const loadingStates = [
  {
    text: "Reading your menu with OCR technology",
  },
  {
    text: "AI is understanding your dishes",
  },
  {
    text: "Extracting prices and descriptions",
  },
  {
    text: "Identifying allergens and dietary options",
  },
  {
    text: "Organizing menu sections",
  },
  {
    text: "Finalizing menu structure",
  },
]

export default function MenuUploadClient({ restaurantId, locale }: MenuUploadClientProps) {
  const [currentStep, setCurrentStep] = useState<Step>('welcome')
  const [isExtracting, setIsExtracting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const router = useRouter()

  const handleFileChange = (files: File[]) => {
    if (files.length === 0) return
    
    const file = files[0]
    
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
  }

  const uploadFile = async () => {
    if (!selectedFile || !restaurantId) return

    setIsExtracting(true)
    setCurrentStep('extracting')

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
      
      // Navigate to validation
      setTimeout(() => {
        router.push(`/${locale}/dashboard/menu/validate?menuId=${data.menu.id}`)
      }, 2000)
      
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Upload failed')
      setIsExtracting(false)
      setCurrentStep('upload')
    }
  }

  return (
    <>
      <MultiStepLoader 
        loadingStates={loadingStates} 
        loading={isExtracting} 
        duration={3000}
        loop={false}
      />
      
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
                    <Sparkles
                      className="absolute inset-0 z-0"
                      particleColor="var(--spanish-orange)"
                      particleDensity={20}
                      minSize={0.4}
                      maxSize={0.8}
                    >
                      <span className="sr-only">Sparkle effect</span>
                    </Sparkles>
                    
                    <div className="relative z-10 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-warm-xl">
                      <FileUpload 
                        onChange={handleFileChange}
                        className="max-w-2xl mx-auto"
                      />
                      
                      {selectedFile && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 text-center"
                        >
                          <HoverBorderGradient
                            containerClassName="rounded-full"
                            className="px-8 py-3 font-medium"
                            onClick={uploadFile}
                          >
                            <span className="flex items-center gap-2">
                              <SparklesIcon className="w-4 h-4" />
                              Start AI Analysis
                            </span>
                          </HoverBorderGradient>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  )
}