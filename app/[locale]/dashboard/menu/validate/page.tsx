'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Reorder } from 'framer-motion'
import { createClient } from '@/lib/supabase/browser'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'

import { Accordion } from '@/app/components/ui/accordion'
import { Button } from '@/app/components/ui/button'
import type { ExtractedMenu, MenuItem, MenuSection } from '@/lib/ai/menu/extraction-schemas'

// Import new components
import { MenuHeader } from './components/MenuHeader'
import { MenuSection as MenuSectionComponent } from './components/MenuSection'
import { MenuItem as MenuItemComponent } from './components/MenuItem'
import { EditDialog } from './components/EditDialog'
import { AIPanel } from './components/AIPanel'
import { QuickActions } from './components/QuickActions'
import { SaveIndicator } from './components/SaveIndicator'

interface EditableField {
  type: 'item' | 'section'
  data: MenuItem | MenuSection | null
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'


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
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [showAISuggestions, setShowAISuggestions] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [lastSaved, setLastSaved] = useState<Date | undefined>()
  
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

  const handleEdit = useCallback((type: 'item' | 'section', data: MenuItem | MenuSection) => {
    setEditingField({ type, data })
  }, [])

  const handleEditSave = useCallback((updatedData: MenuItem | MenuSection) => {
    if (!extraction || !editingField) return

    const newExtraction = { ...extraction }
    
    if (editingField.type === 'item') {
      // Find and update the item
      newExtraction.sections = newExtraction.sections.map(section => ({
        ...section,
        items: section.items.map(item => 
          item.id === (updatedData as MenuItem).id ? updatedData as MenuItem : item
        )
      }))
    } else {
      // Update section
      newExtraction.sections = newExtraction.sections.map(section => 
        section.id === (updatedData as MenuSection).id ? updatedData as MenuSection : section
      )
    }

    setExtraction(newExtraction)
    setEditingField(null)
    setHasChanges(true)
  }, [extraction, editingField])

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
  }, [extraction, menuId, restaurantId, locale, router, supabase])

  const handleAddSection = useCallback(() => {
    toast.info('Add section functionality coming soon')
  }, [])

  const handleAddItem = useCallback(() => {
    toast.info('Add item functionality coming soon')
  }, [])

  const handleApplyAISuggestion = useCallback(() => {
    toast.success('Suggestion applied')
    setHasChanges(true)
  }, [])

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
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasChanges, saveChanges])

  if (isLoading || !extraction) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-seasalt to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-spanish-orange mx-auto" />
          <p className="text-sm text-muted-foreground">Loading your menu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-seasalt to-white">
      {/* Floating Header */}
      <MenuHeader
        hasChanges={hasChanges}
        isSaving={isSaving}
        onSave={saveChanges}
        onToggleAI={() => setShowAISuggestions(!showAISuggestions)}
        showAI={showAISuggestions}
      />

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 pt-20 pb-24">
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
                  onToggle={() => toggleSection(section.id)}
                  onDelete={() => deleteSection(section.id)}
                  onAddItem={handleAddItem}
                >
                  {section.items.map((item) => (
                    <MenuItemComponent
                      key={item.id}
                      item={item}
                      currency={extraction.metadata.currency}
                      onEdit={() => handleEdit('item', item)}
                      onDelete={() => deleteItem(section.id, item.id)}
                    />
                  ))}
                </MenuSectionComponent>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </Accordion>
        
        {/* Add Section Button */}
        <Button
          variant="outline"
          className="w-full mt-6 border-dashed hover:border-spanish-orange hover:text-spanish-orange"
          onClick={handleAddSection}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </main>

      {/* Floating AI Panel */}
      <AIPanel
        open={showAISuggestions}
        onOpenChange={setShowAISuggestions}
        extraction={extraction}
        onApplySuggestion={handleApplyAISuggestion}
        isMobile={false}
      />
      
      {/* Mobile Quick Actions */}
      <QuickActions
        hasChanges={hasChanges}
        onSave={saveChanges}
        onAddSection={handleAddSection}
        onToggleAI={() => setShowAISuggestions(!showAISuggestions)}
        showAI={showAISuggestions}
        isSaving={isSaving}
      />
      
      {/* Save Indicator */}
      <SaveIndicator
        status={saveStatus}
        lastSaved={lastSaved}
      />
      
      {/* Edit Dialog */}
      <EditDialog
        open={!!editingField}
        onOpenChange={(open) => !open && setEditingField(null)}
        type={editingField?.type || 'item'}
        data={editingField?.data || null}
        currency={extraction.metadata.currency}
        onSave={handleEditSave}
      />
    </div>
  )
}