'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Sparkles, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/lib/hooks/useMediaQuery'
import { CuliLogoLoading } from '@/app/components/CuliCurveLogo'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { Button } from '@/components/ui/button'
import Image from 'next/image'

type ProgressStep = {
  id: string
  label: string
  icon: React.ReactNode
}

const progressSteps: ProgressStep[] = [
  {
    id: 'ocr',
    label: 'Reading menu text',
    icon: <FileText className="w-4 h-4" />
  },
  {
    id: 'ai',
    label: 'AI analyzing dishes',
    icon: <Sparkles className="w-4 h-4" />
  },
  {
    id: 'organize',
    label: 'Organizing sections',
    icon: <CheckCircle className="w-4 h-4" />
  }
]

interface AnalysisProgressModalProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  fileName?: string
  fileSize?: number
  filePreview?: string
  error?: string
  onRetry?: () => void
}

export function AnalysisProgressModal({
  open,
  onOpenChange,
  fileName = 'menu.pdf',
  fileSize,
  filePreview,
  error,
  onRetry
}: AnalysisProgressModalProps) {
  const isMobile = useIsMobile()
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(60) // More realistic duration
  const [isComplete, setIsComplete] = useState(false)

  // Progress simulation with weighted steps
  useEffect(() => {
    if (!open || error || isComplete) return

    // Weighted progress: OCR (20%), AI Analysis (50%), Organizing (30%)
    const STEP_WEIGHTS = [20, 50, 30]
    const TOTAL_DURATION = 60 // seconds
    
    let elapsedTime = 0
    
    const progressInterval = setInterval(() => {
      elapsedTime += 1
      
      // Calculate progress based on elapsed time
      const progressPercent = (elapsedTime / TOTAL_DURATION) * 100
      
      setProgress(Math.min(progressPercent, 100))
      
      // Update step based on weighted progress
      if (progressPercent >= STEP_WEIGHTS[0] + STEP_WEIGHTS[1]) {
        setCurrentStep(2) // Organizing
      } else if (progressPercent >= STEP_WEIGHTS[0]) {
        setCurrentStep(1) // AI Analysis
      }
      
      // Complete when we reach 100%
      if (progressPercent >= 100) {
        setIsComplete(true)
        clearInterval(progressInterval)
      }
    }, 1000)

    const timeInterval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1))
    }, 1000)

    return () => {
      clearInterval(progressInterval)
      clearInterval(timeInterval)
    }
  }, [open, error, isComplete])

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setCurrentStep(0)
      setProgress(0)
      setTimeRemaining(60)
      setIsComplete(false)
    }
  }, [open])

  const content = (
    <div className="w-full space-y-6">
      {/* File Preview Section */}
      {filePreview && (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="relative w-16 h-16 rounded overflow-hidden">
            <Image 
              src={filePreview} 
              alt="Menu preview" 
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{fileName}</p>
            {fileSize && (
              <p className="text-xs text-muted-foreground">
                {(fileSize / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
          </div>
        </div>
      )}

      {/* Progress Section */}
      {!error && !isComplete && (
        <div className="space-y-4">
          {/* Culi Logo Progress */}
          <div className="flex justify-center">
            <div className="relative">
              <CuliLogoLoading size={128} color="#C65D2C" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {progressSteps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-colors",
                  index === currentStep && "bg-spanish-orange/10",
                  index < currentStep && "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                  index <= currentStep ? "bg-spanish-orange text-white" : "bg-gray-200"
                )}>
                  {index < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : index === currentStep ? (
                    <CuliLogoLoading size={16} color="white" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  index === currentStep && "text-spanish-orange"
                )}>
                  {step.label}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Time Remaining */}
          <p className="text-center text-sm text-muted-foreground">
            ~{timeRemaining}s remaining
          </p>
        </div>
      )}

      {/* Success State */}
      {isComplete && !error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 py-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
          >
            <CheckCircle className="w-10 h-10 text-green-600" />
          </motion.div>
          <div>
            <h3 className="font-semibold text-lg">Analysis Complete!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Redirecting to validation...
            </p>
          </div>
          {/* Fallback button in case auto-navigation fails */}
          <Button
            onClick={() => {
              const menuId = localStorage.getItem('lastMenuId')
              if (menuId && window.location) {
                window.location.href = `/${window.location.pathname.split('/')[1]}/dashboard/menu/validate?menuId=${menuId}`
              }
            }}
            variant="outline"
            className="mt-4"
          >
            Continue to Validation
          </Button>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4 py-8"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Analysis Failed</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {error}
            </p>
            {onRetry && (
              <Button onClick={onRetry} variant="outline">
                Try Again
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )

  const title = error ? 'Analysis Failed' : isComplete ? 'Complete!' : 'Analyzing Your Menu'

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="bottom" 
          className="h-[80vh] max-h-[80vh] rounded-t-2xl w-full max-w-none"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 overflow-y-auto">
            {content}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-full max-w-[90vw] sm:max-w-max-w-container-narrow mx-auto md:max-w-max-w-container-standard mx-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}