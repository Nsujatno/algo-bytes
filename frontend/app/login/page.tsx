import Link from "next/link"
import { login } from "@/app/auth/actions"
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

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-[400px] border-none shadow-none">
        <CardHeader className="space-y-4 pb-6 text-center flex flex-col items-center">
          <Logo />
          <CardTitle className="text-xl font-mono text-accent uppercase tracking-wider">Login to Algo Bytes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pb-6">
          <form action={login} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="name@example.com" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button fullWidth type="submit" className="mt-2 text-black font-medium">
              Login
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <div className="w-full text-center text-sm text-muted">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-muted hover:text-accent transition-colors">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
