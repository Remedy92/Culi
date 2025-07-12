'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { CuliCurveLogo } from '@/app/components/CuliCurveLogo'

interface MenuHeaderProps {
  hasChanges: boolean
  isSaving: boolean
  onSave: () => void
}

export function MenuHeader({ hasChanges, isSaving, onSave }: MenuHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-warm-50 border-b border-warm">
      <div className="max-w-container-wide mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <CuliCurveLogo size={24} />
            <div>
              <h1 className="text-notion-base font-medium text-notion-primary">
                Validate Menu
              </h1>
              <p className="text-notion-xs text-warm-secondary">
                Click any text to edit • Check items to validate
              </p>
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={onSave}
            disabled={!hasChanges || isSaving}
            className={cn(
              "px-4 py-2 rounded text-notion-sm font-medium",
              "transition-all duration-150",
              hasChanges 
                ? "bg-spanish-orange text-white hover:bg-spanish-orange/90" 
                : "text-warm-secondary cursor-not-allowed"
            )}
          >
            {isSaving ? 'Saving...' : hasChanges ? 'Save changes' : 'All saved'}
          </button>
        </div>
      </div>
    </header>
  )
}