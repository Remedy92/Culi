'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FloatingActionsProps {
  selectedCount: number
  totalCount: number
  onSelectAll: () => void
  onClearAll: () => void
  onValidateSelected: () => void
  onDeleteSelected?: () => void
}

export function FloatingActions({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearAll,
  onValidateSelected,
  onDeleteSelected
}: FloatingActionsProps) {
  const showActions = selectedCount > 0

  return (
    <AnimatePresence>
      {showActions && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-white shadow-lg rounded-full px-6 py-3 flex items-center gap-4 border border-warm">
            {/* Selected count */}
            <span className="text-notion-sm text-warm-secondary font-medium">
              {selectedCount} of {totalCount} selected
            </span>
            
            {/* Divider */}
            <div className="h-4 w-px bg-warm-200" />
            
            {/* Actions */}
            <div className="flex items-center gap-3">
              {selectedCount < totalCount ? (
                <button
                  onClick={onSelectAll}
                  className={cn(
                    "text-notion-sm text-notion-primary",
                    "hover:text-spanish-orange transition-colors",
                    "font-medium"
                  )}
                >
                  Select all
                </button>
              ) : (
                <button
                  onClick={onClearAll}
                  className={cn(
                    "text-notion-sm text-notion-primary",
                    "hover:text-spanish-orange transition-colors",
                    "font-medium"
                  )}
                >
                  Clear all
                </button>
              )}
              
              <button
                onClick={onValidateSelected}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                  "bg-green-500 text-white text-notion-sm font-medium",
                  "hover:bg-green-600 transition-colors"
                )}
              >
                <Check className="h-3.5 w-3.5" />
                Validate
              </button>
              
              {onDeleteSelected && (
                <button
                  onClick={onDeleteSelected}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                    "text-red-600 text-notion-sm font-medium",
                    "hover:bg-red-50 transition-colors"
                  )}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}