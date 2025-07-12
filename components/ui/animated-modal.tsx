'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface AnimatedModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  showCloseButton?: boolean
}

export function AnimatedModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  showCloseButton = true,
}: AnimatedModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <DialogContent
            className={cn(
              'max-w-max-w-container-narrow mx-auto p-0 overflow-hidden',
              className
            )}
            showCloseButton={showCloseButton}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 300,
              }}
              className="p-4 sm:p-6"
            >
              {(title || description) && (
                <DialogHeader className="mb-3">
                  {title && (
                    <DialogTitle className="text-lg font-semibold text-eerie-black">
                      {title}
                    </DialogTitle>
                  )}
                  {description && (
                    <DialogDescription className="text-sm text-cinereous mt-1">
                      {description}
                    </DialogDescription>
                  )}
                </DialogHeader>
              )}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {children}
              </motion.div>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  )
}