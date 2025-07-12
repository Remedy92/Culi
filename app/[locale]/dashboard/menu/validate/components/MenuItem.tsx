'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { MenuItem as MenuItemType } from '@/lib/ai/menu/extraction-schemas'

interface MenuItemProps {
  item: MenuItemType
  currency?: string
  onEdit: () => void
  onDelete: () => void
}

export function MenuItem({ item, currency = '€', onEdit, onDelete }: MenuItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="group relative"
    >
      <div 
        onClick={onEdit}
        className={cn(
          "flex items-start justify-between gap-4 p-3 rounded-lg",
          "cursor-pointer hover:bg-gray-50 transition-colors",
          "border border-transparent hover:border-gray-200"
        )}
      >
        {/* Item Details */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900">
            {item.name}
          </h4>
          {item.description && (
            <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900">
            {currency}{item.price?.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>

      {/* Delete button - always visible */}
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        className="absolute -right-2 top-3 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </motion.div>
  )
}