'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Cloud, CloudOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error'
  lastSaved?: Date
}

export function SaveIndicator({ status, lastSaved }: SaveIndicatorProps) {
  const [showIndicator, setShowIndicator] = React.useState(false)

  React.useEffect(() => {
    if (status !== 'idle') {
      setShowIndicator(true)
      
      if (status === 'saved') {
        const timer = setTimeout(() => {
          setShowIndicator(false)
        }, 3000)
        return () => clearTimeout(timer)
      }
    }
  }, [status])

  const getStatusContent = () => {
    switch (status) {
      case 'saving':
        return (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Cloud className="h-4 w-4" />
            </motion.div>
            <span>Saving...</span>
          </>
        )
      case 'saved':
        return (
          <>
            <Check className="h-4 w-4 text-green-600" />
            <span>Saved</span>
            {lastSaved && (
              <span className="text-xs text-muted-foreground">
                ({getRelativeTime(lastSaved)})
              </span>
            )}
          </>
        )
      case 'error':
        return (
          <>
            <CloudOff className="h-4 w-4 text-red-600" />
            <span className="text-red-600">Save failed</span>
          </>
        )
      default:
        return null
    }
  }

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={cn(
            "fixed bottom-6 left-6 z-40",
            "px-4 py-2 rounded-full",
            "bg-white shadow-md border",
            "flex items-center gap-2 text-sm"
          )}
        >
          {getStatusContent()}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}