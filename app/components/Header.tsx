"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "./ui/button"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, useScroll, useTransform } from "framer-motion"
import { TLLogo } from "./TLLogo"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  
  // Transform values for animations - simple horizontal collapse
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

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How it Works" },
    { href: "#pricing", label: "Pricing" },
  ]

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
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-eerie-black/80 hover:text-spanish-orange transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
            <Button>Try Culi</Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-cinereous/10 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
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
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-eerie-black/80 hover:text-spanish-orange transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="px-4 pt-2">
              <Button className="w-full">Try Culi</Button>
            </div>
          </div>
        )}
      </motion.nav>
    </motion.header>
  )
}