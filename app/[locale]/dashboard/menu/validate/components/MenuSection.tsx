'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GripVertical, MoreVertical, Trash2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { AnimatedCircularProgressBar } from '@/components/ui/animated-circular-progress-bar'
import type { MenuSection as MenuSectionType } from '@/lib/ai/menu/extraction-schemas'

interface MenuSectionProps {
  section: MenuSectionType
  isExpanded: boolean
  onToggle: () => void
  onDelete: () => void
  onAddItem: () => void
  children: React.ReactNode
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
}

export const MenuSection = React.forwardRef<HTMLDivElement, MenuSectionProps>(
  ({ section, onToggle, onDelete, onAddItem, children, dragHandleProps }, ref) => {
    const [showDragHandle, setShowDragHandle] = React.useState(false)

    return (
      <AccordionItem 
        value={section.id} 
        ref={ref}
        className="border-none"
      >
        <motion.div
          layout
          className={cn(
            "group relative bg-white rounded-2xl shadow-sm",
            "hover:shadow-md transition-all duration-200",
            "border border-transparent hover:border-gray-100"
          )}
          onMouseEnter={() => setShowDragHandle(true)}
          onMouseLeave={() => setShowDragHandle(false)}
        >
          {/* Section Header */}
          <div className="flex items-center px-6 py-4">
            <AccordionTrigger 
              onClick={onToggle}
              className="flex-1 hover:no-underline pr-2"
            >
              <div className="flex items-center gap-3">
                {/* Drag Handle */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ 
                    opacity: showDragHandle ? 0.5 : 0, 
                    x: showDragHandle ? 0 : -10 
                  }}
                  transition={{ duration: 0.2 }}
                  className="cursor-move"
                  {...dragHandleProps}
                >
                  <GripVertical className="h-5 w-5" />
                </motion.div>

                {/* Section Name */}
                <h3 className="text-lg font-semibold text-eerie-black">
                  {section.name}
                </h3>

                {/* Item Count Badge */}
                <Badge variant="secondary" className="text-xs">
                  {section.items.length} items
                </Badge>

                {/* Confidence Score */}
                <div className="flex items-center gap-2">
                  <AnimatedCircularProgressBar
                    value={section.confidence}
                    radius={12}
                    strokeWidth={3}
                    color={getConfidenceColor(section.confidence)}
                    backgroundColor="#E5E7EB"
                    showValue={false}
                  />
                  <span className={cn(
                    "text-sm font-medium",
                    getConfidenceTextColor(section.confidence)
                  )}>
                    {section.confidence}%
                  </span>
                </div>
              </div>
            </AccordionTrigger>

            {/* Section Actions - Now outside AccordionTrigger */}
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-40" align="end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={onDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Section
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Section Content */}
          <AccordionContent>
            <div className="px-6 pb-6 space-y-3">
              {children}
              
              {/* Add Item Button */}
              <Button
                variant="outline"
                className="w-full border-dashed hover:border-spanish-orange hover:text-spanish-orange"
                onClick={onAddItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </AccordionContent>
        </motion.div>
      </AccordionItem>
    )
  }
)

MenuSection.displayName = 'MenuSection'

function getConfidenceColor(confidence: number): string {
  if (confidence >= 90) return '#10B981'
  if (confidence >= 70) return '#F59E0B'
  return '#EF4444'
}

function getConfidenceTextColor(confidence: number): string {
  if (confidence >= 90) return 'text-green-600'
  if (confidence >= 70) return 'text-yellow-600'
  return 'text-red-600'
}