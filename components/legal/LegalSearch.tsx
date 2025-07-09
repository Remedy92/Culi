'use client'

import { useEffect, useState, useCallback } from 'react'
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

  // Filter search results
  const filteredItems = searchableContent.filter(item => {
    const searchLower = search.toLowerCase()
    return (
      item.title.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower)
    )
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
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2 bg-spanish-orange text-white rounded-full shadow-warm-lg hover:bg-spanish-orange/90 transition-all duration-200 hover:scale-105"
      >
        <Search className="h-4 w-4" />
        <span className="text-sm font-medium">Search</span>
        <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-white/20 bg-white/10 px-1.5 font-mono text-[10px] font-medium">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search legal pages..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {Object.entries(groupedItems).map(([group, items]) => (
            <CommandGroup key={group} heading={group}>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(item)}
                  className="flex items-start gap-3 py-3"
                >
                  <div className="mt-0.5 text-eerie-black/60">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-eerie-black">
                      {item.title}
                    </div>
                    <div className="text-sm text-eerie-black/60">
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