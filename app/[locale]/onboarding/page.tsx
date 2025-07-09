'use client'

import { useState } from 'react'
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
import { TLLogo } from '@/app/components/TLLogo'
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
  marketingEmails: z.boolean().default(false),
})

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

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
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('No authenticated user found')
      }

      // Generate a slug from the restaurant name
      const slug = values.restaurantName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      // Create the restaurant
      const { error: restaurantError } = await supabase
        .from('restaurants')
        .insert({
          name: values.restaurantName,
          slug,
          owner_id: user.id,
          email: user.email,
        })
        .select()
        .single()

      if (restaurantError) {
        if (restaurantError.code === '23505') { // Unique violation
          throw new Error('A restaurant with this name already exists. Please choose a different name.')
        }
        throw restaurantError
      }

      // Record GDPR consents
      const consents = [
        { consent_type: 'privacy_policy', consent_given: values.acceptPrivacy },
        { consent_type: 'terms_of_service', consent_given: values.acceptTerms },
        { consent_type: 'marketing_emails', consent_given: values.marketingEmails },
      ]

      for (const consent of consents) {
        await supabase
          .from('gdpr_consents')
          .insert({
            user_id: user.id,
            email: user.email!,
            ...consent,
            given_at: consent.consent_given ? new Date().toISOString() : null,
          })
      }

      toast.success('Welcome to Culi! Your restaurant has been created.')
      
      // Get locale from URL
      const locale = window.location.pathname.split('/')[1]
      router.push(`/${locale}/dashboard`)
    } catch (error) {
      console.error('Onboarding error:', error)
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-seasalt px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-warm-xl p-8 md:p-12">
          <div className="flex justify-center mb-8">
            <TLLogo />
          </div>
          
          <div className="space-y-2 text-center mb-8">
            <h1 className="text-3xl font-bold text-eerie-black">Welcome to Culi!</h1>
            <p className="text-cinereous text-lg">
              Let&apos;s set up your restaurant&apos;s AI-powered menu assistant
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="restaurantName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Restaurant Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. The Golden Fork" 
                        disabled={isLoading}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      This is how your restaurant will appear to guests
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4 pt-4">
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

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating your restaurant...' : 'Create Restaurant'}
                </Button>
              </div>
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