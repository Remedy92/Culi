'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
] as const;

interface LanguageSwitcherProps {
  isMobile?: boolean;
}

export default function LanguageSwitcher({ isMobile = false }: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    const newPathname = pathname.replace(`/${locale}`, `/${langCode}`);
    
    // Set a cookie to remember the language preference
    document.cookie = `NEXT_LOCALE=${langCode}; path=/; max-age=${60 * 60 * 24 * 365}`;
    
    router.push(newPathname);
    setIsOpen(false);
  };

  // Mobile version - simple buttons
  if (isMobile) {
    return (
      <div className="flex gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`flex items-center gap-2 px-3 py-2 min-h-[44px] min-w-[44px] rounded-lg transition-colors touch-manipulation ${
              locale === lang.code 
                ? 'bg-spanish-orange text-white' 
                : 'bg-seasalt text-eerie-black hover:bg-cinereous/20 active:bg-cinereous/30'
            }`}
            aria-label={`Switch to ${lang.name}`}
            aria-current={locale === lang.code ? 'true' : 'false'}
          >
            <span className="text-sm font-medium">{lang.code.toUpperCase()}</span>
          </button>
        ))}
      </div>
    );
  }

  // Desktop dropdown version
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 min-h-[44px] text-sm font-medium text-eerie-black hover:text-spanish-orange rounded-lg hover:bg-seasalt transition-colors touch-manipulation"
        aria-label="Select language"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="hidden sm:inline">{currentLanguage.name}</span>
        <span className="sm:hidden">{currentLanguage.code.toUpperCase()}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 py-2 w-48 bg-timberwolf rounded-lg shadow-warm-lg border border-cinereous/20 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex items-center gap-3 w-full px-4 py-3 min-h-[44px] text-sm text-left hover:bg-seasalt transition-colors ${
                locale === lang.code ? 'bg-seasalt text-spanish-orange font-medium' : 'text-eerie-black'
              }`}
              aria-current={locale === lang.code ? 'true' : 'false'}
            >
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.name}</span>
              {locale === lang.code && (
                <span className="ml-auto text-spanish-orange">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}