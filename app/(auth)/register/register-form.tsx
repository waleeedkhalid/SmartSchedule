"use client";

import { useTransition, useEffect, useRef, useMemo, useCallback, useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { signup } from '../actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PasswordInput } from '@/components/ui/password-input'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const signupSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: 'Full name must be at least 2 characters' })
      .max(50, { message: 'Full name cannot exceed 50 characters' })
      .regex(/^[a-zA-Z\s]+$/, {
        message: 'Name can only contain letters and spaces',
      }),

    email: z
      .string()
      .min(1, 'Email is required')
      .email({ message: 'Please enter a valid email address' }),

    role: z.enum(
      ['scheduling', 'teaching_load', 'faculty', 'student', 'registrar'],
      {
        required_error: 'Please select a role',
      }
    ),

    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(/[A-Z]/, {
        message: 'Password must include at least one uppercase letter',
      })
      .regex(/[a-z]/, {
        message: 'Password must include at least one lowercase letter',
      })
      .regex(/\d/, { message: 'Password must include at least one number' })
      .regex(/[\W_]/, {
        message: 'Password must include at least one special character',
      }),

    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

/**
 * Calculates password strength based on length and character variety
 * @param password - The password to evaluate
 * @returns Strength score from 0-100
 */
function calculatePasswordStrength(password: string): number {
  let strength = 0
  if (password.length >= 8) strength += 20
  if (password.length >= 12) strength += 20
  if (/[a-z]/.test(password)) strength += 15
  if (/[A-Z]/.test(password)) strength += 15
  if (/\d/.test(password)) strength += 15
  if (/[\W_]/.test(password)) strength += 15
  return Math.min(strength, 100)
}

/**
 * Gets label and color class for password strength indicator
 * @param strength - Password strength score (0-100)
 * @returns Object with label text and Tailwind color class
 */
function getPasswordStrengthLabel(strength: number): {
  label: string
  color: string
} {
  if (strength === 0) return { label: '', color: '' }
  if (strength < 40) return { label: 'Weak', color: 'text-red-600' }
  if (strength < 70) return { label: 'Fair', color: 'text-orange-600' }
  if (strength < 90) return { label: 'Good', color: 'text-yellow-600' }
  return { label: 'Strong', color: 'text-green-600' }
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  scheduling: 'Manage course schedules and timetables',
  teaching_load: 'Oversee faculty teaching assignments',
  faculty: 'View schedules and manage teaching preferences',
  student: 'Access your personal schedule and courses',
  registrar: 'Full administrative access to the system',
} as const

export default function RegisterForm() {
  const [isPending, startTransition] = useTransition()
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const nameInputRef = useRef<HTMLInputElement>(null)
  const isMobileRoute = pathname?.startsWith('/mobile') ?? false

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'student',
      password: '',
      confirmPassword: '',
    },
  })

  const password = form.watch('password')

  // Set mounted state for client-only rendering
  useEffect(() => {
    setIsMounted(true)
    nameInputRef.current?.focus()
  }, [])

  // Memoize password strength calculation
  const passwordStrength = useMemo(
    () => calculatePasswordStrength(password || ''),
    [password]
  )

  // Memoize strength label calculation
  const strengthInfo = useMemo(
    () => getPasswordStrengthLabel(passwordStrength),
    [passwordStrength]
  )

  const onSubmit = useCallback(
    async (values: z.infer<typeof signupSchema>) => {
      startTransition(async () => {
        // Exclude confirmPassword - it's only for client-side validation
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { confirmPassword: _confirmPassword, ...signupData } = values
        const response = await signup(signupData)

        if (response.error) {
          const errorMessage = response.error.toLowerCase()
          
          // Profile creation error (RLS policy issue)
          if (errorMessage.includes('profile') || errorMessage.includes('permission')) {
            toast.error(response.error, {
              duration: 8000,
              description: 'This appears to be a system configuration issue. Please contact your administrator.',
            })
          }
          // Duplicate email
          else if (errorMessage.includes('already') || errorMessage.includes('exists')) {
            toast.error('An account with this email already exists.', {
              description: 'Please use a different email or try logging in.'
            })
          }
          // Invalid email
          else if (errorMessage.includes('email')) {
            toast.error('Invalid email address. Please try again.')
          }
          // Generic error
          else {
            toast.error('Unable to create account', {
              description: response.error,
              duration: 6000
            })
          }
          return
        }

        toast.success(
          'Account created! Please check your email to confirm your address.'
        )
        // Redirect to mobile login if on mobile route, otherwise desktop login
        router.push(isMobileRoute ? '/mobile/login' : '/login')
      })
    },
    [router]
  )

  return (
    <div className="w-full max-w-md mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    autoComplete="name"
                    {...field}
                    ref={(e) => {
                      field.ref(e)
                      nameInputRef.current = e
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
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="student">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Student</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="faculty">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Faculty</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="scheduling">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Scheduling Committee</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="teaching_load">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Teaching Load Committee</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="registrar">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Registrar</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  {field.value && ROLE_DESCRIPTIONS[field.value]}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                {isMounted && password && (
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <Progress value={passwordStrength} className="h-2 flex-1" />
                      <span className={cn("text-sm font-medium", strengthInfo.color)}>
                        {strengthInfo.label}
                      </span>
                    </div>
                  </div>
                )}
                <FormDescription className="text-xs space-y-1">
                  <div>Password must contain:</div>
                  <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                    <li
                      className={
                        isMounted && password.length >= 8 ? 'text-green-600' : ''
                      }
                    >
                      At least 8 characters
                    </li>
                    <li
                      className={
                        isMounted && /[A-Z]/.test(password) ? 'text-green-600' : ''
                      }
                    >
                      One uppercase letter
                    </li>
                    <li
                      className={
                        isMounted && /[a-z]/.test(password) ? 'text-green-600' : ''
                      }
                    >
                      One lowercase letter
                    </li>
                    <li
                      className={isMounted && /\d/.test(password) ? 'text-green-600' : ''}
                    >
                      One number
                    </li>
                    <li
                      className={
                        isMounted && /[\W_]/.test(password) ? 'text-green-600' : ''
                      }
                    >
                      One special character
                    </li>
                  </ul>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
            <Icons.info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
              You&apos;ll receive a confirmation email after registration. Please
              verify your email address to activate your account.
            </AlertDescription>
          </Alert>

          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <Icons.userPlus className="mr-2 h-4 w-4" />
                Create Account
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground mb-3">
          Already have an account?
        </p>
        <Button variant="outline" asChild className="w-full">
          <Link href={isMobileRoute ? '/mobile/login' : '/login'}>
            <Icons.login className="mr-2 h-4 w-4" />
            Sign In
          </Link>
        </Button>
      </div>
    </div>
  );
}
