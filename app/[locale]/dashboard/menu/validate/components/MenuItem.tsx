'use client'

import React, { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MenuItem as MenuItemType } from '@/lib/ai/menu/extraction-schemas'
import { InlineEdit } from './InlineEdit'
import { PriceDisplay } from './PriceDisplay'
import { ValidationBadge } from './ValidationBadge'

interface MenuItemProps {
  item: MenuItemType
  currency?: string
  isSelected?: boolean
  isValidated?: boolean
  onToggleSelection?: () => void
  onUpdate: (updates: Partial<MenuItemType>) => void
  onDelete: () => void
}

export function MenuItem({ 
  item, 
  currency = '€', 
  isSelected = false,
  isValidated = false,
  onToggleSelection,
  onUpdate, 
  onDelete 
}: MenuItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  
  // Detect touch device on mount
  React.useEffect(() => {
    setIsTouchDevice(window.matchMedia('(hover: none)').matches)
  }, [])
  const handleNameSave = useCallback((name: string) => {
    onUpdate({ name })
  }, [onUpdate])

  const handleDescriptionSave = useCallback((description: string) => {
    onUpdate({ description })
  }, [onUpdate])

  const handlePriceSave = useCallback((price: number) => {
    onUpdate({ price })
  }, [onUpdate])

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn(
        "flex items-start gap-3 py-3 px-2 -mx-2 rounded",
        "transition-colors duration-150",
        isSelected ? "bg-warm-100" : "hover:bg-warm-50"
      )}>
        {/* Selection Checkbox / Drag Handle */}
        <div className="relative flex items-center justify-center pt-1 w-6 h-6 flex-shrink-0">
          {/* Drag handle - always rendered with scale transform */}
          <GripVertical className={cn(
            "absolute h-4 w-4 text-warm-secondary cursor-move transition-all duration-150",
            (isTouchDevice || isHovered || isSelected) && onToggleSelection 
              ? "opacity-0 scale-95" 
              : "opacity-100 scale-100"
          )} />
          
          {/* Checkbox - always rendered with scale transform */}
          {onToggleSelection && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelection}
              className={cn(
                "absolute w-4 h-4 cursor-pointer transition-all duration-150",
                (isTouchDevice || isHovered || isSelected) 
                  ? "opacity-100 scale-100" 
                  : "opacity-30 scale-90 hover:opacity-50"
              )}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Select ${item.name}`}
            />
          )}
        </div>

        {/* Item Details */}
        <div className="flex-1 min-w-0">
          <div className="text-notion-sm text-notion-primary">
            <InlineEdit 
              value={item.name} 
              onSave={handleNameSave}
              placeholder="Item name"
            />
          </div>
          {(item.description || false) && (
            <div className="text-notion-xs text-warm-secondary mt-0.5">
              <InlineEdit 
                value={item.description || ''} 
                onSave={handleDescriptionSave}
                placeholder="Add description"
                multiline
              />
            </div>
          )}
        </div>

        {/* Price */}
        <div className="text-notion-sm text-notion-primary pt-1">
          <PriceDisplay 
            value={item.price || 0} 
            currency={currency}
            onSave={handlePriceSave}
          />
        </div>

        {/* Delete button - Hidden until hover */}
        <button
          onClick={onDelete}
          className={cn(
            "hover-visible p-1 rounded",
            "transition-colors duration-150",
            "hover:bg-red-50 hover:text-red-600"
          )}
        >
          <Trash2 className="h-4 w-4" />
        </button>

        {/* Validation Badge - Far right */}
        <div className="pt-1 ml-2">
          <ValidationBadge 
            isValidated={isValidated}
          />
        </div>
      </div>
    </motion.div>
  )
}