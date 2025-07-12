'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import type { MenuItem, MenuSection } from '@/lib/ai/menu/extraction-schemas'

interface EditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'item' | 'section'
  data: MenuItem | MenuSection | null
  currency?: string
  onSave: (data: MenuItem | MenuSection) => void
}

export function EditDialog({ 
  open, 
  onOpenChange, 
  type, 
  data, 
  currency = '€',
  onSave 
}: EditDialogProps) {
  const [formData, setFormData] = useState<MenuItem | MenuSection | null>(null)
  const [allergenInput, setAllergenInput] = useState('')
  const [dietaryTagInput, setDietaryTagInput] = useState('')

  useEffect(() => {
    if (data) {
      setFormData({ ...data })
    }
  }, [data])

  const handleSave = useCallback(() => {
    if (formData) {
      onSave(formData)
      onOpenChange(false)
    }
  }, [formData, onSave, onOpenChange])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (open) {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
          handleSave()
        }
        if (e.key === 'Escape') {
          onOpenChange(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, formData, handleSave, onOpenChange])

  const addAllergen = () => {
    if (allergenInput.trim() && formData) {
      const allergens = formData.allergens || []
      if (!allergens.includes(allergenInput.trim())) {
        setFormData({
          ...formData,
          allergens: [...allergens, allergenInput.trim()]
        })
      }
      setAllergenInput('')
    }
  }

  const removeAllergen = (allergen: string) => {
    if (formData) {
      setFormData({
        ...formData,
        allergens: (formData.allergens || []).filter((a: string) => a !== allergen)
      })
    }
  }

  const addDietaryTag = () => {
    if (dietaryTagInput.trim() && formData) {
      const tags = formData.dietaryTags || []
      if (!tags.includes(dietaryTagInput.trim())) {
        setFormData({
          ...formData,
          dietaryTags: [...tags, dietaryTagInput.trim()]
        })
      }
      setDietaryTagInput('')
    }
  }

  const removeDietaryTag = (tag: string) => {
    if (formData) {
      setFormData({
        ...formData,
        dietaryTags: (formData.dietaryTags || []).filter((t: string) => t !== tag)
      })
    }
  }

  if (!formData) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-max-w-container-narrow mx-auto">
        <DialogHeader>
          <DialogTitle>
            Edit {type === 'item' ? 'Menu Item' : 'Section'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={type === 'item' ? 'Item name' : 'Section name'}
              className="w-full"
            />
          </div>

          {/* Item-specific fields */}
          {type === 'item' && (
            <>
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description"
                  className="w-full"
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {currency}
                  </span>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Allergens */}
              <div className="space-y-2">
                <Label>Allergens</Label>
                <div className="flex gap-2">
                  <Input
                    value={allergenInput}
                    onChange={(e) => setAllergenInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addAllergen()
                      }
                    }}
                    placeholder="Add allergen"
                    className="flex-1"
                  />
                  <Button type="button" onClick={addAllergen} size="sm">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(formData.allergens || []).map((allergen: string) => (
                    <Badge
                      key={allergen}
                      variant="secondary"
                      className="gap-1"
                    >
                      {allergen}
                      <button
                        onClick={() => removeAllergen(allergen)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Dietary Tags */}
              <div className="space-y-2">
                <Label>Dietary Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={dietaryTagInput}
                    onChange={(e) => setDietaryTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addDietaryTag()
                      }
                    }}
                    placeholder="Add dietary tag"
                    className="flex-1"
                  />
                  <Button type="button" onClick={addDietaryTag} size="sm">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(formData.dietaryTags || []).map((tag: string) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="gap-1 bg-green-100 text-green-700"
                    >
                      {tag}
                      <button
                        onClick={() => removeDietaryTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <p className="text-xs text-muted-foreground">
              Press <kbd className="px-1 py-0.5 text-xs bg-gray-100 rounded">⌘</kbd>+<kbd className="px-1 py-0.5 text-xs bg-gray-100 rounded">Enter</kbd> to save
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-spanish-orange hover:bg-spanish-orange/90">
                Save Changes
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}