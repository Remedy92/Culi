'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { MoreVertical, Edit, Trash2, AlertTriangle, Leaf } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover'
import type { MenuItem as MenuItemType } from '@/lib/ai/menu/extraction-schemas'

interface MenuItemProps {
  item: MenuItemType
  currency?: string
  onEdit: () => void
  onDelete: () => void
}

export function MenuItem({ item, currency = '€', onEdit, onDelete }: MenuItemProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "group relative p-4 rounded-xl",
        "bg-gray-50 hover:bg-gray-100",
        "transition-all duration-200",
        "min-h-[48px]" // Touch-friendly target
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Item Details */}
        <div className="flex-1 space-y-1">
          {/* Name and Description */}
          <div>
            <h4 className="font-medium text-eerie-black leading-tight">
              {item.name}
            </h4>
            {item.description && (
              <p className="text-sm text-cinereous mt-0.5 line-clamp-2">
                {item.description}
              </p>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {/* Allergens */}
            {item.allergens && item.allergens.length > 0 && (
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-orange-600" />
                <span className="text-xs text-orange-600">
                  {item.allergens.join(', ')}
                </span>
              </div>
            )}

            {/* Dietary Tags */}
            {item.dietaryTags && item.dietaryTags.length > 0 && (
              <div className="flex items-center gap-1">
                <Leaf className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600">
                  {item.dietaryTags.join(', ')}
                </span>
              </div>
            )}

            {/* Low Confidence Indicator */}
            {item.confidence < 70 && (
              <Badge 
                variant="secondary" 
                className="text-xs bg-yellow-100 text-yellow-700 border-yellow-300"
              >
                Review needed
              </Badge>
            )}
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center gap-3">
          {/* Price */}
          <div className="text-right">
            <p className="font-semibold text-lg text-eerie-black">
              {currency}{item.price?.toFixed(2) || '0.00'}
            </p>
            {item.confidence < 90 && (
              <p className="text-xs text-cinereous">
                {item.confidence}% sure
              </p>
            )}
          </div>

          {/* Actions Menu */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40" align="end">
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={onEdit}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={onDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}