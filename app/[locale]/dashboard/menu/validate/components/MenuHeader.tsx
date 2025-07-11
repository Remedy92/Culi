'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Brain, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CuliCurveLogo } from '@/app/components/CuliCurveLogo'
import { Button } from '@/app/components/ui/button'
import { Progress } from '@/app/components/ui/progress'

interface MenuHeaderProps {
  hasChanges: boolean
  isSaving: boolean
  onSave: () => void
  onToggleAI: () => void
  showAI: boolean
}

export function MenuHeader({ 
  hasChanges, 
  isSaving, 
  onSave, 
  onToggleAI,
  showAI 
}: MenuHeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [saveProgress, setSaveProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isSaving) {
      setSaveProgress(0)
      const interval = setInterval(() => {
        setSaveProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval)
            return prev
          }
          return prev + 10
        })
      }, 100)
      return () => clearInterval(interval)
    } else {
      setSaveProgress(100)
      const timeout = setTimeout(() => setSaveProgress(0), 1000)
      return () => clearTimeout(timeout)
    }
  }, [isSaving])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-white/80 backdrop-blur-md shadow-warm-sm" : "bg-transparent"
      )}
    >
      <div className="max-w-container-full mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <CuliCurveLogo size={24} />
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-eerie-black">Menu Editor</h1>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* AI Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleAI}
              className={cn(
                "gap-2",
                showAI && "text-spanish-orange"
              )}
            >
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">AI</span>
            </Button>

            {/* Save Button */}
            <Button
              onClick={onSave}
              disabled={!hasChanges || isSaving}
              size="sm"
              className={cn(
                "gap-2 min-w-[100px] relative overflow-hidden",
                "bg-spanish-orange hover:bg-spanish-orange/90",
                "disabled:opacity-50"
              )}
            >
              <motion.div
                className="flex items-center gap-2"
                animate={{ opacity: isSaving ? 0.7 : 1 }}
              >
                {isSaving ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Save className="h-4 w-4" />
                    </motion.div>
                    <span>Saving...</span>
                  </>
                ) : hasChanges ? (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Saved</span>
                  </>
                )}
              </motion.div>
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        {(isSaving || saveProgress > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute bottom-0 left-0 right-0"
          >
            <Progress 
              value={saveProgress} 
              className="h-1 rounded-none bg-transparent"
            />
          </motion.div>
        )}
      </div>
    </motion.header>
  )
}