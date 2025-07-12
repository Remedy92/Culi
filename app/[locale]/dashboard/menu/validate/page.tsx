'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Reorder } from 'framer-motion'
import { createClient } from '@/lib/supabase/browser'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

import { Accordion } from '@/components/ui/accordion'
import type { ExtractedMenu, MenuItem, MenuSection } from '@/lib/ai/menu/extraction-schemas'

// Import new components
import { MenuHeader } from './components/MenuHeader'
import { MenuSection as MenuSectionComponent } from './components/MenuSection'
import { MenuItem as MenuItemComponent } from './components/MenuItem'
import { FloatingActions } from './components/FloatingActions'


type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'


// Currency code to symbol mapping
const currencySymbols: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  JPY: '¥',
  CHF: 'CHF',
  CAD: 'C$',
  AUD: 'A$',
  CNY: '¥',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
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
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [, setLastSaved] = useState<Date | undefined>()
  const [validatedItems, setValidatedItems] = useState<Set<string>>(new Set())
  const [validatedSections, setValidatedSections] = useState<Set<string>>(new Set())
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set())
  
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
      
      // Load validation state if exists
      if (menu.extracted_data.validation) {
        setValidatedItems(new Set(menu.extracted_data.validation.validatedItems || []))
        setValidatedSections(new Set(menu.extracted_data.validation.validatedSections || []))
      }
      
      // Expand first section by default
      setExpandedSections([menu.extracted_data.sections[0]?.id].filter(Boolean))
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
          setExpandedSections([retryMenu.extracted_data.sections[0]?.id].filter(Boolean))
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



  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      if (prev.includes(sectionId)) {
        return prev.filter(id => id !== sectionId)
      }
      return [...prev, sectionId]
    })
  }, [])

  const updateMenuItem = useCallback((sectionId: string, itemId: string, updates: Partial<MenuItem>) => {
    if (!extraction) return
    
    const newExtraction = { ...extraction }
    newExtraction.sections = newExtraction.sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map(item => 
            item.id === itemId ? { ...item, ...updates } : item
          )
        }
      }
      return section
    })
    
    setExtraction(newExtraction)
    setHasChanges(true)
  }, [extraction])

  const updateSection = useCallback((sectionId: string, updates: Partial<MenuSection>) => {
    if (!extraction) return
    
    const newExtraction = {
      ...extraction,
      sections: extraction.sections.map(section => 
        section.id === sectionId ? { ...section, ...updates } : section
      )
    }
    
    setExtraction(newExtraction)
    setHasChanges(true)
  }, [extraction])

  const deleteItem = useCallback((sectionId: string, itemId: string) => {
    if (!extraction) return
    
    const newExtraction = { ...extraction }
    const section = newExtraction.sections.find(s => s.id === sectionId)
    if (section) {
      section.items = section.items.filter(i => i.id !== itemId)
      setExtraction(newExtraction)
      setHasChanges(true)
      toast.success('Item deleted')
    }
  }, [extraction])

  const deleteSection = useCallback((sectionId: string) => {
    if (!extraction) return
    
    const newExtraction = {
      ...extraction,
      sections: extraction.sections.filter(s => s.id !== sectionId)
    }
    setExtraction(newExtraction)
    setHasChanges(true)
    toast.success('Section deleted')
  }, [extraction])

  const reorderSections = useCallback((newOrder: MenuSection[]) => {
    if (!extraction) return
    
    setExtraction({
      ...extraction,
      sections: newOrder
    })
    setHasChanges(true)
  }, [extraction])

  const saveChanges = useCallback(async () => {
    if (!extraction || !menuId || !restaurantId) return
    
    setIsSaving(true)
    setSaveStatus('saving')
    
    try {
      // Add validation data to extraction
      const extractionWithValidation = {
        ...extraction,
        validation: {
          validatedItems: Array.from(validatedItems),
          validatedSections: Array.from(validatedSections),
          validatedAt: new Date().toISOString()
        }
      }

      const { error } = await supabase
        .from('menus')
        .update({
          extracted_data: extractionWithValidation,
          is_validated: true,
          validated_at: new Date().toISOString()
        })
        .eq('id', menuId)
        .eq('restaurant_id', restaurantId)

      if (error) throw error
      
      toast.success('Menu saved successfully!')
      setHasChanges(false)
      setSaveStatus('saved')
      setLastSaved(new Date())
      
      // Redirect to dashboard after save
      setTimeout(() => {
        router.push(`/${locale}/dashboard`)
      }, 1500)
      
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save changes')
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }, [extraction, menuId, restaurantId, locale, router, supabase, validatedItems, validatedSections])

  const handleAddSection = useCallback(() => {
    toast.info('Add section functionality coming soon')
  }, [])

  const handleAddItem = useCallback(() => {
    toast.info('Add item functionality coming soon')
  }, [])

  const toggleItemSelection = useCallback((itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }, [])


  const getSectionSelectionState = useCallback((section: MenuSection): 'checked' | 'unchecked' | 'indeterminate' => {
    const itemIds = section.items.map(item => item.id)
    const checkedCount = itemIds.filter(id => selectedItems.has(id)).length
    
    if (checkedCount === 0) return 'unchecked'
    if (checkedCount === itemIds.length) return 'checked'
    return 'indeterminate'
  }, [selectedItems])

  const getSectionValidationState = useCallback((section: MenuSection): 'checked' | 'unchecked' | 'indeterminate' => {
    const itemIds = section.items.map(item => item.id)
    const checkedCount = itemIds.filter(id => validatedItems.has(id)).length
    
    if (checkedCount === 0) return 'unchecked'
    if (checkedCount === itemIds.length) return 'checked'
    return 'indeterminate'
  }, [validatedItems])

  const selectAll = useCallback(() => {
    if (!extraction) return
    
    const allItemIds = extraction.sections.flatMap(section => 
      section.items.map(item => item.id)
    )
    const allSectionIds = extraction.sections.map(section => section.id)
    
    setSelectedItems(new Set(allItemIds))
    setSelectedSections(new Set(allSectionIds))
  }, [extraction])

  const clearAll = useCallback(() => {
    setSelectedItems(new Set())
    setSelectedSections(new Set())
  }, [])

  const validateSelected = useCallback(() => {
    // Validate all selected items
    setValidatedItems(prev => {
      const newSet = new Set(prev)
      selectedItems.forEach(id => newSet.add(id))
      return newSet
    })
    
    // Validate all selected sections
    setValidatedSections(prev => {
      const newSet = new Set(prev)
      selectedSections.forEach(id => newSet.add(id))
      return newSet
    })
    
    // Clear selection after validation
    setSelectedItems(new Set())
    setSelectedSections(new Set())
    
    setHasChanges(true)
    toast.success(`${selectedItems.size} items validated successfully!`)
  }, [selectedItems, selectedSections])

  const toggleSectionSelection = useCallback((sectionId: string) => {
    if (!extraction) return
    
    const section = extraction.sections.find(s => s.id === sectionId)
    if (!section) return
    
    const itemIds = section.items.map(item => item.id)
    const isCurrentlySelected = selectedSections.has(sectionId)
    
    setSelectedSections(prev => {
      const newSet = new Set(prev)
      if (isCurrentlySelected) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
    
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (isCurrentlySelected) {
        // Deselect all items in this section
        itemIds.forEach(id => newSet.delete(id))
      } else {
        // Select all items in this section
        itemIds.forEach(id => newSet.add(id))
      }
      return newSet
    })
  }, [extraction, selectedSections])


  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (hasChanges) {
          saveChanges()
        }
      }
      // Cmd/Ctrl + A to select all
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault()
        selectAll()
      }
      // Escape to clear selection
      if (e.key === 'Escape' && selectedItems.size > 0) {
        e.preventDefault()
        clearAll()
      }
      // Enter to validate selected
      if (e.key === 'Enter' && selectedItems.size > 0) {
        e.preventDefault()
        validateSelected()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasChanges, saveChanges, selectAll, clearAll, selectedItems.size, validateSelected])

  if (isLoading || !extraction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-notion-sm text-notion-tertiary">Loading...</div>
      </div>
    )
  }

  // Check if this is the first time user is visiting
  const isFirstVisit = extraction.sections.length === 0 || 
    (extraction.sections.length === 1 && extraction.sections[0].items.length === 0)

  // Calculate validation progress
  const totalItems = extraction.sections.reduce((acc, section) => acc + section.items.length, 0)
  const totalSections = extraction.sections.length
  const validatedItemCount = validatedItems.size
  const validatedSectionCount = validatedSections.size
  const totalValidatable = totalItems + totalSections
  const totalValidated = validatedItemCount + validatedSectionCount
  const validationProgress = totalValidatable > 0 ? (totalValidated / totalValidatable) * 100 : 0

  return (
    <div className="min-h-screen bg-warm-50">
      {/* Minimal Header */}
      <MenuHeader
        hasChanges={hasChanges}
        isSaving={isSaving}
        onSave={saveChanges}
      />

      {/* Main Content */}
      <main className="mx-auto max-w-container-wide px-4 pt-20 pb-24">
        <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Instructions and Progress */}
        <div className="mb-6">
          {isFirstVisit ? (
            <div className="text-notion-sm text-warm-secondary">
              <p>Click any text to edit. Check off items as you validate them.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-notion-xs">
                <span className="text-warm-secondary">Validation Progress</span>
                <span className="text-notion-primary font-medium">
                  {totalValidated} of {totalValidatable} validated
                </span>
              </div>
              <div className="h-2 bg-warm-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-spanish-orange transition-all duration-300"
                  style={{ width: `${validationProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <Accordion 
          type="multiple" 
          value={expandedSections}
          className="space-y-4"
        >
          <Reorder.Group 
            axis="y" 
            values={extraction.sections} 
            onReorder={reorderSections}
            className="space-y-4"
          >
            {extraction.sections.map((section) => (
              <Reorder.Item key={section.id} value={section}>
                <MenuSectionComponent
                  section={section}
                  isExpanded={expandedSections.includes(section.id)}
                  selectionState={getSectionSelectionState(section)}
                  validationState={getSectionValidationState(section)}
                  onToggleSelection={() => toggleSectionSelection(section.id)}
                  onToggle={() => toggleSection(section.id)}
                  onUpdate={(updates) => updateSection(section.id, updates)}
                  onDelete={() => deleteSection(section.id)}
                  onAddItem={handleAddItem}
                >
                  {section.items.map((item) => (
                    <MenuItemComponent
                      key={item.id}
                      item={item}
                      currency={currencySymbols[extraction.metadata.currency] || extraction.metadata.currency}
                      isSelected={selectedItems.has(item.id)}
                      isValidated={validatedItems.has(item.id)}
                      onToggleSelection={() => toggleItemSelection(item.id)}
                      onUpdate={(updates) => updateMenuItem(section.id, item.id, updates)}
                      onDelete={() => deleteItem(section.id, item.id)}
                    />
                  ))}
                </MenuSectionComponent>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </Accordion>
        
        {/* Add Section Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleAddSection}
            className={cn(
              "flex items-center gap-2 py-3 px-6",
              "text-notion-sm text-warm-secondary",
              "rounded-lg border border-dashed border-warm",
              "transition-colors duration-150",
              "hover:border-spanish-orange hover:text-spanish-orange hover:bg-warm-100"
            )}
          >
            <Plus className="h-4 w-4" />
            Add section
          </button>
        </div>
        </div>
      </main>

      {/* Save Indicator - Notion style */}
      {saveStatus === 'saved' && (
        <div className="fixed bottom-6 left-6 text-notion-sm text-warm-secondary bg-warm-50 px-4 py-2 rounded shadow-sm">
          ✓ Saved
        </div>
      )}

      {/* Floating Actions Bar */}
      <FloatingActions
        selectedCount={selectedItems.size}
        totalCount={totalItems}
        onSelectAll={selectAll}
        onClearAll={clearAll}
        onValidateSelected={validateSelected}
      />
    </div>
  )
}