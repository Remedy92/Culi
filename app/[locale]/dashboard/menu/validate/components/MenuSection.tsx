'use client'

import React, { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { GripVertical, Trash2, Plus, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  AccordionContent, 
  AccordionItem
} from '@/components/ui/accordion'
import type { MenuSection as MenuSectionType } from '@/lib/ai/menu/extraction-schemas'
import { InlineEdit } from './InlineEdit'
import { ValidationBadge } from './ValidationBadge'

interface MenuSectionProps {
  section: MenuSectionType
  isExpanded: boolean
  selectionState?: 'checked' | 'unchecked' | 'indeterminate'
  validationState?: 'checked' | 'unchecked' | 'indeterminate'
  onToggleSelection?: () => void
  onToggle: () => void
  onUpdate: (updates: Partial<MenuSectionType>) => void
  onDelete: () => void
  onAddItem: () => void
  children: React.ReactNode
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
}

export const MenuSection = React.forwardRef<HTMLDivElement, MenuSectionProps>(
  ({ section, isExpanded, selectionState = 'unchecked', validationState = 'unchecked', onToggleSelection, onToggle, onUpdate, onDelete, onAddItem, children, dragHandleProps }, ref) => {
    const [isHovered, setIsHovered] = useState(false)
    const handleNameSave = useCallback((name: string) => {
      onUpdate({ name })
    }, [onUpdate])

    return (
      <AccordionItem 
        value={section.id} 
        ref={ref}
        className="border-none"
      >
        <motion.div
          layout
          className="group relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Section Header - Entire area clickable */}
          <div 
            onClick={(e) => {
              // Don't toggle if clicking on interactive elements
              const target = e.target as HTMLElement
              if (target.closest('button') || target.closest('[contenteditable]') || target.closest('input')) {
                return
              }
              onToggle()
            }}
            className={cn(
              "flex items-center gap-3 py-4 px-2 cursor-pointer",
              "border-b border-warm transition-colors duration-150",
              selectionState !== 'unchecked' ? "bg-warm-100" : "hover:bg-warm-50"
            )}
          >
            {/* Selection Checkbox / Drag Handle */}
            <div className="flex items-center w-4 h-4">
              {(isHovered || selectionState !== 'unchecked') ? (
                onToggleSelection && (
                  <input
                    type="checkbox"
                    checked={selectionState === 'checked'}
                    ref={input => {
                      if (input) {
                        input.indeterminate = selectionState === 'indeterminate'
                      }
                    }}
                    onChange={(e) => {
                      e.stopPropagation()
                      onToggleSelection()
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 cursor-pointer"
                  />
                )
              ) : (
                <div
                  className="cursor-move"
                  onClick={(e) => e.stopPropagation()}
                  {...dragHandleProps}
                >
                  <GripVertical className="h-4 w-4 text-warm-secondary" />
                </div>
              )}
            </div>

            {/* Section Name with Inline Edit */}
            <div className="flex-1 flex items-center gap-3">
              <ChevronDown 
                className={cn(
                  "h-4 w-4 text-warm-secondary transition-transform duration-150",
                  isExpanded && "rotate-180"
                )}
              />
              <div className="text-notion-sm font-medium text-notion-primary">
                <InlineEdit
                  value={section.name}
                  onSave={handleNameSave}
                  placeholder="Section name"
                  className="capitalize"
                />
              </div>
              <span className="text-notion-xs text-warm-secondary">
                ({section.items.length})
              </span>
            </div>

            {/* Section Validation Badge */}
            <ValidationBadge 
              isValidated={validationState === 'checked'}
            />

            {/* Delete Button - Hidden until hover */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className={cn(
                "hover-visible p-1 rounded",
                "transition-colors duration-150",
                "hover:bg-red-50 hover:text-red-600"
              )}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Section Content */}
          <AccordionContent className="border-none">
            <div className="pl-8 pr-4 py-3 space-y-1">
              {children}
              
              {/* Add Item Button */}
              <button
                onClick={onAddItem}
                className={cn(
                  "w-full flex items-center gap-2 py-3 px-2 -mx-2 mt-2",
                  "text-notion-sm text-warm-secondary",
                  "rounded transition-colors duration-150",
                  "hover:bg-warm-100 hover:text-spanish-orange"
                )}
              >
                <Plus className="h-4 w-4" />
                Add item
              </button>
            </div>
          </AccordionContent>
        </motion.div>
      </AccordionItem>
    )
  }
)

MenuSection.displayName = 'MenuSection'