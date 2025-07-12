'use client'

import React, { useState, useEffect } from 'react'
import { useIsMobile } from '@/lib/hooks/useMediaQuery'
import { 
  CuliMultiStepLoader, 
  CuliLoaderSuccess, 
  CuliLoaderError,
  type LoadingStep 
} from '@/components/ui/culi-multi-step-loader'

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

const progressSteps: LoadingStep[] = [
  { id: 'scan', label: 'Scanning menu pages' },
  { id: 'extract', label: 'Extracting text content' },
  { id: 'identify', label: 'Identifying dish names' },
  { id: 'analyze', label: 'Analyzing descriptions' },
  { id: 'allergens', label: 'Detecting allergens & dietary info' },
  { id: 'organize', label: 'Organizing by categories' },
  { id: 'finalize', label: 'Finalizing structure' },
  { id: 'save', label: 'Saving your menu' }
]

interface AnalysisProgressModalProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  error?: string
  onRetry?: () => void
}

export function AnalysisProgressModal({
  open,
  onOpenChange,
  error,
  onRetry
}: AnalysisProgressModalProps) {
  const isMobile = useIsMobile()
  const [currentStep, setCurrentStep] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(60)
  const [isComplete, setIsComplete] = useState(false)

  // Progress simulation with 8 steps
  useEffect(() => {
    if (!open || error || isComplete) return

    const TOTAL_DURATION = 60 // seconds
    const STEP_DURATION = TOTAL_DURATION / progressSteps.length // ~7.5s per step
    
    let elapsedTime = 0
    
    const progressInterval = setInterval(() => {
      elapsedTime += 1
      
      // Calculate progress based on elapsed time
      const progressPercent = (elapsedTime / TOTAL_DURATION) * 100
      
      // Update current step
      const newStep = Math.floor(elapsedTime / STEP_DURATION)
      setCurrentStep(Math.min(newStep, progressSteps.length - 1))
      
      // Update time remaining
      setTimeRemaining(Math.max(0, TOTAL_DURATION - elapsedTime))
      
      // Complete when we reach 100%
      if (progressPercent >= 100) {
        setIsComplete(true)
        clearInterval(progressInterval)
      }
    }, 1000)

    return () => {
      clearInterval(progressInterval)
    }
  }, [open, error, isComplete])

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setCurrentStep(0)
      setTimeRemaining(60)
      setIsComplete(false)
    }
  }, [open])

  // Get appropriate title for accessibility
  const getModalTitle = () => {
    if (error) return 'Analysis Error'
    if (isComplete) return 'Analysis Complete'
    return 'Menu Analysis Progress'
  }

  const content = (
    <div className="w-full">
      {/* Progress Section */}
      {!error && !isComplete && (
        <CuliMultiStepLoader
          steps={progressSteps}
          currentStep={currentStep}
          timeRemaining={timeRemaining}
        />
      )}

      {/* Success State */}
      {isComplete && !error && (
        <>
          <CuliLoaderSuccess message="Analysis Complete!" />
          {/* Fallback button in case auto-navigation fails */}
          <div className="text-center mt-4">
            <Button
              onClick={() => {
                const menuId = localStorage.getItem('lastMenuId')
                if (menuId && window.location) {
                  window.location.href = `/${window.location.pathname.split('/')[1]}/dashboard/menu/validate?menuId=${menuId}`
                }
              }}
              variant="outline"
              size="sm"
            >
              Continue to Validation
            </Button>
          </div>
        </>
      )}

      {/* Error State */}
      {error && (
        <CuliLoaderError
          message={error}
          onRetry={onRetry}
        />
      )}
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="bottom" 
          className="h-auto max-h-[80vh] rounded-t-2xl w-full max-w-none"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{getModalTitle()}</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto">
            {content}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-full max-w-[440px]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{getModalTitle()}</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}