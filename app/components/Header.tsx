"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "./ui/button"
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
} from "./ui/navigation-menu"
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
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full"
        style={{
          paddingTop: headerPadding,
          paddingBottom: headerPadding
        }}
      >
        <div className="flex h-full items-center justify-between">
          <div className="flex items-center">
            <div className="relative w-[120px] h-10 flex items-center">
              {/* Full TableLink text */}
              <motion.div
                style={{
                  scaleX: logoScaleX,
                  opacity: logoOpacity
                }}
                className="absolute inset-0 flex items-center justify-center origin-center"
              >
                <Link href="/" className="text-2xl font-bold text-eerie-black whitespace-nowrap">
                  TableLink
                </Link>
              </motion.div>
              
              {/* TL Logo */}
              <motion.div
                style={{
                  scale: tlLogoScale
                }}
                className="absolute inset-0 flex items-center justify-center"
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
                            Discover how Culi transforms your restaurant&apos;s guest experience
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

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-cinereous/10 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={t('mobileMenuToggle')}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 animate-slide-down">
            <Link
              href="/features"
              className="block px-4 py-2 text-eerie-black/80 hover:text-spanish-orange transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('navigation.features')}
            </Link>
            <Link
              href="/pricing"
              className="block px-4 py-2 text-eerie-black/80 hover:text-spanish-orange transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('navigation.pricing')}
            </Link>
            <div className="px-4 pt-2">
              <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full">{t('navigation.tryFree')}</Button>
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