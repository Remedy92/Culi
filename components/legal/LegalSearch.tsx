'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Search, FileText, Shield, Cookie, Scale } from 'lucide-react'
import './LegalSearchDialog.css'

interface SearchItem {
  id: string
  title: string
  description: string
  page: string
  section?: string
  icon: React.ReactNode
}

const searchableContent: SearchItem[] = [
  // Privacy Policy items
  {
    id: 'privacy-overview',
    title: 'Privacy Policy',
    description: 'Learn how we protect your privacy and handle your data',
    page: '/privacy',
    icon: <Shield className="h-4 w-4" />
  },
  {
    id: 'privacy-collection',
    title: 'Information We Collect',
    description: 'What data we collect from restaurant owners and guests',
    page: '/privacy',
    section: 'information-we-collect',
    icon: <Shield className="h-4 w-4" />
  },
  {
    id: 'privacy-usage',
    title: 'How We Use Information',
    description: 'How we use collected data to provide and improve our service',
    page: '/privacy',
    section: 'how-we-use-information',
    icon: <Shield className="h-4 w-4" />
  },
  {
    id: 'privacy-security',
    title: 'Data Storage and Security',
    description: 'Our security measures and data retention policies',
    page: '/privacy',
    section: 'data-storage-security',
    icon: <Shield className="h-4 w-4" />
  },
  {
    id: 'privacy-rights',
    title: 'Your Rights',
    description: 'Your rights regarding your personal data',
    page: '/privacy',
    section: 'your-rights',
    icon: <Shield className="h-4 w-4" />
  },
  
  // Terms of Service items
  {
    id: 'terms-overview',
    title: 'Terms of Service',
    description: 'Our terms and conditions for using Culi',
    page: '/terms',
    icon: <FileText className="h-4 w-4" />
  },
  {
    id: 'terms-acceptable-use',
    title: 'Acceptable Use Policy',
    description: 'What you can and cannot do with our service',
    page: '/terms',
    section: 'acceptable-use',
    icon: <FileText className="h-4 w-4" />
  },
  {
    id: 'terms-payment',
    title: 'Payment Terms',
    description: 'Billing, subscriptions, and payment information',
    page: '/terms',
    section: 'payment-terms',
    icon: <FileText className="h-4 w-4" />
  },
  {
    id: 'terms-termination',
    title: 'Termination',
    description: 'Account termination and suspension policies',
    page: '/terms',
    section: 'termination',
    icon: <FileText className="h-4 w-4" />
  },
  
  // Cookie Policy items
  {
    id: 'cookies-overview',
    title: 'Cookie Policy',
    description: 'How we use cookies and tracking technologies',
    page: '/cookies',
    icon: <Cookie className="h-4 w-4" />
  },
  {
    id: 'cookies-types',
    title: 'Types of Cookies',
    description: 'Essential, functional, and analytics cookies we use',
    page: '/cookies',
    section: 'types-of-cookies',
    icon: <Cookie className="h-4 w-4" />
  },
  {
    id: 'cookies-manage',
    title: 'Managing Cookies',
    description: 'How to control and delete cookies',
    page: '/cookies',
    section: 'managing-cookies',
    icon: <Cookie className="h-4 w-4" />
  },
  
  // GDPR items
  {
    id: 'gdpr-overview',
    title: 'GDPR Compliance',
    description: 'Our compliance with European data protection regulations',
    page: '/gdpr',
    icon: <Scale className="h-4 w-4" />
  },
  {
    id: 'gdpr-rights',
    title: 'Your GDPR Rights',
    description: 'Rights under GDPR including access, rectification, and erasure',
    page: '/gdpr',
    section: 'your-gdpr-rights',
    icon: <Scale className="h-4 w-4" />
  },
  {
    id: 'gdpr-exercise-rights',
    title: 'Exercise Your Rights',
    description: 'How to submit GDPR requests and what to expect',
    page: '/gdpr',
    section: 'exercising-rights',
    icon: <Scale className="h-4 w-4" />
  },
  {
    id: 'gdpr-data-breach',
    title: 'Data Breach Procedures',
    description: 'Our response procedures for data breaches',
    page: '/gdpr',
    section: 'data-breach-procedures',
    icon: <Scale className="h-4 w-4" />
  }
]

export function LegalSearch() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const router = useRouter()

  // Enhanced fuzzy search with ranking
  const filteredItems = searchableContent.filter(item => {
    if (!search.trim()) return true
    
    const searchLower = search.toLowerCase()
    const titleLower = item.title.toLowerCase()
    const descLower = item.description.toLowerCase()
    
    // Exact matches get priority
    if (titleLower === searchLower) return true
    
    // Title contains search
    if (titleLower.includes(searchLower)) return true
    
    // Description contains search
    if (descLower.includes(searchLower)) return true
    
    // Check if all search words appear in title or description
    const searchWords = searchLower.split(' ').filter(word => word.length > 2)
    return searchWords.every(word => 
      titleLower.includes(word) || descLower.includes(word)
    )
  }).sort((a, b) => {
    // Sort by relevance
    const searchLower = search.toLowerCase()
    const aTitle = a.title.toLowerCase()
    const bTitle = b.title.toLowerCase()
    
    // Exact title matches first
    if (aTitle === searchLower) return -1
    if (bTitle === searchLower) return 1
    
    // Title starts with search
    if (aTitle.startsWith(searchLower) && !bTitle.startsWith(searchLower)) return -1
    if (!aTitle.startsWith(searchLower) && bTitle.startsWith(searchLower)) return 1
    
    // Title includes search
    if (aTitle.includes(searchLower) && !bTitle.includes(searchLower)) return -1
    if (!aTitle.includes(searchLower) && bTitle.includes(searchLower)) return 1
    
    return 0
  })

  // Group items by page
  const groupedItems = filteredItems.reduce((acc, item) => {
    const pageName = item.page.replace('/', '').charAt(0).toUpperCase() + 
                     item.page.slice(2).replace('-', ' ')
    if (!acc[pageName]) {
      acc[pageName] = []
    }
    acc[pageName].push(item)
    return acc
  }, {} as Record<string, SearchItem[]>)

  const handleSelect = useCallback((item: SearchItem) => {
    setOpen(false)
    setSearch('') // Clear search after selection
    if (item.section) {
      router.push(`${item.page}#${item.section}`)
    } else {
      router.push(item.page)
    }
  }, [router])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
      
      // Close on Escape
      if (e.key === "Escape" && open) {
        setOpen(false)
        setSearch('')
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open])

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 flex items-center gap-2.5 px-5 py-3 bg-white/90 backdrop-blur-md rounded-full shadow-[0_8px_32px_rgba(58,51,48,0.12)] border border-cinereous/10 hover:bg-white hover:shadow-[0_12px_40px_rgba(58,51,48,0.16)] transition-all duration-300 group"
        aria-label="Search legal documents (Command+K)"
      >
        <Search className="h-4 w-4 text-spanish-orange group-hover:scale-110 transition-transform duration-300" />
        <span className="text-sm font-medium text-eerie-black">Search</span>
        <kbd className="ml-1 pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded bg-cinereous/10 px-1.5 font-mono text-[10px] font-medium text-eerie-black/70 border border-cinereous/20">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog 
        open={open} 
        onOpenChange={setOpen}
        className="search-dialog-content"
      >
        <CommandInput
          placeholder="Search legal documents..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>
            No results found. Try searching for &quot;privacy&quot;, &quot;terms&quot;, &quot;cookies&quot;, or &quot;GDPR&quot;.
          </CommandEmpty>
          {Object.entries(groupedItems).map(([group, items]) => (
            <CommandGroup key={group} heading={group} className="search-group">
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(item)}
                  className="search-item flex items-start gap-3"
                >
                  <div className="search-item-icon mt-0.5">
                    {React.cloneElement(item.icon as React.ReactElement, { className: 'h-4 w-4' })}
                  </div>
                  <div className="flex-1">
                    <div className="search-item-title">
                      {item.title}
                    </div>
                    <div className="search-item-description">
                      {item.description}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}