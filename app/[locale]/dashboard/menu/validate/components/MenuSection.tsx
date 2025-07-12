'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GripVertical, Trash2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
    return (
      <AccordionItem 
        value={section.id} 
        ref={ref}
        className="border-none"
      >
        <motion.div
          layout
          className={cn(
            "group relative bg-white rounded-lg border border-gray-200",
            "hover:border-gray-300 transition-all duration-200"
          )}
        >
          {/* Section Header */}
          <div className="flex items-center">
            {/* Drag Handle - Always Visible */}
            <div
              className="cursor-move px-3 py-4 text-gray-400 hover:text-gray-600"
              {...dragHandleProps}
            >
              <GripVertical className="h-4 w-4" />
            </div>

            <AccordionTrigger 
              onClick={onToggle}
              className="flex-1 hover:no-underline px-4 py-4"
            >
              <div className="flex items-center gap-3">
                {/* Section Name */}
                <h3 className="text-base font-medium text-gray-900">
                  {section.name}
                </h3>

                {/* Item Count */}
                <span className="text-sm text-gray-500">
                  {section.items.length} items
                </span>
              </div>
            </AccordionTrigger>

            {/* Delete Button - Always Visible */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="mr-2 h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Section Content */}
          <AccordionContent>
            <div className="px-4 pb-4 space-y-2">
              {children}
              
              {/* Add Item Button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full border-dashed hover:border-gray-400"
                onClick={onAddItem}
              >
                <Plus className="h-3 w-3 mr-1" />
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