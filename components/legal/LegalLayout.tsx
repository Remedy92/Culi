'use client'

import { ReactNode, useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { LegalSearch } from '@/components/legal/LegalSearch'

interface LegalLayoutProps {
  children: ReactNode
  title: string
  lastUpdated: string
  sections: {
    id: string
    title: string
  }[]
  activeSection?: string
  openAccordionSection?: string
  onAccordionChange?: (sectionId: string) => void
}

export default function LegalLayout({
  children,
  title,
  lastUpdated,
  sections,
  activeSection: controlledActiveSection,
  openAccordionSection,
  onAccordionChange
}: LegalLayoutProps) {
  const [activeSection, setActiveSection] = useState<string>('')
  const [indicatorPosition, setIndicatorPosition] = useState<number>(0)
  const sectionRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({})
  const navRef = useRef<HTMLElement>(null)
  const isAutoScrolling = useRef(false)

  // Set initial active section from URL hash
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash && sections.some(s => s.id === hash)) {
      // Set auto-scrolling flag
      isAutoScrolling.current = true
      setActiveSection(hash)
      
      // Scroll to section after a brief delay
      setTimeout(() => {
        const element = document.getElementById(hash)
        if (element) {
          const offset = 100
          const elementPosition = element.offsetTop - offset
          window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
          })
        }
        
        // Reset flag after scroll
        setTimeout(() => {
          isAutoScrolling.current = false
        }, 600)
      }, 100)
    }
  }, [sections])

  // Sync accordion state with active section and scroll
  useEffect(() => {
    if (openAccordionSection) {
      // Set auto-scrolling flag
      isAutoScrolling.current = true
      
      // Update active section
      setActiveSection(openAccordionSection)
      
      // Scroll to the section after a brief delay for accordion animation
      setTimeout(() => {
        const element = document.getElementById(openAccordionSection)
        if (element) {
          const offset = 100 // Account for header and some padding
          const elementPosition = element.offsetTop - offset
          window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
          })
        }
        
        // Reset auto-scrolling flag after animation
        setTimeout(() => {
          isAutoScrolling.current = false
        }, 500)
      }, 100) // Wait for accordion to start opening
    }
  }, [openAccordionSection])

  useEffect(() => {
    const handleScroll = () => {
      // Skip updates during auto-scrolling
      if (isAutoScrolling.current) return

      // Find active section based on scroll position
      const sectionElements = sections.map(section => ({
        id: section.id,
        element: document.getElementById(section.id)
      })).filter(item => item.element)

      let currentSectionId = ''

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const { id, element } = sectionElements[i]
        if (element && element.offsetTop <= window.scrollY + 100) {
          currentSectionId = id
          break
        }
      }

      if (currentSectionId) {
        setActiveSection(currentSectionId)


        // Update indicator position immediately for smooth movement
        const activeButton = sectionRefs.current[currentSectionId]
        if (activeButton && navRef.current) {
          const navRect = navRef.current.getBoundingClientRect()
          const buttonRect = activeButton.getBoundingClientRect()
          const relativeTop = buttonRect.top - navRect.top
          setIndicatorPosition(relativeTop)
        }
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [sections])

  const currentActiveSection = controlledActiveSection || activeSection

  // Update indicator position when active section changes
  useEffect(() => {
    if (!currentActiveSection || !navRef.current) return

    // Use requestAnimationFrame for smooth updates
    const animationFrame = requestAnimationFrame(() => {
      const activeButton = sectionRefs.current[currentActiveSection]
      if (activeButton && navRef.current) {
        const navRect = navRef.current.getBoundingClientRect()
        const buttonRect = activeButton.getBoundingClientRect()
        const relativeTop = buttonRect.top - navRect.top
        setIndicatorPosition(relativeTop)
      }
    })

    return () => cancelAnimationFrame(animationFrame)
  }, [currentActiveSection])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      // Set auto-scrolling flag
      isAutoScrolling.current = true
      
      const offset = 80 // Account for fixed header
      const elementPosition = element.offsetTop - offset
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
      
      // Also open the accordion section if callback is provided
      if (onAccordionChange) {
        onAccordionChange(sectionId)
      }
      
      // Reset auto-scrolling flag after animation completes
      setTimeout(() => {
        isAutoScrolling.current = false
      }, 600) // Slightly longer than smooth scroll duration
    }
  }

  return (
    <>
    <div className="min-h-screen bg-seasalt">
      <div className="max-w-max-w-container-full mx-auto mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-eerie-black/80 hover:text-spanish-orange transition-colors duration-200 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="flex gap-8">
          {/* Table of Contents - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <h2 className="text-xs font-bold text-[#6B5D58] uppercase tracking-[0.1em] mb-6">
                Table of Contents
              </h2>
              <ScrollArea className="h-[calc(100vh-200px)]">
                <nav ref={navRef} className="space-y-2 relative">
                  {/* Scroll Progress Indicator */}
                  <motion.div
                    className="absolute left-0 w-1 bg-spanish-orange rounded-full shadow-[0_0_8px_rgba(225,110,39,0.5)] pointer-events-none z-10"
                    initial={false}
                    animate={{
                      y: indicatorPosition,
                      height: activeSection ? 36 : 0,
                      opacity: activeSection ? 1 : 0
                    }}
                    transition={{
                      y: { type: "spring", stiffness: 300, damping: 30 },
                      height: { duration: 0.2, ease: "easeOut" },
                      opacity: { duration: 0.2 }
                    }}
                    style={{
                      marginTop: 2 // Small offset to perfectly center with button
                    }}
                  />
                  
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      ref={(el) => { sectionRefs.current[section.id] = el }}
                      onClick={() => scrollToSection(section.id)}
                      className={cn(
                        "block w-full text-left px-4 py-3 text-[0.8125rem] rounded-md transition-all duration-200 relative",
                        "hover:bg-spanish-orange/5 hover:text-spanish-orange",
                        "tracking-[-0.01em] leading-tight",
                        currentActiveSection === section.id
                          ? "bg-spanish-orange/5 text-spanish-orange font-semibold pl-6"
                          : "text-[#6B5D58] pl-6 font-medium"
                      )}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
              </ScrollArea>
            </div>
          </aside>

          {/* Main Content */}
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 max-w-max-w-container-wide mx-auto"
          >
            <header className="mb-10 pb-10 border-b border-cinereous/15">
              <h1 className="text-[2.5rem] font-bold text-eerie-black mb-5 tracking-[-0.02em] leading-tight">{title}</h1>
              <p className="text-sm text-[#6B5D58] font-medium tracking-wide uppercase">
                Last updated: {lastUpdated}
              </p>
            </header>

            <div className="legal-content">
              {children}
            </div>

            {/* Contact Section */}
            <section className="mt-20 p-8 bg-gradient-to-r from-spanish-orange/[0.03] to-transparent rounded-lg border border-spanish-orange/15">
              <h3 className="text-lg font-semibold text-eerie-black mb-3 tracking-[-0.01em]">
                Questions or concerns?
              </h3>
              <p className="text-[#2A2220] mb-5 leading-relaxed">
                If you have any questions about these {title.toLowerCase()}, please contact us.
              </p>
              <a
                href="mailto:legal@culi.app"
                className="text-spanish-orange hover:text-spanish-orange/80 font-medium underline underline-offset-2 transition-colors duration-200"
              >
                legal@culi.app
              </a>
            </section>
          </motion.main>
        </div>
      </div>

      {/* Mobile Table of Contents - Bottom Sheet */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-cinereous/20 p-4 z-50">
        <ScrollArea className="h-16">
          <div className="flex gap-2 pb-2 relative">
            {sections.map((section) => (
              <motion.button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-all duration-200 relative",
                  currentActiveSection === section.id
                    ? "bg-spanish-orange text-white shadow-warm-md"
                    : "bg-spanish-orange/10 text-eerie-black/70 hover:bg-spanish-orange/20"
                )}
                whileTap={{ scale: 0.95 }}
              >
                {section.title}
                {currentActiveSection === section.id && (
                  <motion.div
                    className="absolute -bottom-1 left-1/2 w-1 h-1 bg-spanish-orange rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{ x: '-50%' }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
    
    {/* Search Component */}
    <LegalSearch />
    </>
  )
}