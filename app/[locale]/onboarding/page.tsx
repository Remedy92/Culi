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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/app/components/ui/form'
import { CuliCurveLogo, CuliLogoLoading } from '@/app/components/CuliCurveLogo'
import { TypewriterEffectSmooth } from '@/app/components/ui/typewriter-effect'
import { CheckCircle } from 'lucide-react'

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
  const router = useRouter()
  const supabase = createClient()

  // Show second message after first one completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSecondMessage(true)
    }, 2000) // Adjust timing based on first message length
    return () => clearTimeout(timer)
  }, [])

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
        console.error('Auth error:', JSON.stringify(userError, null, 2))
        throw new Error('Authentication error: ' + userError.message)
      }
      
      if (!user || !user.id) {
        throw new Error('No authenticated user found. Please sign in again.')
      }
      
      console.log('Authenticated user:', { id: user.id, email: user.email })

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
        console.error('Restaurant creation error:', JSON.stringify(restaurantError, null, 2))
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
          console.error('Consent error:', JSON.stringify(consentError, null, 2))
          // Continue with other consents even if one fails
        }
      }

      toast.success('Welcome to Culi! Your restaurant has been created.')
      
      // Get locale from URL
      const locale = window.location.pathname.split('/')[1]
      router.push(`/${locale}/dashboard`)
    } catch (error) {
      console.error('Onboarding error:', error instanceof Error ? error.message : JSON.stringify(error, null, 2))
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-seasalt px-4 py-8">
      {/* Header */}
      <div className="w-full mb-12">
        <div className="flex items-center justify-center gap-3">
          <CuliCurveLogo size={36} />
          <div className="relative">
            <span className="text-3xl font-black text-eerie-black">
              <span className="text-4xl font-serif">C</span>uli
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Chat Interface */}
        <div className="space-y-4 mb-8">
          {/* Culi's Message */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full shadow-warm flex items-center justify-center">
              <CuliCurveLogo size={24} />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-none shadow-warm-lg p-4 max-w-md">
              <div className="space-y-2">
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
                  className="text-base text-eerie-black"
                  cursorClassName="bg-spanish-orange h-4"
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
                    className="text-base text-eerie-black"
                    cursorClassName="bg-spanish-orange h-4"
                  />
                )}
              </div>
            </div>
          </div>

          {/* User's Response */}
          {form.watch("restaurantName") && showForm && (
            <div className="flex items-start gap-3 justify-end animate-fade-in">
              <div className="bg-spanish-orange text-white rounded-2xl rounded-tr-none shadow-warm-lg p-4 max-w-md">
                <p>{form.watch("restaurantName")}</p>
              </div>
            </div>
          )}

          {/* Culi's Follow-up */}
          {showForm && (
            <div className="flex items-start gap-3 animate-fade-in">
              <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full shadow-warm flex items-center justify-center">
                <CuliCurveLogo size={24} />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-none shadow-warm-lg p-4 max-w-md">
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
                  className="text-base text-eerie-black"
                  cursorClassName="bg-spanish-orange h-4"
                />
              </div>
            </div>
          )}
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-3xl shadow-warm-xl p-8 md:p-12">

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Restaurant Name Input - Chat Style */}
              <FormField
                control={form.control}
                name="restaurantName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Type your restaurant name..." 
                          disabled={isLoading}
                          className="pr-12 py-6 text-lg rounded-2xl border-2 focus:border-spanish-orange transition-colors"
                          {...field} 
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && field.value) {
                              e.preventDefault()
                              setShowForm(true)
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => field.value && setShowForm(true)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-spanish-orange text-white rounded-lg flex items-center justify-center hover:bg-opacity-90 transition-colors"
                          disabled={!field.value || isLoading}
                        >
                          →
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showForm && (
                <div className="space-y-4 pt-4 animate-fade-in">
                  <h3 className="text-sm font-medium text-eerie-black">Legal Requirements</h3>
                
                <FormField
                  control={form.control}
                  name="acceptPrivacy"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-cinereous/30 text-spanish-orange focus:ring-spanish-orange"
                          checked={field.value}
                          onChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal">
                          I accept the{' '}
                          <a href="/privacy" target="_blank" className="text-spanish-orange hover:underline">
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
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-cinereous/30 text-spanish-orange focus:ring-spanish-orange"
                          checked={field.value}
                          onChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal">
                          I accept the{' '}
                          <a href="/terms" target="_blank" className="text-spanish-orange hover:underline">
                            Terms of Service
                          </a>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="marketingEmails"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-cinereous/30 text-spanish-orange focus:ring-spanish-orange"
                          checked={field.value}
                          onChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal">
                          Send me tips and updates about Culi (optional)
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                </div>
              )}

              {showForm && (
                <div className="pt-4 animate-fade-in">
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <CuliLogoLoading size={20} color="white" />
                        Creating your restaurant...
                      </span>
                    ) : (
                      'Create Restaurant'
                    )}
                  </Button>
                </div>
              )}
            </form>
          </Form>

          <div className="mt-8 p-4 bg-timberwolf/50 rounded-2xl">
            <h3 className="font-medium text-eerie-black mb-2 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-spanish-orange" />
              What happens next?
            </h3>
            <ul className="space-y-1 text-sm text-cinereous">
              <li>• Upload your menu (PDF, image, or text)</li>
              <li>• Culi&apos;s AI will extract and understand your dishes</li>
              <li>• Get a QR code for guests to scan</li>
              <li>• Start answering questions in any language!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}