'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CuliLogoLoading } from '@/app/components/CuliCurveLogo'

export interface LoadingStep {
  id: string
  label: string
}

interface CuliMultiStepLoaderProps {
  steps: LoadingStep[]
  currentStep: number
  timeRemaining: number
  className?: string
}

export function CuliMultiStepLoader({
  steps,
  currentStep,
  timeRemaining,
  className
}: CuliMultiStepLoaderProps) {
  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Header */}
      <h3 className="text-base font-medium text-gray-900 text-center">
        Analyzing Your Menu
      </h3>

      {/* Steps */}
      <div className="space-y-1.5">
        <AnimatePresence mode="sync">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep
            const isActive = index === currentStep
            const isPending = index > currentStep

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: isCompleted ? 0.3 : isActive ? 1 : 0.15,
                }}
                transition={{ duration: 0.3 }}
                className={cn(
                  'flex items-center gap-3 py-2 px-3 rounded-lg transition-colors',
                  isActive && 'bg-gray-50'
                )}
              >
                {/* Step Indicator */}
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-gray-400" />
                  ) : isActive ? (
                    <CuliLogoLoading size={16} color="#000000" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-gray-200" />
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={cn(
                    'text-sm transition-colors',
                    isCompleted && 'text-gray-400',
                    isActive && 'text-gray-900 font-medium',
                    isPending && 'text-gray-300'
                  )}
                >
                  {step.label}
                </span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Estimated Time Remaining */}
      <p className="text-center text-xs text-gray-400">
        Est. {timeRemaining}s remaining
      </p>
    </div>
  )
}

// Success State Component
export function CuliLoaderSuccess({ message = 'Complete!' }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-4 py-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto"
      >
        <Check className="w-8 h-8 text-gray-900" />
      </motion.div>
      <p className="text-lg font-medium text-gray-900">{message}</p>
    </motion.div>
  )
}

// Error State Component
export function CuliLoaderError({ 
  message = 'Something went wrong',
  onRetry
}: { 
  message?: string
  onRetry?: () => void 
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center space-y-4 py-8"
    >
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
        <span className="text-2xl">!</span>
      </div>
      <div>
        <p className="text-lg font-medium text-gray-900 mb-2">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Try again
          </button>
        )}
      </div>
    </motion.div>
  )
}