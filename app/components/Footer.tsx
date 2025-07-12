import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import { useTranslations } from 'next-intl'

export function Footer() {
  const t = useTranslations('footer');
  
  const footerLinks = {
    [t('categories.product')]: [
      { name: t('links.features'), href: "#features" },
      { name: "How it Works", href: "#how-it-works" },
      { name: t('links.pricing'), href: "#pricing" },
      { name: "Demo", href: "#demo" },
    ],
    [t('categories.company')]: [
      { name: t('links.about'), href: "#" },
      { name: t('links.blog'), href: "#" },
      { name: t('links.careers'), href: "#" },
      { name: t('links.contact'), href: "#" },
    ],
    [t('categories.resources')]: [
      { name: t('links.documentation'), href: "#" },
      { name: t('links.support'), href: "#" },
      { name: "API", href: "#" },
      { name: "Status", href: "#" },
    ],
    [t('categories.legal')]: [
      { name: t('links.privacy'), href: "/privacy" },
      { name: t('links.terms'), href: "/terms" },
      { name: t('links.cookies'), href: "/cookies" },
      { name: t('links.gdpr'), href: "/gdpr" },
    ],
  }

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "#" },
    { name: "Twitter", icon: Twitter, href: "#" },
    { name: "Instagram", icon: Instagram, href: "#" },
    { name: "LinkedIn", icon: Linkedin, href: "#" },
  ];
  return (
    <footer className="bg-gradient-to-b from-eerie-black to-eerie-black/95 text-seasalt/80">
      <div className="mx-auto max-w-max-w-container-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
          {/* Brand column */}
          <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-1 text-center sm:text-left">
            <Link href="/" className="text-xl md:text-2xl font-black text-seasalt inline-block">
              <span className="text-2xl md:text-3xl font-serif">C</span>uli
            </Link>
            <p className="mt-3 md:mt-4 text-xs md:text-sm max-w-container-prose mx-auto sm:mx-0">
              {t('tagline')}
            </p>
            <div className="mt-4 md:mt-6 flex gap-2 md:gap-4 justify-center sm:justify-start">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="text-seasalt/60 hover:text-spanish-orange active:text-spanish-orange transition-colors p-2 -m-2 touch-manipulation"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5 md:h-6 md:w-6" />
                </Link>
              ))}
            </div>
          </div>

          {/* Links columns - responsive grid */}
          {Object.entries(footerLinks).map(([category, links], index) => (
            <div 
              key={category} 
              className={`
                ${index < 2 ? 'col-span-1' : 'col-span-1 sm:col-span-1'}
                ${index === 3 ? 'sm:col-start-2 md:col-start-auto' : ''}
              `}
            >
              <h3 className="text-xs md:text-sm font-semibold text-seasalt mb-3 md:mb-4 uppercase tracking-wider">
                {category}
              </h3>
              <ul className="space-y-2 md:space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-xs md:text-sm hover:text-spanish-orange active:text-spanish-orange transition-colors inline-block py-1 -my-1 touch-manipulation"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-seasalt/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 md:gap-4 text-center sm:text-left">
            <p className="text-xs md:text-sm order-2 sm:order-1">
              {t('copyright')}
            </p>
            <p className="text-xs md:text-sm order-1 sm:order-2">
              {t.rich('poweredBy', {
                highlight: (chunks) => <span className="text-spanish-orange font-medium">{chunks}</span>
              })}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}