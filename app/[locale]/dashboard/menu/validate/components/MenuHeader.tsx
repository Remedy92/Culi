'use client'

import { Check, Loader2 } from 'lucide-react'
import { CuliCurveLogo } from '@/app/components/CuliCurveLogo'
import { Button } from '@/components/ui/button'

interface MenuHeaderProps {
  hasChanges: boolean
  isSaving: boolean
  onSave: () => void
}

export function MenuHeader({ 
  hasChanges, 
  isSaving, 
  onSave
}: MenuHeaderProps) {

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b"
    >
      <div className="max-w-container-wide mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <CuliCurveLogo size={20} />

          {/* Save Button */}
          <Button
            onClick={onSave}
            disabled={!hasChanges || isSaving}
            size="sm"
            variant={hasChanges ? "default" : "ghost"}
            className="h-8 px-3 text-sm"
          >
            {isSaving ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : hasChanges ? (
              "Save"
            ) : (
              <Check className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}