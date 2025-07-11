'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Save, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { MagicCard } from '@/components/ui/magic-card'

interface QuickActionsProps {
  hasChanges: boolean
  onSave: () => void
  onAddSection: () => void
  onToggleAI: () => void
  showAI: boolean
  isSaving: boolean
}

export function QuickActions({ 
  hasChanges, 
  onSave, 
  onAddSection, 
  onToggleAI,
  showAI,
  isSaving 
}: QuickActionsProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!isMobile) return null

  return (
    <>
      {/* FAB Trigger */}
      <motion.div
        className="fixed bottom-6 right-6 z-40"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <MagicCard
          className="p-0 rounded-full shadow-lg"
          gradientSize={200}
          gradientColor="#C65D2C"
          gradientOpacity={0.3}
        >
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "h-14 w-14 rounded-full p-0",
              "bg-spanish-orange hover:bg-spanish-orange/90",
              "shadow-lg transition-all duration-200",
              isOpen && "rotate-45"
            )}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </MagicCard>
      </motion.div>

      {/* Action Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/20 md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="absolute bottom-24 right-6 space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Save Button */}
              {hasChanges && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center justify-end gap-3"
                >
                  <span className="text-sm font-medium bg-white px-3 py-1 rounded-full shadow-sm">
                    Save Changes
                  </span>
                  <Button
                    onClick={() => {
                      onSave()
                      setIsOpen(false)
                    }}
                    disabled={isSaving}
                    className="h-12 w-12 rounded-full p-0 bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-5 w-5" />
                  </Button>
                </motion.div>
              )}

              {/* Add Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-end gap-3"
              >
                <span className="text-sm font-medium bg-white px-3 py-1 rounded-full shadow-sm">
                  Add Section
                </span>
                <Button
                  onClick={() => {
                    onAddSection()
                    setIsOpen(false)
                  }}
                  className="h-12 w-12 rounded-full p-0 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </motion.div>

              {/* Toggle AI */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-end gap-3"
              >
                <span className="text-sm font-medium bg-white px-3 py-1 rounded-full shadow-sm">
                  AI Assistant
                </span>
                <Button
                  onClick={() => {
                    onToggleAI()
                    setIsOpen(false)
                  }}
                  className={cn(
                    "h-12 w-12 rounded-full p-0",
                    showAI ? "bg-spanish-orange hover:bg-spanish-orange/90" : "bg-gray-600 hover:bg-gray-700"
                  )}
                >
                  <Brain className="h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}