"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, ChefHat, Languages, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, useScroll, useTransform } from "framer-motion"
import { TLLogo } from "./TLLogo"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { useTranslations } from 'next-intl'
import LanguageSwitcher from './LanguageSwitcher'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  const t = useTranslations('header')
  
  // Transform values for animations
  const logoScaleX = useTransform(scrollY, [0, 80], [1, 0])
  const logoOpacity = useTransform(scrollY, [50, 80], [1, 0])
  const tlLogoScale = useTransform(scrollY, [30, 80], [0, 1])
  const headerHeight = useTransform(scrollY, [0, 100], [64, 56])
  const headerPadding = useTransform(scrollY, [0, 100], [16, 12])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
        isScrolled
          ? "bg-timberwolf/95 backdrop-blur-md shadow-warm"
          : "bg-transparent"
      )}
      style={{
        height: headerHeight
      }}
    >
      <motion.nav 
        className="mx-auto max-w-max-w-container-full mx-auto px-4 sm:px-6 lg:px-8 h-full"
        style={{
          paddingTop: headerPadding,
          paddingBottom: headerPadding
        }}
      >
        <div className="flex h-full items-center justify-between">
          <div className="flex items-center">
            <div className="relative w-[120px] h-10 flex items-center">
              {/* Full TableLink text - hidden on mobile */}
              <motion.div
                style={{
                  scaleX: logoScaleX,
                  opacity: logoOpacity
                }}
                className="absolute inset-0 flex items-center justify-center origin-center hidden md:flex"
              >
                <Link href="/" className="text-2xl font-black text-eerie-black whitespace-nowrap">
                  <span className="text-3xl font-serif">C</span>uli
                </Link>
              </motion.div>
              
              {/* TL Logo - always visible on mobile, no animation */}
              <div className="absolute inset-0 flex items-center justify-center md:hidden">
                <Link href="/" className="block">
                  <TLLogo size="md" />
                </Link>
              </div>
              
              {/* TL Logo for desktop animation */}
              <motion.div
                style={{
                  scale: tlLogoScale
                }}
                className="absolute inset-0 hidden md:flex items-center justify-center"
              >
                <Link href="/" className="block">
                  <TLLogo size="md" />
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-eerie-black/80">
                    {t('navigation.features')}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[400px] p-4">
                      <div className="mb-4 pb-4 border-b border-cinereous/10">
                        <Link href="/features" className="block">
                          <h3 className="text-lg font-semibold text-eerie-black mb-2 hover:text-spanish-orange transition-colors">
                            {t('featuresMenu.exploreAll')}
                          </h3>
                          <p className="text-sm text-eerie-black/60">
                            Discover how <span className="font-black"><span className="font-serif">C</span>uli</span> transforms your restaurant&apos;s guest experience
                          </p>
                        </Link>
                      </div>
                      <ul className="grid gap-3">
                        <FeatureItem
                          href="/#features"
                          icon={<ChefHat className="h-5 w-5" />}
                          title={t('featuresMenu.aiAssistant')}
                          description="Instant answers about dishes, ingredients, and allergens"
                        />
                        <FeatureItem
                          href="/#translation-demo"
                          icon={<Languages className="h-5 w-5" />}
                          title={t('featuresMenu.allLanguages')}
                          description="Serve international guests in their native language"
                        />
                        <FeatureItem
                          href="/analytics-demo"
                          icon={<BarChart3 className="h-5 w-5" />}
                          title={t('featuresMenu.analyticsDashboard')}
                          description="Track popular dishes and customer preferences"
                        />
                      </ul>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/pricing" className={cn(navigationMenuTriggerStyle(), "text-eerie-black/80")}>
                      {t('navigation.pricing')}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            <LanguageSwitcher />
            <Link href="/auth">
              <Button>{t('navigation.tryFree')}</Button>
            </Link>
          </div>

          {/* Mobile Menu Button - with proper touch target */}
          <button
            className="md:hidden p-3 -m-1 rounded-lg hover:bg-cinereous/10 active:bg-cinereous/20 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={t('mobileMenuToggle')}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation - Enhanced with better touch targets and language switcher */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-1 animate-slide-down border-t border-cinereous/10 mt-2 bg-timberwolf rounded-b-lg">
            {/* Features Dropdown */}
            <details className="group">
              <summary className="flex items-center justify-between px-4 py-3 min-h-[48px] text-eerie-black/80 hover:text-spanish-orange hover:bg-seasalt/50 active:bg-seasalt transition-colors duration-200 cursor-pointer touch-manipulation">
                <span className="font-medium">{t('navigation.features')}</span>
                <ChefHat className="h-5 w-5 transition-transform group-open:rotate-180" />
              </summary>
              <div className="bg-seasalt py-2">
                <Link
                  href="/features"
                  className="flex items-center gap-3 px-6 py-3 min-h-[48px] text-eerie-black/70 hover:text-spanish-orange hover:bg-seasalt/50 active:bg-seasalt transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-sm">{t('featuresMenu.exploreAll')}</span>
                </Link>
                <Link
                  href="/#features"
                  className="flex items-center gap-3 px-6 py-3 min-h-[48px] text-eerie-black/70 hover:text-spanish-orange hover:bg-seasalt/50 active:bg-seasalt transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ChefHat className="h-4 w-4" />
                  <span className="text-sm">{t('featuresMenu.aiAssistant')}</span>
                </Link>
                <Link
                  href="/#translation-demo"
                  className="flex items-center gap-3 px-6 py-3 min-h-[48px] text-eerie-black/70 hover:text-spanish-orange hover:bg-seasalt/50 active:bg-seasalt transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Languages className="h-4 w-4" />
                  <span className="text-sm">{t('featuresMenu.allLanguages')}</span>
                </Link>
                <Link
                  href="/analytics-demo"
                  className="flex items-center gap-3 px-6 py-3 min-h-[48px] text-eerie-black/70 hover:text-spanish-orange hover:bg-seasalt/50 active:bg-seasalt transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-sm">{t('featuresMenu.analyticsDashboard')}</span>
                </Link>
              </div>
            </details>
            
            <Link
              href="/pricing"
              className="flex items-center px-4 py-3 min-h-[48px] text-eerie-black/80 hover:text-spanish-orange hover:bg-seasalt/50 active:bg-seasalt transition-colors duration-200 touch-manipulation"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="font-medium">{t('navigation.pricing')}</span>
            </Link>
            
            {/* Language Switcher in Mobile Menu */}
            <div className="px-4 py-3 border-t border-cinereous/10 mt-2">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-eerie-black/60">{t('navigation.language')}</span>
                <Languages className="h-4 w-4 text-eerie-black/40" />
              </div>
              <div className="block">
                <LanguageSwitcher isMobile={true} />
              </div>
            </div>
            
            {/* CTA Button */}
            <div className="px-4 pt-4 pb-2">
              <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full h-12 text-base touch-manipulation">{t('navigation.tryFree')}</Button>
              </Link>
            </div>
          </div>
        )}
      </motion.nav>
    </motion.header>
  )
}

// Feature Item Component
function FeatureItem({ href, icon, title, description }: {
  href: string
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <li>
      <Link
        href={href}
        className="block p-3 rounded-lg hover:bg-seasalt transition-colors group"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-spanish-orange/10 text-spanish-orange group-hover:bg-spanish-orange group-hover:text-white transition-colors">
            {icon}
          </div>
          <div>
            <h4 className="font-medium text-eerie-black mb-1">{title}</h4>
            <p className="text-sm text-eerie-black/60">{description}</p>
          </div>
        </div>
      </Link>
    </li>
  )
}