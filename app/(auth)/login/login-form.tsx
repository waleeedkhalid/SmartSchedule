"use client";

import { useTransition, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { login } from '../actions'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { PasswordInput } from '@/components/ui/password-input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .min(1, 'Email is required')
    .email({ message: 'Please enter a valid email address' }),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
})

export default function LoginForm() {
  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const emailInputRef = useRef<HTMLInputElement>(null)
  
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  const confirmationMessage = searchParams.get('confirmed')

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Auto-focus email field on mount
  useEffect(() => {
    emailInputRef.current?.focus()
  }, [])

  // Show confirmation toast if user just confirmed email
  useEffect(() => {
    if (confirmationMessage === 'true') {
      toast.success('Email confirmed! You can now sign in.')
    }
  }, [confirmationMessage])

  const onSubmit = useCallback(
    async (values: z.infer<typeof loginSchema>) => {
      startTransition(async () => {
        const response = await login(values)

        if (response.error) {
          // More specific error messages
          const errorMessage = response.error.toLowerCase()
          if (
            errorMessage.includes('invalid') ||
            errorMessage.includes('credentials')
          ) {
            toast.error('Invalid email or password. Please try again.')
          } else if (
            errorMessage.includes('email') &&
            errorMessage.includes('confirm')
          ) {
            toast.error('Please confirm your email address before signing in.')
          } else {
            toast.error(
              'Unable to sign in. Please check your credentials and try again.'
            )
          }
          return
        }

        queryClient.invalidateQueries({ queryKey: ['user'] })
        router.push(redirectTo)
        toast.success('Welcome back!')
      })
    },
    [queryClient, redirectTo, router]
  )

  return (
    <div className="grid gap-6">
      {confirmationMessage === 'true' && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <Icons.checkCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Your email has been confirmed successfully. Please sign in to
            continue.
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    autoComplete="email"
                    {...field}
                    ref={(e) => {
                      field.ref(e)
                      emailInputRef.current = e
                    }}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-muted-foreground hover:text-primary 
                      underline-offset-4 hover:underline"
                    tabIndex={-1}
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <PasswordInput
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full mt-6" disabled={isPending}>
            {isPending ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Icons.login className="mr-2 h-4 w-4" />
                Sign In
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            New to SmartSchedule?
          </span>
        </div>
      </div>

      <Button variant="outline" asChild>
        <Link href="/register">
          Create an account
          <Icons.arrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>

      {/* Demo Accounts Info */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Demo Accounts (Password: demo123)
        </p>
        <div className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
          <div className="flex justify-between">
            <span className="font-medium">Student:</span>
            <code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">student@demo.com</code>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Faculty:</span>
            <code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">faculty@demo.com</code>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Scheduling:</span>
            <code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">scheduling@demo.com</code>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Teaching Load:</span>
            <code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">teaching-load@demo.com</code>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Registrar:</span>
            <code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">registrar@demo.com</code>
          </div>
        </div>
      </div>
    </div>
  );
}
