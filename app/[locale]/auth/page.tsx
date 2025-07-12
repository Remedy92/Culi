'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { CuliCurveLogo } from '@/app/components/CuliCurveLogo'
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
      <div className="min-h-screen flex flex-col bg-seasalt">
        {/* Header */}
        <div className="py-6 flex justify-center">
          <Link href="/" className="flex items-center gap-3 group">
            <CuliCurveLogo size={40} className="group-hover:scale-105 transition-transform" />
            <h1 className="text-2xl sm:text-3xl font-black text-eerie-black">
              <span className="text-3xl sm:text-4xl font-serif">C</span>uli
            </h1>
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="container-narrow">
            <div className="bg-white rounded-2xl shadow-warm-xl p-8 text-center space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-eerie-black">Check your email</h2>
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
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-seasalt">
      {/* Header */}
      <div className="py-6 flex justify-center">
        <Link href="/" className="flex items-center gap-3 group">
          <CuliCurveLogo size={40} className="group-hover:scale-105 transition-transform" />
          <h1 className="text-2xl sm:text-3xl font-black text-eerie-black">
            <span className="text-3xl sm:text-4xl font-serif">C</span>uli
          </h1>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="container-narrow">
          <div className="bg-white rounded-2xl shadow-warm-xl p-8">
            <div className="space-y-2 text-center mb-8">
              <h2 className="text-2xl font-bold text-eerie-black">Sign in to <span className="font-black"><span className="font-serif">C</span>uli</span></h2>
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
    </div>
  )
}