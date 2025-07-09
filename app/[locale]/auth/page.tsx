'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/app/components/ui/form'
import { TLLogo } from '@/app/components/TLLogo'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: values.email }),
      })

      if (!response.ok) {
        const error = await response.json()
        // Check if the error is about user not existing
        if (error.error?.includes('User not found') || error.error?.includes('Invalid login')) {
          throw new Error('No account found with this email. Please sign up first.')
        }
        throw new Error(error.error || 'Something went wrong')
      }

      setEmailSent(true)
      toast.success('Check your email for the login link!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-seasalt px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-warm-xl p-8 text-center space-y-6">
            <div className="flex justify-center">
              <TLLogo />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-eerie-black">Check your email</h1>
              <p className="text-cinereous">
                We sent a login link to {form.getValues('email')}
              </p>
            </div>
            <div className="pt-4">
              <button
                onClick={() => {
                  setEmailSent(false)
                  form.reset()
                }}
                className="text-spanish-orange hover:underline text-sm font-medium"
              >
                Try a different email
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-seasalt px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-warm-xl p-8">
          <div className="flex justify-center mb-8">
            <TLLogo />
          </div>
          
          <div className="space-y-2 text-center mb-8">
            <h1 className="text-2xl font-bold text-eerie-black">Sign in to Culi</h1>
            <p className="text-cinereous">
              Enter your email to receive a secure login link
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Enter your email address" 
                        type="email"
                        disabled={isLoading}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send login link'}
              </Button>
            </form>
          </Form>

          <div className="mt-8 text-center">
            <Link 
              href="/" 
              className="inline-flex items-center text-sm text-cinereous hover:text-eerie-black transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}