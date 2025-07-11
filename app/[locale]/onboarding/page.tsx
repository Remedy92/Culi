'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/browser'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { CuliCurveLogo, CuliLogoLoading } from '@/app/components/CuliCurveLogo'
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect'
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
})

export default function OnboardingPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const resolvedParams = use(params)
  const locale = resolvedParams.locale
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showSecondMessage, setShowSecondMessage] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  
  // Check if user already has a restaurant
  useEffect(() => {
    const checkExistingRestaurant = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Use SECURITY DEFINER function to avoid RLS recursion
        const { data: hasRestaurant } = await supabase
          .rpc('user_has_restaurant')
          .single()
        
        if (hasRestaurant) {
          console.log('User already has a restaurant, redirecting to menu')
          router.push(`/${locale}/dashboard/menu`)
        }
      }
    }
    
    checkExistingRestaurant()
  }, [locale, router, supabase])
  
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
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('Form submission started', values)
    setIsLoading(true)
    setErrorMessage(null)

    // Declare variables outside inner try block for proper scoping
    let restaurantId: string | null = null
    let membershipCreated = false

    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      console.log('Current user:', user)
      
      if (userError) {
        console.error('Auth error:', userError)
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

      // First check if user already has a restaurant using SECURITY DEFINER function
      const { data: existingRestaurant } = await supabase
        .rpc('get_user_restaurant')
        .single()
      
      if (existingRestaurant) {
        console.log('User already has a restaurant:', existingRestaurant)
        toast.success('You already have a restaurant! Redirecting...')
        router.push(`/${locale}/dashboard/menu`)
        return
      }

      console.log('Creating restaurant with slug:', slug)

      // Generate UUID client-side to avoid recursion issues
      restaurantId = crypto.randomUUID()

      try {
        // Step 1: Create the restaurant without .select() to avoid triggering policies
        const { error: restaurantError } = await supabase
          .from('restaurants')
          .insert({
            id: restaurantId,
            name: values.restaurantName,
            slug,
            owner_id: user.id,
            email: user.email || '',
          })

        if (restaurantError) {
          if (restaurantError.code === '23505') { // Unique violation - expected error
            const message = 'A restaurant with this name already exists. Please choose a different name.'
            setErrorMessage(message)
            toast.error(message)
            setIsLoading(false)
            return // Exit early for expected errors
          }
          
          // Only log and throw unexpected errors
          console.error('Restaurant creation error:', restaurantError)
          throw new Error(restaurantError.message || 'Failed to create restaurant')
        }

        // Step 2: Create owner membership to avoid recursion when selecting
        const { error: memberError } = await supabase
          .from('restaurant_members')
          .insert({
            restaurant_id: restaurantId,
            user_id: user.id,
            role: 'owner',
            accepted_at: new Date().toISOString(),
          })

        if (memberError) {
          // Only log unexpected membership errors
          if (!memberError.message?.includes('already exists')) {
            console.error('Membership creation error:', memberError)
          }
          throw new Error('Failed to create restaurant membership: ' + memberError.message)
        }

        membershipCreated = true

        // Step 3: Use the data we already have instead of SELECT (avoids recursion)
        const restaurantData = {
          id: restaurantId,
          name: values.restaurantName,
          slug,
          owner_id: user.id,
          email: user.email || '',
          // Default values from database
          tier: 'free',
          monthly_conversations: 0,
          monthly_tokens_used: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        console.log('Restaurant created:', restaurantData)

      // Record GDPR consents
      const consents = [
        { consent_type: 'privacy_policy', consent_given: values.acceptPrivacy },
        { consent_type: 'terms_of_service', consent_given: values.acceptTerms },
      ]

      for (const consent of consents) {
        try {
          const { error: consentError } = await supabase
            .from('gdpr_consents')
            .insert({
              user_id: user.id,
              email: user.email || '',
              ...consent,
              given_at: consent.consent_given ? new Date().toISOString() : null,
            })
            
          if (consentError) {
            console.warn('GDPR consent error (non-critical):', consentError)
            // Continue with other consents even if one fails - non-critical error
          }
        } catch (consentError) {
          console.warn('GDPR consent error (non-critical):', consentError)
          // Continue - GDPR consent errors shouldn't block restaurant creation
        }
      }

      console.log('Restaurant created successfully')
      toast.success('Welcome to Culi! Your restaurant has been created.')
      
      // Redirect to menu upload instead of dashboard
      router.push(`/${locale}/dashboard/menu`)
      } catch (creationError) {
        // Rollback on error: delete partial data
        console.error('Rolling back due to error:', creationError)
        
        try {
          // Delete membership if it was created
          if (membershipCreated && restaurantId) {
            await supabase
              .from('restaurant_members')
              .delete()
              .eq('restaurant_id', restaurantId)
              .eq('user_id', user.id)
          }
          
          // Delete restaurant
          if (restaurantId) {
            await supabase
              .from('restaurants')
              .delete()
              .eq('id', restaurantId)
          }
        } catch (cleanupError) {
          console.error('Rollback error:', cleanupError)
        }
        
        throw creationError // Re-throw the original error
      }
    } catch (error) {
      // Don't log here - we've already logged unexpected errors where they occurred
      const message = error instanceof Error ? error.message : 'Something went wrong'
      setErrorMessage(message)
      toast.error(message)
    } finally {
      // Always set loading to false
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-seasalt px-4 py-6 pb-32 sm:pb-8 safe-area-inset">
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

      <div className="max-w-container-narrow mx-auto">
        {/* Chat Interface */}
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {/* Culi's Message */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full border-minimal flex items-center justify-center">
              <CuliCurveLogo size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-none border-minimal p-3 sm:p-4 max-w-[85%] sm:max-w-container-narrow">
              <div className="space-y-2">
                {reducedMotion ? (
                  <>
                    <p className="text-xs sm:text-sm text-eerie-black font-light">
                      Hi! I&apos;m Culi, your AI menu assistant. Let&apos;s get your restaurant set up!
                    </p>
                    {showSecondMessage && (
                      <p className="text-xs sm:text-sm text-eerie-black font-light">
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
                className="bg-spanish-orange text-white rounded-2xl rounded-tr-none p-3 sm:p-4 max-w-[85%] sm:max-w-container-narrow relative group hover:bg-opacity-90 transition-all cursor-pointer touch-manipulation"
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
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full border-minimal flex items-center justify-center">
                <CuliCurveLogo size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-none border-minimal p-3 sm:p-4 max-w-[85%] sm:max-w-container-narrow">
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

        {/* Chat Input Section - Minimalist */}
        {!showForm && (
          <div className="fixed bottom-0 left-0 right-0 p-4 safe-area-bottom sm:static sm:p-0">
            <Form {...form}>
              <form onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit(onSubmit)(e)
              }}>
                <FormField
                  control={form.control}
                  name="restaurantName"
                  render={({ field }) => (
                    <FormItem>
                      <div className="relative max-w-container-narrow mx-auto">
                        <input 
                          type="text"
                          placeholder="Type your restaurant name..." 
                          disabled={isLoading}
                          className="w-full h-12 sm:h-14 pl-4 pr-14 bg-white border border-gray-100 rounded-xlarge text-sm sm:text-base focus:!outline-none focus:!ring-0 focus:!ring-offset-0 focus:!border-gray-200 focus-visible:!outline-none focus-visible:!ring-0 placeholder:text-gray-400 transition-colors"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            if (errorMessage) {
                              setErrorMessage(null)
                            }
                          }}
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
                          className="absolute right-2 top-2 bottom-2 w-8 h-8 sm:w-10 sm:h-10 bg-spanish-orange text-white rounded-large flex items-center justify-center hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!field.value || isLoading}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M5 12L12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                      <FormMessage className="mt-2 text-center text-sm" />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        )}

        {/* Legal Form Section */}
        {showForm && (
          <Form {...form}>
            <form onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit(onSubmit)(e)
            }} className="space-y-6">

              {showForm && (
                <div className="max-w-container-narrow mx-auto">
                  {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 animate-fade-in">
                      <p className="text-sm">{errorMessage}</p>
                    </div>
                  )}
                  <div className="mt-4 sm:mt-6 animate-fade-in">
                    <h3 className="text-sm font-medium text-eerie-black mb-4 px-1">Legal Requirements</h3>
                    
                    <div className="space-y-3">
                      <FormField
                  control={form.control}
                  name="acceptPrivacy"
                  render={({ field }) => (
                    <FormItem>
                      <label 
                        htmlFor="privacy-checkbox"
                        className="relative flex w-full items-start gap-3 rounded-large border border-gray-100 bg-white p-4 shadow-sm outline-none cursor-pointer hover:border-gray-200 transition-colors has-[:checked]:border-spanish-orange/30 has-[:checked]:bg-spanish-orange/5"
                      >
                        <Checkbox
                          id="privacy-checkbox"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                          className="order-1 after:absolute after:inset-0 data-[state=checked]:bg-spanish-orange data-[state=checked]:border-spanish-orange"
                          aria-describedby="privacy-description"
                        />
                        <div className="grow">
                          <span className="text-sm sm:text-base">
                            I accept the{' '}
                            <a 
                              href="/privacy" 
                              target="_blank" 
                              className="text-spanish-orange hover:underline underline-offset-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Privacy Policy
                            </a>
                          </span>
                        </div>
                      </label>
                      <FormMessage id="privacy-description" className="mt-2 text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem>
                      <label 
                        htmlFor="terms-checkbox"
                        className="relative flex w-full items-start gap-3 rounded-large border border-gray-100 bg-white p-4 shadow-sm outline-none cursor-pointer hover:border-gray-200 transition-colors has-[:checked]:border-spanish-orange/30 has-[:checked]:bg-spanish-orange/5"
                      >
                        <Checkbox
                          id="terms-checkbox"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                          className="order-1 after:absolute after:inset-0 data-[state=checked]:bg-spanish-orange data-[state=checked]:border-spanish-orange"
                          aria-describedby="terms-description"
                        />
                        <div className="grow">
                          <span className="text-sm sm:text-base">
                            I accept the{' '}
                            <a 
                              href="/terms" 
                              target="_blank" 
                              className="text-spanish-orange hover:underline underline-offset-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Terms of Service
                            </a>
                          </span>
                        </div>
                      </label>
                      <FormMessage id="terms-description" className="mt-2 text-xs" />
                    </FormItem>
                  )}
                />
                    </div>
                  </div>
                </div>
              )}

              {showForm && (
                <div className="max-w-container-narrow mx-auto mt-6 animate-fade-in">
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

        )}

        {showForm && (
          <div className="max-w-container-narrow mx-auto mt-8 animate-fade-in">
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
  )
}