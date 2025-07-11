'use client'

import { useState, useEffect, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { createClient } from '@/lib/supabase/browser'
import { toast } from 'sonner'
import { 
  Check, 
  X, 
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Sparkles as SparklesIcon,
  Brain,
  Loader2,
  GripVertical,
  AlertTriangle,
  Leaf
} from 'lucide-react'

import { CuliCurveLogo } from '@/app/components/CuliCurveLogo'
import { HoverBorderGradient } from '@/app/components/ui/hover-border-gradient'
import { Sparkles } from '@/app/components/ui/sparkles'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Badge } from '@/app/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ExtractedMenu, MenuItem, MenuSection } from '@/lib/ai/menu/extraction-schemas'

interface EditableField {
  sectionId?: string;
  itemId?: string;
  field: string;
  value: string;
}


export default function MenuValidationPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const resolvedParams = use(params)
  const locale = resolvedParams.locale
  const router = useRouter()
  const searchParams = useSearchParams()
  const menuId = searchParams.get('menuId')
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [extraction, setExtraction] = useState<ExtractedMenu | null>(null)
  const [editingField, setEditingField] = useState<EditableField | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [showAISuggestions, setShowAISuggestions] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    if (!menuId) {
      router.push(`/${locale}/dashboard/menu`)
      return
    }
    checkAuthAndLoadMenu()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuId])

  const checkAuthAndLoadMenu = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('Auth error:', authError)
        toast.error('Authentication failed')
        router.push(`/${locale}/auth`)
        return
      }
      
      if (!user) {
        router.push(`/${locale}/auth`)
        return
      }

      console.log('Fetching restaurant for user:', user.id)
      
      // Use RPC to get restaurant data safely (bypasses RLS recursion)
      const { data: restaurant, error: restaurantError } = await supabase
        .rpc('get_user_restaurant')
        .single()

      if (restaurantError) {
        console.error('Restaurant query error:', restaurantError)
        
        // Handle specific error cases
        if (restaurantError.code === 'PGRST116' || restaurantError.message?.includes('No rows')) {
          console.log('No restaurant found for user, redirecting to onboarding')
          router.push(`/${locale}/onboarding`)
          return
        }
        
        // For other errors, show message and redirect
        toast.error('Failed to load restaurant data')
        router.push(`/${locale}/dashboard/menu`)
        return
      }

      if (!restaurant) {
        console.log('No restaurant data returned, redirecting to onboarding')
        router.push(`/${locale}/onboarding`)
        return
      }

    setRestaurantId(restaurant.id)
    
    // Load menu data
    console.log('Loading menu data for ID:', menuId)
    const { data: menu, error } = await supabase
      .from('menus')
      .select('*')
      .eq('id', menuId)
      .eq('restaurant_id', restaurant.id)
      .single()

    console.log('Menu data loaded:', { 
      menuId, 
      hasMenu: !!menu, 
      hasExtractedData: !!menu?.extracted_data,
      error 
    })

    if (error || !menu) {
      console.error('Menu load error:', error)
      
      // Handle specific error cases
      if (error?.code === '42P17' || error?.message?.includes('infinite recursion')) {
        console.error('RLS recursion error detected:', error)
        toast.error('Database configuration error. Please contact support.')
      } else if (error?.code === 'PGRST116' || error?.message?.includes('No rows')) {
        toast.error('Menu not found or access denied')
      } else {
        toast.error('Failed to load menu data')
      }
      
      router.push(`/${locale}/dashboard/menu`)
      return
    }

    if (menu.extracted_data) {
      console.log('Extracted data found, sections:', menu.extracted_data.sections?.length || 0)
      setExtraction(menu.extracted_data)
      // Expand all sections by default
      setExpandedSections(new Set(menu.extracted_data.sections.map((s: MenuSection) => s.id)))
      setIsLoading(false)
    } else {
      // If no extracted data, try to reload once
      console.error('No extracted data found for menu:', menuId)
      console.log('Full menu object:', menu)
      
      // Try reloading once after a delay
      setTimeout(async () => {
        console.log('Retrying menu load...')
        const { data: retryMenu } = await supabase
          .from('menus')
          .select('*')
          .eq('id', menuId)
          .single()
        
        if (retryMenu?.extracted_data) {
          console.log('Extracted data found on retry')
          setExtraction(retryMenu.extracted_data)
          setExpandedSections(new Set(retryMenu.extracted_data.sections.map((s: MenuSection) => s.id)))
          setIsLoading(false)
        } else {
          toast.error('Menu extraction incomplete. Please try uploading again.')
          router.push(`/${locale}/dashboard/menu`)
        }
      }, 2000)
    }
    } catch (error) {
      console.error('Unexpected error in checkAuthAndLoadMenu:', error)
      toast.error('An unexpected error occurred')
      router.push(`/${locale}/dashboard/menu`)
    }
  }



  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }

  const startEditing = (field: EditableField) => {
    setEditingField(field)
  }

  const cancelEditing = () => {
    setEditingField(null)
  }

  const saveEdit = () => {
    if (!editingField || !extraction) return

    const newExtraction = { ...extraction }
    
    if (editingField.sectionId && editingField.itemId) {
      // Editing item field
      const section = newExtraction.sections.find(s => s.id === editingField.sectionId)
      if (section) {
        const item = section.items.find(i => i.id === editingField.itemId)
        if (item) {
          (item as Record<string, unknown>)[editingField.field] = editingField.value
        }
      }
    } else if (editingField.sectionId) {
      // Editing section field
      const section = newExtraction.sections.find(s => s.id === editingField.sectionId)
      if (section) {
        (section as Record<string, unknown>)[editingField.field] = editingField.value
      }
    }

    setExtraction(newExtraction)
    setEditingField(null)
    setHasChanges(true)
  }

  const deleteItem = (sectionId: string, itemId: string) => {
    if (!extraction) return
    
    const newExtraction = { ...extraction }
    const section = newExtraction.sections.find(s => s.id === sectionId)
    if (section) {
      section.items = section.items.filter(i => i.id !== itemId)
      setExtraction(newExtraction)
      setHasChanges(true)
    }
  }

  const deleteSection = (sectionId: string) => {
    if (!extraction) return
    
    const newExtraction = {
      ...extraction,
      sections: extraction.sections.filter(s => s.id !== sectionId)
    }
    setExtraction(newExtraction)
    setHasChanges(true)
  }

  const reorderSections = (newOrder: MenuSection[]) => {
    if (!extraction) return
    
    setExtraction({
      ...extraction,
      sections: newOrder
    })
    setHasChanges(true)
  }

  const saveChanges = async () => {
    if (!extraction || !menuId || !restaurantId) return
    
    setIsSaving(true)
    
    try {
      const { error } = await supabase
        .from('menus')
        .update({
          extracted_data: extraction,
          is_validated: true,
          validated_at: new Date().toISOString()
        })
        .eq('id', menuId)
        .eq('restaurant_id', restaurantId)

      if (error) throw error
      
      toast.success('Menu saved successfully!')
      setHasChanges(false)
      
      // Redirect to dashboard after save
      setTimeout(() => {
        router.push(`/${locale}/dashboard`)
      }, 1500)
      
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600'
    if (confidence >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-seasalt flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-spanish-orange" />
      </div>
    )
  }

  if (!extraction) {
    return (
      <div className="min-h-screen bg-seasalt flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-spanish-orange" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-seasalt">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-warm">
        <div className="max-w-container-full mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CuliCurveLogo size={32} />
              <div>
                <h1 className="text-xl font-bold text-eerie-black">Validate Your Menu</h1>
                <p className="text-sm text-cinereous">Review and edit AI-extracted items</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {hasChanges && (
                <Badge variant="outline" className="text-spanish-orange border-spanish-orange">
                  Unsaved changes
                </Badge>
              )}
              
              <Button
                variant="outline"
                onClick={() => setShowAISuggestions(!showAISuggestions)}
                className="gap-2"
              >
                <Brain className="h-4 w-4" />
                AI Suggestions
              </Button>
              
              <HoverBorderGradient
                as="button"
                onClick={saveChanges}
                disabled={!hasChanges || isSaving}
                containerClassName="rounded-full"
                className="px-6 py-2 font-medium disabled:opacity-50"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Save & Publish
                  </span>
                )}
              </HoverBorderGradient>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-container-full mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Sections */}
          <div className="lg:col-span-2 space-y-4">
            <Reorder.Group 
              axis="y" 
              values={extraction.sections} 
              onReorder={reorderSections}
              className="space-y-4"
            >
              {extraction.sections.map((section) => (
                <Reorder.Item key={section.id} value={section}>
                  <motion.div
                    layout
                    className="bg-white rounded-2xl shadow-warm-sm overflow-hidden"
                  >
                    {/* Section Header */}
                    <div 
                      className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleSection(section.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                          {expandedSections.has(section.id) ? (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-500" />
                          )}
                          
                          {editingField?.sectionId === section.id && editingField.field === 'name' ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingField.value}
                                onChange={(e) => setEditingField({ ...editingField, value: e.target.value })}
                                className="h-8 px-2"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <Button size="sm" onClick={(e) => { e.stopPropagation(); saveEdit(); }}>
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); cancelEditing(); }}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <h3 
                              className="text-lg font-semibold text-eerie-black hover:text-spanish-orange cursor-text"
                              onClick={(e) => {
                                e.stopPropagation()
                                startEditing({ sectionId: section.id, field: 'name', value: section.name })
                              }}
                            >
                              {section.name}
                            </h3>
                          )}
                          
                          <Badge variant="secondary" className="text-xs">
                            {section.items.length} items
                          </Badge>
                          
                          <span className={cn('text-sm font-medium', getConfidenceColor(section.confidence))}>
                            {section.confidence}%
                          </span>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSection(section.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Section Items */}
                    <AnimatePresence>
                      {expandedSections.has(section.id) && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 space-y-3">
                            {section.items.map((item) => (
                              <MenuItemEditor
                                key={item.id}
                                item={item}
                                sectionId={section.id}
                                editingField={editingField}
                                onEdit={startEditing}
                                onSave={saveEdit}
                                onCancel={cancelEditing}
                                onDelete={() => deleteItem(section.id, item.id)}
                                currency={extraction.metadata.currency}
                              />
                            ))}
                            
                            {/* Add Item Button */}
                            <Button
                              variant="outline"
                              className="w-full border-dashed"
                              onClick={() => {
                                // TODO: Implement add item
                                toast.info('Add item functionality coming soon')
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Item
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
            
            {/* Add Section Button */}
            <Button
              variant="outline"
              className="w-full border-dashed"
              onClick={() => {
                // TODO: Implement add section
                toast.info('Add section functionality coming soon')
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>

          {/* AI Suggestions Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: showAISuggestions ? 1 : 0.5, x: showAISuggestions ? 0 : 20 }}
                className={cn(
                  'bg-white rounded-2xl shadow-warm-sm p-6',
                  !showAISuggestions && 'pointer-events-none'
                )}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="h-5 w-5 text-spanish-orange" />
                  <h3 className="font-semibold text-eerie-black">AI Suggestions</h3>
                </div>
                
                {showAISuggestions ? (
                  <div className="space-y-4">
                    <Sparkles
                      className="absolute inset-0 z-0"
                      particleColor="var(--spanish-orange)"
                      particleDensity={10}
                      minSize={0.3}
                      maxSize={0.6}
                    />
                    
                    <div className="relative z-10 space-y-3">
                      {/* Low confidence items */}
                      {extraction.sections.flatMap(s => 
                        s.items.filter(i => i.confidence < 70)
                      ).length > 0 && (
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <p className="text-sm font-medium text-yellow-800 mb-1">
                            Low Confidence Items
                          </p>
                          <p className="text-xs text-yellow-700">
                            {extraction.sections.flatMap(s => 
                              s.items.filter(i => i.confidence < 70)
                            ).length} items need review
                          </p>
                        </div>
                      )}
                      
                      {/* Missing allergens */}
                      {extraction.sections.flatMap(s => 
                        s.items.filter(i => !i.allergens || i.allergens.length === 0)
                      ).length > 0 && (
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <p className="text-sm font-medium text-orange-800 mb-1">
                            Missing Allergen Info
                          </p>
                          <p className="text-xs text-orange-700">
                            Consider adding allergen information
                          </p>
                        </div>
                      )}
                      
                      <div className="pt-4">
                        <Button
                          className="w-full bg-spanish-orange hover:bg-spanish-orange/90"
                          onClick={() => {
                            toast.info('AI auto-fix coming soon!')
                          }}
                        >
                          <SparklesIcon className="h-4 w-4 mr-2" />
                          Auto-Fix All
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-cinereous">
                    Click to see AI suggestions
                  </p>
                )}
              </motion.div>
              
              {/* Stats */}
              <div className="mt-6 bg-white rounded-2xl shadow-warm-sm p-6">
                <h3 className="font-semibold text-eerie-black mb-4">Extraction Stats</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-cinereous">Total Sections</span>
                    <span className="font-medium">{extraction.sections.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cinereous">Total Items</span>
                    <span className="font-medium">{extraction.items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cinereous">Overall Confidence</span>
                    <span className={cn('font-medium', getConfidenceColor(extraction.overallConfidence))}>
                      {extraction.overallConfidence}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cinereous">Language</span>
                    <span className="font-medium">{extraction.metadata.language.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Component for editing individual menu items
function MenuItemEditor({
  item,
  sectionId,
  editingField,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  currency = '€'
}: {
  item: MenuItem
  sectionId: string
  editingField: EditableField | null
  onEdit: (field: EditableField) => void
  onSave: () => void
  onCancel: () => void
  onDelete: () => void
  currency?: string
}) {
  const isEditing = (field: string) => 
    editingField?.sectionId === sectionId && 
    editingField?.itemId === item.id && 
    editingField?.field === field

  return (
    <div className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          {/* Name */}
          <div className="flex items-center gap-2">
            {isEditing('name') ? (
              <>
                <Input
                  value={editingField!.value}
                  onChange={(e) => onEdit({ ...editingField!, value: e.target.value })}
                  className="h-8 px-2 flex-1"
                />
                <Button size="sm" onClick={onSave}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={onCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <h4 
                className="font-medium text-eerie-black hover:text-spanish-orange cursor-text flex-1"
                onClick={() => onEdit({ sectionId, itemId: item.id, field: 'name', value: item.name })}
              >
                {item.name}
              </h4>
            )}
          </div>
          
          {/* Description */}
          {(item.description || isEditing('description')) && (
            <div>
              {isEditing('description') ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editingField!.value}
                    onChange={(e) => onEdit({ ...editingField!, value: e.target.value })}
                    className="h-8 px-2 flex-1 text-sm"
                    placeholder="Add description..."
                  />
                  <Button size="sm" onClick={onSave}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={onCancel}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <p 
                  className="text-sm text-cinereous hover:text-spanish-orange cursor-text"
                  onClick={() => onEdit({ 
                    sectionId, 
                    itemId: item.id, 
                    field: 'description', 
                    value: item.description || '' 
                  })}
                >
                  {item.description || <span className="italic">Add description...</span>}
                </p>
              )}
            </div>
          )}
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-2">
            {item.allergens && item.allergens.length > 0 && (
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-orange-600" />
                <span className="text-xs text-orange-600">
                  {item.allergens.join(', ')}
                </span>
              </div>
            )}
            
            {item.dietaryTags && item.dietaryTags.length > 0 && (
              <div className="flex items-center gap-1">
                <Leaf className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600">
                  {item.dietaryTags.join(', ')}
                </span>
              </div>
            )}
            
            <span className={cn('text-xs', getConfidenceColor(item.confidence))}>
              {item.confidence}% confidence
            </span>
          </div>
        </div>
        
        {/* Price and Actions */}
        <div className="flex items-center gap-3">
          {isEditing('price') ? (
            <>
              <Input
                type="number"
                step="0.01"
                value={editingField!.value}
                onChange={(e) => onEdit({ ...editingField!, value: e.target.value })}
                className="h-8 px-2 w-20 text-right"
              />
              <Button size="sm" onClick={onSave}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={onCancel}>
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <p 
              className="font-semibold text-lg text-eerie-black hover:text-spanish-orange cursor-text"
              onClick={() => onEdit({ 
                sectionId, 
                itemId: item.id, 
                field: 'price', 
                value: item.price?.toString() || '0' 
              })}
            >
              {currency}{item.price?.toFixed(2) || '0.00'}
            </p>
          )}
          
          <Button
            size="sm"
            variant="ghost"
            className="text-red-500 hover:text-red-600"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function getConfidenceColor(confidence: number) {
  if (confidence >= 90) return 'text-green-600'
  if (confidence >= 70) return 'text-yellow-600'
  return 'text-red-600'
}