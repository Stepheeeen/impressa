"use client"

import React, { useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { apiUrl } from "@/constants/apiUrl"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const togglePassword = () => setShowPassword(!showPassword)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await axios.post(`${apiUrl}/auth/login/`, {
        email,
        password,
      })
    //   console.log(res.data)

      console.log(res.data)
      const { token, user } = res.data
      localStorage.setItem("impressa_token", token)
      localStorage.setItem("impressa_user", JSON.stringify(user))

      // notify header (same-tab) and other tabs/windows (storage event already fires cross-tab)
      try {
        window.dispatchEvent(new Event("impressa_auth_change"))
      } catch {
        // ignore if window not available for some reason
      }

      router.push("/products")
    } catch (err:any) {
      console.log(err)
      setError(err.response?.data?.error || "Login failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <Card className="shadow-sm">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Login to continue</CardDescription>
          </CardHeader>

          <CardContent>
            <form className="space-y-6">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="user@impressa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2 relative">
                <Label>Password</Label>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="•••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-3 top-9 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error && <p className="text-destructive text-sm">{error}</p>}

              <Button className="w-full bg-burgundy hover:bg-burgundy/90 text-ivory" disabled={loading} onClick={handleLogin}>
                {loading ? "Authenticating..." : "Login"}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm">
              Don't have an account?{" "}
              <a href="/register" className="underline">Register</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
