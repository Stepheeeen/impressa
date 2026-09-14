"use client"

import React, { useState } from "react"
import axios from "axios"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { apiUrl } from "@/constants/apiUrl"
import { apiErrorMessage } from "@/lib/apiError"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [sentMessage, setSentMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim()) {
      setError("Enter your email address.")
      return
    }

    setLoading(true)
    try {
      const res = await axios.post(`${apiUrl}/auth/forgot-password`, { email })
      setSentMessage(res.data?.message ?? "If an account exists for that email, we've sent a link to reset your password.")
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't send the reset link. Try again."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <Card className="shadow-sm">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl">Forgot your password?</CardTitle>
            <CardDescription>Enter your email and we'll send you a link to reset it.</CardDescription>
          </CardHeader>

          <CardContent>
            {sentMessage ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-navy/80">{sentMessage}</p>
                <p className="text-sm text-navy/60">
                  The link expires in 30 minutes. If it doesn't arrive, check your spam folder.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">Back to login</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="user@impressa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {error && (
                  <p className="text-destructive text-sm" role="alert">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full bg-burgundy hover:bg-burgundy/90 text-ivory" disabled={loading}>
                  {loading ? "Sending link..." : "Send reset link"}
                </Button>
              </form>
            )}

            <p className="mt-4 text-center text-sm">
              Remembered it?{" "}
              <Link href="/login" className="underline">
                Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
