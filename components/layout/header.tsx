"use client"

import Link from "next/link"
import { Search, ShoppingBag, User, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import logoTransparent from '@/public/impressa-logo.png'
import Image from "next/image"

export function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem("impressa_token"))
    }

    checkAuth()

    const onStorage = (e: StorageEvent) => {
      if (e.key === "impressa_token" || e.key === null) checkAuth()
    }

    const onAuthChange = () => checkAuth()

    window.addEventListener("storage", onStorage)
    window.addEventListener("impressa_auth_change", onAuthChange)

    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("impressa_auth_change", onAuthChange)
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-warmgray/20 bg-ivory/95 backdrop-blur supports-[backdrop-filter]:bg-ivory/60">
      <div className="container flex h-24 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src={logoTransparent}
            alt="Impressa Logo"
            width={140}
            height={40}
            className="object-contain 
               w-[90px]      /* ✅ mobile */
               sm:w-[110px]  /* ✅ small devices */
               md:w-[130px]  /* ✅ tablets */
               lg:w-[140px]  /* ✅ desktop */
              "
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 ml-5">
          <Link href="/products" className="text-sm font-light text-navy hover:text-rosegold transition-colors">
            All Products
          </Link>
          <Link
            href="/products?category=clothing"
            className="text-sm font-light text-navy hover:text-rosegold transition-colors"
          >
            Clothing
          </Link>
          <Link
            href="/products?category=bags"
            className="text-sm font-light text-navy hover:text-rosegold transition-colors"
          >
            Accessories
          </Link>
          <Link href={isAuthenticated ? "/custom" : "/login"} className="text-sm font-light text-navy hover:text-rosegold transition-colors">
            Custom Design
          </Link>
        </nav>

        {/* Search - Desktop only */}
        <div className="hidden lg:flex items-center space-x-2 flex-1 max-w-sm mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy/60 h-4 w-4" />
            <Input
              placeholder="Search luxury items..."
              className="pl-10 bg-warmgray/30 border-warmgray/50 focus:border-rosegold"
            />
          </div>
        </div>

        {/* Desktop Auth */}
        {isAuthenticated ? (
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-navy hover:bg-rosegold" onClick={() => router.push('/cart')}>
              <ShoppingBag className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-navy hover:bg-rosegold" onClick={() => router.push('/account')}>
              <User className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-navy hover:bg-rosegold"
              onClick={() => router.push("/login")}
            >
              Login
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-burgundy hover:bg-burgundy/90 text-ivory border-none"
              onClick={() => router.push("/register")}
            >
              Sign up
            </Button>
          </div>
        )}

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded hover:bg-warmgray/20 transition"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-6 w-6 text-navy" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] w-full h-full">
          <div className="absolute top-0 right-0 w-full h-screen bg-white flex flex-col animate-slide-left">

            {/* Close Button */}
            <button
              className="absolute top-4 right-4 p-2"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>

            <div className="mt-10 flex flex-col justify-center items-center space-y-6 bg-white p-6">
              <Link
                href="/products"
                className="text-base font-light text-navy hover:text-rosegold"
                onClick={() => setMobileOpen(false)}
              >
                All Products
              </Link>
              <Link
                href="/products?category=clothing"
                className="text-base font-light text-navy hover:text-rosegold"
                onClick={() => setMobileOpen(false)}
              >
                Clothing
              </Link>
              <Link
                href="/products?category=bags"
                className="text-base font-light text-navy hover:text-rosegold"
                onClick={() => setMobileOpen(false)}
              >
                Accessories
              </Link>
              <Link
                href={isAuthenticated ? "/custom" : "/login"}
                className="text-base font-light text-navy hover:text-rosegold"
                onClick={() => setMobileOpen(false)}
              >
                Custom Design
              </Link>

              <div className="border-t border-warmgray/30 py-6 w-3/4">
                {isAuthenticated ? (
                  <div className="flex flex-col space-y-4">
                    <Button
                      variant="ghost"
                      className="justify-start text-navy"
                      onClick={() => {
                        setMobileOpen(false)
                        router.push("/cart")
                      }}
                    >
                      <ShoppingBag className="mr-2 h-5 w-5" /> Cart
                    </Button>

                    <Button
                      variant="ghost"
                      className="justify-start text-navy"
                      onClick={() => {
                        setMobileOpen(false)
                        router.push("/account")
                      }}
                    >
                      <User className="mr-2 h-5 w-5" /> Account
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-4">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setMobileOpen(false)
                        router.push("/login")
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setMobileOpen(false)
                        router.push("/register")
                      }}
                    >
                      Sign up
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
