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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-2xl font-bold text-seasalt">
              TableLink
            </Link>
            <p className="mt-4 text-sm">
              {t('tagline')}
            </p>
            <div className="mt-6 flex gap-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="text-seasalt/60 hover:text-spanish-orange transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-seasalt mb-4">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-spanish-orange transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-seasalt/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">
              {t('copyright')}
            </p>
            <p className="text-sm">
              {t.rich('poweredBy', {
                highlight: (chunks) => <span className="text-spanish-orange">{chunks}</span>
              })}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}