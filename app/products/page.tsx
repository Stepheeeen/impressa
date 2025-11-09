"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Grid, List, ShoppingBag, Filter as FilterIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import axios from "axios"
import { apiUrl } from "@/constants/apiUrl"

type Product = {
  _id?: string
  title?: string
  category?: string
  price?: number
  imageUrl?: string
  customizable?: boolean
  colors?: string[]
  inStock?: boolean
}

export default function ProductsPage() {
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  // Toast state (simple local implementation)
  const [toast, setToast] = useState<{ message: string; type?: "success" | "error" } | null>(null)

  // helper to show toast
  const showToast = (message: string, type: "success" | "error" = "success", duration = 3000) => {
    setToast({ message, type })
    window.setTimeout(() => {
      setToast(null)
    }, duration)
  }

  // Filters & UI state
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [showCustomizable, setShowCustomizable] = useState<boolean>(false)
  const [sortBy, setSortBy] = useState<string>("featured")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const handleAddToCart = async ({
    templateId,
    designId = null,
    itemType,
    quantity = 1,
    price,
  }: {
    templateId?: string
    designId?: string | null
    itemType: string
    quantity?: number
    price: number
  }) => {
    if (!isAuthenticated) return router.push("/login")

    try {
      const token = localStorage.getItem("impressa_token")

      const res = await axios.post(
        `${apiUrl}/cart/add`,
        { templateId, designId, itemType, quantity, price },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      showToast("Added to cart", "success")
      console.log("Cart Updated:", res.data)
    } catch (err) {
      console.error("Add to cart failed:", err)
      showToast("Failed to add to cart", "error")
    }
  }


  // preserve your original auth check
  useEffect(() => {
    const auth = localStorage.getItem("impressa_token")
    if (auth) setIsAuthenticated(true)
  }, [])

  // fetch products using axios
  useEffect(() => {
    let cancelled = false
    async function fetchProducts() {
      try {
        setLoading(true)
        const res = await axios.get(`${apiUrl}/templates`)
        if (cancelled) return
        setProducts(Array.isArray(res.data) ? res.data : [])
      } catch (error) {
        console.error("Error fetching products:", error)
        setProducts([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchProducts()
    return () => {
      cancelled = true
    }
  }, [])

  // reload-after-login logic (kept exactly)
  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const url = new URL(window.location.href)
      const fromParam = url.searchParams.get("from")
      const redirectedParam = url.searchParams.get("redirected") === "true"
      const referrer = document.referrer || ""
      const cameFromLogin =
        fromParam === "login" || redirectedParam || referrer.includes("/login")

      if (cameFromLogin && !sessionStorage.getItem("impressa_reloaded")) {
        sessionStorage.setItem("impressa_reloaded", "1")
        window.location.reload()
      }
    } catch {
      // ignore URL parsing errors
    }
  }, [])

  // helpers for adding/removing colors (stored in lowercase)
  const toggleColor = (color: string, checked: boolean | string | undefined) => {
    const normalized = color.toLowerCase()
    const isChecked = checked === true || checked === "true"
    if (isChecked) {
      setSelectedColors((prev) => (prev.includes(normalized) ? prev : [...prev, normalized]))
    } else {
      setSelectedColors((prev) => prev.filter((c) => c !== normalized))
    }
  }

  // filtered products (client-side)
  const filteredProducts = products.filter((product) => {
    const categoryVal = (product.category ?? "").toString().toLowerCase()
    const categoryMatch = selectedCategory === "all" || categoryVal === selectedCategory

    // If selectedColors is empty it's a match; otherwise ensure at least one color matches
    const colorsNormalized = (product.colors ?? []).map((c) => (c ?? "").toString().toLowerCase())
    const colorMatch =
      selectedColors.length === 0 || colorsNormalized.some((color) => selectedColors.includes(color))

    const customizableMatch = !showCustomizable || product.customizable === true

    return categoryMatch && colorMatch && customizableMatch
  })

  // sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return (a.price ?? 0) - (b.price ?? 0)
      case "price-high":
        return (b.price ?? 0) - (a.price ?? 0)
      case "name":
        return (a.title ?? "").localeCompare(b.title ?? "")
      default:
        return 0
    }
  })

  // simple loading/skeleton placeholder
  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center py-16">Loading products…</div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* Toast container */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 max-w-xs w-full px-4 py-2 rounded shadow-lg text-sm ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
            }`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center justify-between">
            <div>{toast.message}</div>
            <button
              aria-label="Close toast"
              onClick={() => setToast(null)}
              className="ml-3 opacity-90 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-64 space-y-6">
          <div className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5 text-navy" />
            <h2 className="text-lg font-medium text-navy">Filters</h2>
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <h3 className="font-medium text-navy">Category</h3>
            <div className="space-y-2">
              {[
                { id: "all", label: "All Products" },
                { id: "clothing", label: "Clothing" },
                { id: "accessories", label: "Accessories" },
                { id: "hoodie", label: "Hoodies" }, // examples — match your itemType/category values
              ].map((cat) => (
                <div key={cat.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={cat.id}
                    checked={selectedCategory === cat.id}
                    onCheckedChange={() => setSelectedCategory(cat.id)}
                  />
                  <Label htmlFor={cat.id} className="text-sm">
                    {cat.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Color Filter */}
          <div className="space-y-3">
            <h3 className="font-medium text-navy">Colors</h3>
            <div className="space-y-2">
              {["black", "navy", "white", "brown", "burgundy", "rose gold"].map((color) => (
                <div key={color} className="flex items-center space-x-2">
                  <Checkbox
                    id={color}
                    checked={selectedColors.includes(color)}
                    onCheckedChange={(checked) => toggleColor(color, checked)}
                  />
                  <Label htmlFor={color} className="text-sm capitalize">
                    {color}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Customizable Filter */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="customizable" checked={showCustomizable} onCheckedChange={(val) => setShowCustomizable(Boolean(val))} />
              <Label htmlFor="customizable" className="text-sm">
                Customizable Only
              </Label>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-light text-navy">Our Collection</h1>
              <p className="text-navy/70 mt-1">{sortedProducts.length} products found</p>
            </div>

            <div className="flex items-center gap-4">
              <Select value={sortBy} onValueChange={(val) => setSortBy(String(val))}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {sortedProducts.map((product, idx) => (
              <Card key={product._id ?? `product-${idx}`} className="group border-warmgray/30 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <Image
                      src={product.imageUrl || "/placeholder.svg"}
                      alt={product.title ?? "Product image"}
                      width={300}
                      height={400}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    <div className="absolute top-4 left-4 space-y-2">
                      {product.customizable && <Badge className="bg-rosegold text-ivory">Customizable</Badge>}
                      {product.inStock === false && <Badge variant="secondary">Out of Stock</Badge>}
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-medium text-navy group-hover:text-rosegold transition-colors">
                        <Link href={`/products/${product._id ?? ""}`}>{product.title ?? "Untitled Product"}</Link>
                      </h3>
                      <p className="text-sm text-navy/60 capitalize">{product.category ?? "uncategorized"}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium text-navy">₦{(product.price ?? 0).toLocaleString()}</span>

                      <Button
                        size="sm"
                        className="bg-burgundy hover:bg-burgundy/90 text-ivory"
                        disabled={!product.inStock}
                        onClick={async () => {
                          if (!isAuthenticated) return router.push("/login")
                          await handleAddToCart({
                            templateId: product._id,
                            itemType: product.category ?? "product",
                            price: product.price ?? 0,
                          })
                        }}
                      >
                        <ShoppingBag className="h-4 w-4 mr-1" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
