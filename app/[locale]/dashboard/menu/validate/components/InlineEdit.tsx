'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InlineEditProps {
  value: string
  onSave: (value: string) => void
  className?: string
  placeholder?: string
  multiline?: boolean
  type?: 'text' | 'number'
}

export function InlineEdit({ 
  value, 
  onSave, 
  className,
  placeholder = 'Empty',
  multiline = false,
  type = 'text'
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [showSaved, setShowSaved] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setEditValue(value)
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      if ('select' in inputRef.current) {
        inputRef.current.select()
      }
    }
  }, [isEditing])

  const handleSave = useCallback(() => {
    const trimmedValue = editValue.trim()
    if (trimmedValue !== value) {
      onSave(trimmedValue || '')
      setShowSaved(true)
      setTimeout(() => setShowSaved(false), 1500)
    }
    setIsEditing(false)
  }, [editValue, value, onSave])

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }


  useEffect(() => {
    const clickHandler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleSave()
      }
    }
    
    if (isEditing) {
      document.addEventListener('mousedown', clickHandler)
      return () => document.removeEventListener('mousedown', clickHandler)
    }
  }, [isEditing, handleSave])

  const displayValue = value || placeholder

  if (!isEditing) {
    return (
      <div className="relative inline-flex items-center">
        <div
          ref={containerRef}
          onClick={() => setIsEditing(true)}
          className={cn(
            "cursor-text transition-colors duration-150",
            "hover:bg-warm-100 rounded px-1 -mx-1",
            !value && "text-warm-secondary",
            className
          )}
        >
          {displayValue}
        </div>
        {showSaved && (
          <Check className="ml-1 h-3 w-3 text-green-600 animate-in fade-in duration-200" />
        )}
      </div>
    )
  }

  const InputComponent = multiline ? 'textarea' : 'input'

  const inputWidth = multiline ? '100%' : `${Math.max(100, editValue.length * 9)}px`

  return (
    <div ref={containerRef} className="relative inline-flex min-w-0 max-w-full">
      <InputComponent
        ref={inputRef as React.Ref<HTMLInputElement> | React.Ref<HTMLTextAreaElement>}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        className={cn(
          "outline-none bg-transparent",
          "focus-warm rounded px-1 -mx-1",
          "font-inherit text-inherit min-w-[80px] max-w-full",
          multiline && "resize-none overflow-hidden w-full",
          className
        )}
        style={multiline ? { minHeight: '1.5em' } : { width: inputWidth }}
      />
    </div>
  )
}