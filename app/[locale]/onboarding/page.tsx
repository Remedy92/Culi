'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/browser'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Checkbox } from '@/app/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/app/components/ui/form'
import { CuliCurveLogo, CuliLogoLoading } from '@/app/components/CuliCurveLogo'
import { TypewriterEffectSmooth } from '@/app/components/ui/typewriter-effect'
import { CheckCircle, Edit2 } from 'lucide-react'

const formSchema = z.object({
  restaurantName: z.string().min(2, {
    message: "Restaurant name must be at least 2 characters.",
  }),
  acceptPrivacy: z.boolean().refine((val) => val === true, {
    message: "You must accept the privacy policy to continue.",
  }),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms of service to continue.",
  }),
  marketingEmails: z.boolean(),
})

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showSecondMessage, setShowSecondMessage] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  
  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Show second message after first one completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSecondMessage(true)
    }, 2000) // Adjust timing based on first message length
    return () => clearTimeout(timer)
  }, [])

  // Scroll to form when shown with mobile-friendly behavior
  useEffect(() => {
    if (showForm) {
      // Delay to allow animation to start
      setTimeout(() => {
        const formElement = document.querySelector('.legal-requirements-form')
        if (formElement) {
          // Use different scroll behavior for mobile vs desktop
          const isMobile = window.innerWidth < 640
          if (isMobile) {
            // On mobile, scroll to center the form with some top offset
            const elementRect = formElement.getBoundingClientRect()
            const absoluteElementTop = elementRect.top + window.pageYOffset
            const middle = absoluteElementTop - (window.innerHeight / 3)
            window.scrollTo({ top: middle, behavior: 'smooth' })
          } else {
            // On desktop, use standard scroll into view
            formElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
              inline: 'nearest'
            })
          }
        }
      }, 400)
    }
  }, [showForm])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      restaurantName: "",
      acceptPrivacy: false,
      acceptTerms: false,
      marketingEmails: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        throw new Error('Authentication error: ' + userError.message)
      }
      
      if (!user || !user.id) {
        throw new Error('No authenticated user found. Please sign in again.')
      }
      

      // Generate a slug from the restaurant name
      const slug = values.restaurantName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        
      if (!slug) {
        throw new Error('Restaurant name must contain at least one letter or number')
      }

      // Create the restaurant
      const { error: restaurantError } = await supabase
        .from('restaurants')
        .insert({
          name: values.restaurantName,
          slug,
          owner_id: user.id,
          email: user.email,
        })

      if (restaurantError) {
        if (restaurantError.code === '23505') { // Unique violation
          throw new Error('A restaurant with this name already exists. Please choose a different name.')
        }
        throw new Error(restaurantError.message || 'Failed to create restaurant')
      }

      // Record GDPR consents
      const consents = [
        { consent_type: 'privacy_policy', consent_given: values.acceptPrivacy },
        { consent_type: 'terms_of_service', consent_given: values.acceptTerms },
        { consent_type: 'marketing_emails', consent_given: values.marketingEmails },
      ]

      for (const consent of consents) {
        const { error: consentError } = await supabase
          .from('gdpr_consents')
          .insert({
            user_id: user.id,
            email: user.email!,
            ...consent,
            given_at: consent.consent_given ? new Date().toISOString() : null,
          })
          
        if (consentError) {
          // Continue with other consents even if one fails - non-critical error
        }
      }

      toast.success('Welcome to Culi! Your restaurant has been created.')
      
      // Get locale from URL
      const locale = window.location.pathname.split('/')[1]
      router.push(`/${locale}/dashboard`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-6 pb-32 sm:pb-8 safe-area-inset">
      {/* Header */}
      <div className="w-full mb-8 sm:mb-12">
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <CuliCurveLogo size={32} className="sm:w-9 sm:h-9" />
          <div className="relative">
            <span className="text-2xl sm:text-3xl font-black text-eerie-black">
              <span className="text-3xl sm:text-4xl font-serif">C</span>uli
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Chat Interface */}
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {/* Culi's Message */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-warm flex items-center justify-center">
              <CuliCurveLogo size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-none shadow-warm-lg p-3 sm:p-4 max-w-[85%] sm:max-w-md">
              <div className="space-y-2">
                {reducedMotion ? (
                  <>
                    <p className="text-sm sm:text-base text-eerie-black">
                      Hi! I&apos;m Culi, your AI menu assistant. Let&apos;s get your restaurant set up!
                    </p>
                    {showSecondMessage && (
                      <p className="text-sm sm:text-base text-eerie-black">
                        What&apos;s the name of your restaurant?
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <TypewriterEffectSmooth
                      words={[
                        { text: "Hi!" },
                        { text: "I'm" },
                        { text: "Culi," },
                        { text: "your" },
                        { text: "AI" },
                        { text: "menu" },
                        { text: "assistant." },
                        { text: "Let's" },
                        { text: "get" },
                        { text: "your" },
                        { text: "restaurant" },
                        { text: "set" },
                        { text: "up!" }
                      ]}
                      className="text-sm sm:text-base text-eerie-black"
                    />
                    {showSecondMessage && (
                      <TypewriterEffectSmooth
                        words={[
                          { text: "What's" },
                          { text: "the" },
                          { text: "name" },
                          { text: "of" },
                          { text: "your" },
                          { text: "restaurant?" }
                        ]}
                        className="text-sm sm:text-base text-eerie-black"
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* User's Response */}
          {form.watch("restaurantName") && showForm && (
            <div className="flex items-start gap-3 justify-end animate-fade-in">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-spanish-orange text-white rounded-2xl rounded-tr-none shadow-warm-lg p-3 sm:p-4 max-w-[85%] sm:max-w-md relative group hover:bg-opacity-90 transition-all cursor-pointer touch-manipulation"
                title="Click to edit restaurant name"
              >
                <div className="flex items-center gap-2">
                  <p className="text-sm sm:text-base">{form.watch("restaurantName")}</p>
                  <Edit2 className="w-3 h-3 sm:w-4 sm:h-4 text-white/70" />
                </div>
              </button>
            </div>
          )}

          {/* Culi's Follow-up */}
          {showForm && (
            <div className="flex items-start gap-3 animate-fade-in">
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-warm flex items-center justify-center">
                <CuliCurveLogo size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-none shadow-warm-lg p-3 sm:p-4 max-w-[85%] sm:max-w-md">
                {reducedMotion ? (
                  <p className="text-sm sm:text-base text-eerie-black">
                    Great! Before we continue, I need you to review and accept our policies.
                  </p>
                ) : (
                  <TypewriterEffectSmooth
                    words={[
                      { text: "Great!" },
                      { text: "Before" },
                      { text: "we" },
                      { text: "continue," },
                      { text: "I" },
                      { text: "need" },
                      { text: "you" },
                      { text: "to" },
                      { text: "review" },
                      { text: "and" },
                      { text: "accept" },
                      { text: "our" },
                      { text: "policies." }
                    ]}
                    className="text-sm sm:text-base text-eerie-black"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Chat Input Section */}
        <div className={`${showForm ? '' : 'fixed bottom-4 left-4 right-4 sm:static sm:bottom-auto sm:left-auto sm:right-auto'} bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-none border border-gray-100 sm:border-t sm:border-x-0 sm:border-b-0 shadow-lg p-3 sm:p-4 md:static md:bg-transparent md:border-0 md:p-0 md:shadow-none transition-all duration-300 safe-area-bottom`}>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Restaurant Name Input - Chat Style */}
              {!showForm && (
                <div className="max-w-2xl mx-auto">
                  <FormField
                    control={form.control}
                    name="restaurantName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="bg-white rounded-2xl shadow-warm-sm p-2">
                            <div className="flex items-center gap-2">
                              <Input 
                                placeholder="Type your restaurant name..." 
                                disabled={isLoading}
                                className="flex-1 h-10 sm:h-12 px-4 bg-transparent border-0 text-sm sm:text-base focus:outline-none focus:ring-0 placeholder:text-gray-400 placeholder:text-sm"
                                {...field} 
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && field.value && !showForm) {
                                    e.preventDefault()
                                    setShowForm(true)
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => field.value && setShowForm(true)}
                                className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-spanish-orange text-white rounded-xl flex items-center justify-center hover:bg-opacity-90 transition-all disabled:opacity-50 shadow-sm touch-manipulation"
                                disabled={!field.value || isLoading}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 19V5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M5 12L12 5L19 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage className="mt-2 text-center" />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {showForm && (
                <div className="max-w-2xl mx-auto">
                  <div className="bg-white rounded-2xl sm:rounded-3xl shadow-warm-xl p-4 sm:p-6 md:p-8 mt-4 sm:mt-6 animate-fade-in legal-requirements-form">
                    <h3 className="text-sm font-medium text-eerie-black mb-4">Legal Requirements</h3>
                
                <FormField
                  control={form.control}
                  name="acceptPrivacy"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-3 touch-manipulation">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                          className="mt-0.5 w-5 h-5 sm:w-4 sm:h-4"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-relaxed">
                        <FormLabel className="text-sm sm:text-base font-normal cursor-pointer select-none leading-relaxed">
                          I accept the{' '}
                          <a href="/privacy" target="_blank" className="text-spanish-orange hover:underline underline-offset-2 touch-manipulation inline-block py-1">
                            Privacy Policy
                          </a>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-3 touch-manipulation">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                          className="mt-0.5 w-5 h-5 sm:w-4 sm:h-4"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-relaxed">
                        <FormLabel className="text-sm sm:text-base font-normal cursor-pointer select-none leading-relaxed">
                          I accept the{' '}
                          <a href="/terms" target="_blank" className="text-spanish-orange hover:underline underline-offset-2 touch-manipulation inline-block py-1">
                            Terms of Service
                          </a>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <div className="border-t border-gray-100 my-3"></div>

                <FormField
                  control={form.control}
                  name="marketingEmails"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-3 touch-manipulation">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                          className="mt-0.5 w-5 h-5 sm:w-4 sm:h-4"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-relaxed">
                        <FormLabel className="text-sm sm:text-base font-normal cursor-pointer select-none text-gray-600">
                          Send me tips and updates about Culi (optional)
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                  </div>
                </div>
              )}

              {showForm && (
                <div className="max-w-2xl mx-auto mt-6 animate-fade-in">
                  <Button
                    type="submit"
                    className="w-full py-4 sm:py-6 text-base sm:text-lg touch-manipulation"
                    size="lg"
                    disabled={isLoading || !form.watch("acceptPrivacy") || !form.watch("acceptTerms")}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <CuliLogoLoading size={20} color="white" />
                        Creating your restaurant...
                      </span>
                    ) : (
                      'Continue'
                    )}
                  </Button>
                </div>
              )}
            </form>
          </Form>

          {showForm && (
            <div className="max-w-2xl mx-auto mt-8 animate-fade-in">
              <div className="p-3 sm:p-4 bg-timberwolf/30 rounded-xl sm:rounded-2xl">
                <h3 className="font-medium text-eerie-black mb-2 flex items-center text-sm sm:text-base">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-spanish-orange flex-shrink-0" />
                  What happens next?
                </h3>
                <ul className="space-y-1 text-xs sm:text-sm text-cinereous">
                  <li>• Upload your menu (PDF, image, or text)</li>
                  <li>• Culi&apos;s AI will extract and understand your dishes</li>
                  <li>• Get a QR code for guests to scan</li>
                  <li>• Start answering questions in any language!</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}