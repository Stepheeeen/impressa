"use client"

import React, { Suspense, useState } from "react"
import axios from "axios"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { apiUrl } from "@/constants/apiUrl"
import { apiErrorMessage } from "@/lib/apiError"

// useSearchParams needs a Suspense boundary for Next.js to prerender the page.
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}

function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.")
      return
    }

    setLoading(true)
    try {
      await axios.post(`${apiUrl}/auth/reset-password`, { token, password })
      // Resetting ends every existing session, so clear any stale one in this browser.
      localStorage.removeItem("impressa_token")
      localStorage.removeItem("impressa_user")
      window.dispatchEvent(new Event("impressa_auth_change"))
      setDone(true)
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't reset your password. Try again."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <Card className="shadow-sm">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl">{done ? "Password updated" : "Choose a new password"}</CardTitle>
            <CardDescription>
              {done ? "You can now log in with your new password." : "Use at least 8 characters."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {done ? (
              <Button asChild className="w-full bg-burgundy hover:bg-burgundy/90 text-ivory">
                <Link href="/login">Login</Link>
              </Button>
            ) : !token ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-navy/80">This reset link is incomplete. Request a new one.</p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/forgot-password">Request a new link</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2 relative">
                  <Label htmlFor="password">New password</Label>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-muted-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm new password</Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="space-y-2">
                    <p className="text-destructive text-sm" role="alert">
                      {error}
                    </p>
                    {error.includes("expired") && (
                      <Link href="/forgot-password" className="text-sm underline">
                        Request a new link
                      </Link>
                    )}
                  </div>
                )}

                <Button type="submit" className="w-full bg-burgundy hover:bg-burgundy/90 text-ivory" disabled={loading}>
                  {loading ? "Updating password..." : "Update password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
