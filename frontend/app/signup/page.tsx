

'use client'

import Link from "next/link"
import { useActionState } from "react"
import { AlertCircle } from "lucide-react"
import { signup } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/ui/logo"

const initialState = {
  error: '',
}

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signup, initialState)

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-[400px] border-none shadow-none">
        <CardHeader className="space-y-4 pb-6 text-center flex flex-col items-center">
          <Logo />
          <CardTitle className="text-xl font-mono text-accent uppercase tracking-wider">Sign up for Algo Bytes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pb-6">
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" type="text" placeholder="username" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="name@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" name="confirmPassword" type="password" required />
            </div>
            <Button fullWidth type="submit" className="mt-2 text-black font-medium" disabled={isPending}>
              {isPending ? 'Signing up...' : 'Sign up'}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <div className="w-full text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-muted hover:text-accent transition-colors">
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
