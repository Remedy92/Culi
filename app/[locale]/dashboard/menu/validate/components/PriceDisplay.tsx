'use client'

import { useState, useRef, useEffect } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PriceDisplayProps {
  value: number
  currency?: string
  onSave?: (value: number) => void
  editable?: boolean
  className?: string
}

export function PriceDisplay({ 
  value, 
  currency = '€',
  onSave,
  editable = true,
  className
}: PriceDisplayProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [showSaved, setShowSaved] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const formatPrice = (price: number) => {
    // Format with comma as decimal separator (EU style)
    const formatted = price.toFixed(2).replace('.', ',')
    // Remove ,00 for whole numbers
    return formatted.endsWith(',00') ? formatted.slice(0, -3) : formatted
  }

  const parsePrice = (input: string) => {
    // Convert comma to dot for parsing
    const normalized = input.replace(',', '.')
    return parseFloat(normalized) || 0
  }

  const handleEdit = () => {
    if (!editable || !onSave) return
    setEditValue(formatPrice(value))
    setIsEditing(true)
  }

  const handleSave = () => {
    const newValue = parsePrice(editValue)
    if (newValue !== value && onSave) {
      onSave(newValue)
      setShowSaved(true)
      setTimeout(() => setShowSaved(false), 1500)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setEditValue('')
    }
  }

  if (isEditing) {
    return (
      <div className="inline-flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => {
            // Allow only numbers and comma
            const val = e.target.value
            if (/^[0-9,]*$/.test(val)) {
              setEditValue(val)
            }
          }}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className={cn(
            "outline-none bg-transparent text-right",
            "ring-2 ring-blue-500 rounded px-1",
            "w-16 font-inherit text-inherit",
            className
          )}
        />
        <span className="ml-1">{currency}</span>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center">
      <span
        onClick={handleEdit}
        className={cn(
          "transition-colors duration-150",
          editable && onSave && "cursor-text hover:bg-gray-50 rounded px-1 -mx-1",
          className
        )}
      >
        {formatPrice(value)}
      </span>
      <span className="ml-1">{currency}</span>
      {showSaved && (
        <Check className="ml-1 h-3 w-3 text-green-600 animate-in fade-in duration-200" />
      )}
    </div>
  )
}