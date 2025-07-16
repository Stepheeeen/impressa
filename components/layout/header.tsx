"use client"

import Link from "next/link"
import { Search, ShoppingBag, User, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-warmgray/20 bg-ivory/95 backdrop-blur supports-[backdrop-filter]:bg-ivory/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-light tracking-wider luxury-text-gradient">IMPRESSA</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
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
            Bags
          </Link>
          <Link href="/custom" className="text-sm font-light text-navy hover:text-rosegold transition-colors">
            Custom Design
          </Link>
        </nav>

        {/* Search */}
        <div className="hidden lg:flex items-center space-x-2 flex-1 max-w-sm mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy/60 h-4 w-4" />
            <Input
              placeholder="Search luxury items..."
              className="pl-10 bg-warmgray/30 border-warmgray/50 focus:border-rosegold"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-navy hover:text-rosegold">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-navy hover:text-rosegold">
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-navy hover:text-rosegold relative">
            <ShoppingBag className="h-5 w-5" />
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-burgundy text-ivory text-xs flex items-center justify-center">
              2
            </Badge>
          </Button>
          <Button variant="ghost" size="icon" className="text-navy hover:text-rosegold">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
