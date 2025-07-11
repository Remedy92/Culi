'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Sparkles as SparklesIcon, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/app/components/ui/sheet'
import { Button } from '@/app/components/ui/button'
import { Progress } from '@/app/components/ui/progress'
import { Sparkles } from '@/app/components/ui/sparkles'
import type { ExtractedMenu } from '@/lib/ai/menu/extraction-schemas'

interface AIPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  extraction: ExtractedMenu
  onApplySuggestion: (suggestion: AISuggestion) => void
  isMobile?: boolean
}

interface AISuggestion {
  id: string
  type: 'confidence' | 'allergen' | 'price' | 'description'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  itemId?: string
  sectionId?: string
  suggestedAction?: () => void
}

export function AIPanel({ 
  open, 
  onOpenChange, 
  extraction,
  onApplySuggestion,
  isMobile = false 
}: AIPanelProps) {
  const suggestions = generateSuggestions(extraction)
  
  const content = (
    <div className="relative h-full">
      <Sparkles
        className="absolute inset-0 z-0"
        particleColor="var(--color-spanish-orange)"
        particleDensity={8}
        minSize={0.3}
        maxSize={0.5}
      />
      
      <div className="relative z-10 space-y-6">
        {/* Stats Overview */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Quick Stats</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white/80 backdrop-blur rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sections</span>
                <span className="font-semibold">{extraction.sections.length}</span>
              </div>
            </div>
            
            <div className="p-3 bg-white/80 backdrop-blur rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Items</span>
                <span className="font-semibold">{extraction.items.length}</span>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-white/80 backdrop-blur rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Overall Confidence</span>
              <span className={cn(
                "font-semibold",
                extraction.overallConfidence >= 90 ? 'text-green-600' :
                extraction.overallConfidence >= 70 ? 'text-yellow-600' : 'text-red-600'
              )}>
                {extraction.overallConfidence}%
              </span>
            </div>
            <Progress value={extraction.overallConfidence} className="h-2" />
          </div>
        </div>

        {/* Suggestions */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground">AI Suggestions</h3>
          
          {suggestions.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground bg-white/80 backdrop-blur rounded-lg">
              <SparklesIcon className="h-8 w-8 mx-auto mb-2 text-spanish-orange" />
              <p>Everything looks great!</p>
              <p className="text-xs mt-1">No issues detected</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "p-4 rounded-lg bg-white/80 backdrop-blur border",
                    suggestion.severity === 'high' && "border-red-200 bg-red-50/80",
                    suggestion.severity === 'medium' && "border-yellow-200 bg-yellow-50/80",
                    suggestion.severity === 'low' && "border-blue-200 bg-blue-50/80"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        {suggestion.type === 'allergen' && <AlertTriangle className="h-4 w-4 text-orange-600" />}
                        {suggestion.type === 'confidence' && <Brain className="h-4 w-4 text-yellow-600" />}
                        <h4 className="font-medium text-sm">{suggestion.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {suggestion.description}
                      </p>
                    </div>
                    
                    {suggestion.suggestedAction && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onApplySuggestion(suggestion)}
                        className="text-xs"
                      >
                        Apply
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {suggestions.length > 0 && (
            <Button
              className="w-full bg-spanish-orange hover:bg-spanish-orange/90"
              onClick={() => {
                // Apply all suggestions
                suggestions.forEach(s => {
                  if (s.suggestedAction) {
                    onApplySuggestion(s)
                  }
                })
              }}
            >
              <SparklesIcon className="h-4 w-4 mr-2" />
              Apply All Suggestions
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-spanish-orange" />
              AI Assistant
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 h-full overflow-y-auto">
            {content}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed right-4 top-20 w-80 h-[calc(100vh-6rem)] z-40"
        >
          <div className="h-full bg-white/95 backdrop-blur-md rounded-2xl shadow-warm-lg border border-gray-100 overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-spanish-orange" />
                <h2 className="font-semibold">AI Assistant</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4 h-[calc(100%-4rem)] overflow-y-auto">
              {content}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function generateSuggestions(extraction: ExtractedMenu): AISuggestion[] {
  const suggestions: AISuggestion[] = []
  
  // Check for low confidence items
  extraction.sections.forEach(section => {
    section.items.forEach(item => {
      if (item.confidence < 70) {
        suggestions.push({
          id: `confidence-${item.id}`,
          type: 'confidence',
          title: `Low confidence: ${item.name}`,
          description: `This item has ${item.confidence}% confidence. Consider reviewing the details.`,
          severity: 'medium',
          itemId: item.id,
          sectionId: section.id
        })
      }
      
      // Check for missing allergens
      if (!item.allergens || item.allergens.length === 0) {
        suggestions.push({
          id: `allergen-${item.id}`,
          type: 'allergen',
          title: `Missing allergens: ${item.name}`,
          description: 'Consider adding allergen information for better guest safety.',
          severity: 'high',
          itemId: item.id,
          sectionId: section.id
        })
      }
      
      // Check for missing descriptions
      if (!item.description) {
        suggestions.push({
          id: `description-${item.id}`,
          type: 'description',
          title: `No description: ${item.name}`,
          description: 'Adding a description helps guests understand the dish better.',
          severity: 'low',
          itemId: item.id,
          sectionId: section.id
        })
      }
    })
  })
  
  return suggestions.slice(0, 5) // Limit to 5 suggestions
}