'use client'

import { ReactNode, useEffect, useState } from 'react'
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
}

export default function LegalLayout({
  children,
  title,
  lastUpdated,
  sections,
  activeSection: controlledActiveSection
}: LegalLayoutProps) {
  const [activeSection, setActiveSection] = useState<string>('')
  const [scrollProgress, setScrollProgress] = useState<number>(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const currentProgress = window.scrollY / scrollHeight
      setScrollProgress(currentProgress)

      // Find active section based on scroll position
      const sectionElements = sections.map(section => ({
        id: section.id,
        element: document.getElementById(section.id)
      })).filter(item => item.element)

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const { id, element } = sectionElements[i]
        if (element && element.offsetTop <= window.scrollY + 100) {
          setActiveSection(id)
          break
        }
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [sections])

  const currentActiveSection = controlledActiveSection || activeSection

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 80 // Account for fixed header
      const elementPosition = element.offsetTop - offset
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <>
    <div className="min-h-screen bg-seasalt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h2 className="text-sm font-semibold text-eerie-black/60 uppercase tracking-wider mb-4">
                Table of Contents
              </h2>
              <ScrollArea className="h-[calc(100vh-200px)]">
                <nav className="space-y-2 relative">
                  {/* Scroll Progress Indicator */}
                  <div
                    className="absolute left-0 top-0 w-0.5 bg-spanish-orange transition-all duration-300 rounded-full"
                    style={{
                      height: `${scrollProgress * 100}%`
                    }}
                  />
                  
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={cn(
                        "block w-full text-left px-3 py-2 text-sm rounded-md transition-all duration-200",
                        "hover:bg-spanish-orange/10 hover:text-spanish-orange",
                        currentActiveSection === section.id
                          ? "bg-spanish-orange/10 text-spanish-orange font-medium border-l-2 border-spanish-orange"
                          : "text-eerie-black/70 border-l-2 border-transparent"
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
            className="flex-1 max-w-4xl"
          >
            <header className="mb-8 pb-8 border-b border-cinereous/20">
              <h1 className="text-4xl font-bold text-eerie-black mb-4">{title}</h1>
              <p className="text-sm text-eerie-black/60">
                Last updated: {lastUpdated}
              </p>
            </header>

            <div className="prose prose-lg max-w-none">
              {children}
            </div>

            {/* Contact Section */}
            <section className="mt-16 p-6 bg-spanish-orange/5 rounded-lg border border-spanish-orange/20">
              <h3 className="text-lg font-semibold text-eerie-black mb-2">
                Questions or concerns?
              </h3>
              <p className="text-eerie-black/80 mb-4">
                If you have any questions about these {title.toLowerCase()}, please contact us.
              </p>
              <a
                href="mailto:legal@culi.app"
                className="text-spanish-orange hover:underline font-medium"
              >
                legal@culi.app
              </a>
            </section>
          </motion.main>
        </div>
      </div>

      {/* Mobile Table of Contents - Bottom Sheet */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-cinereous/20 p-4">
        <ScrollArea className="h-16">
          <div className="flex gap-2 pb-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-all duration-200",
                  currentActiveSection === section.id
                    ? "bg-spanish-orange text-white"
                    : "bg-spanish-orange/10 text-eerie-black/70 hover:bg-spanish-orange/20"
                )}
              >
                {section.title}
              </button>
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