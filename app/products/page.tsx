"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Grid, List, ShoppingBag, Filter as FilterIcon, ChevronDown, ChevronUp } from "lucide-react"
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
  imageUrls?: string[]
  customizable?: boolean
  colors?: string[]
  inStock?: boolean
}

export default function ProductsPage() {
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  const [toast, setToast] = useState<{ message: string; type?: "success" | "error" } | null>(null)

  // ✅ FILTER STATES
  const [filtersOpen, setFiltersOpen] = useState<boolean>(true) // collapse toggle
  const [categories, setCategories] = useState<string[]>([])    // backend-derived categories

  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showCustomizable, setShowCustomizable] = useState<boolean>(false)
  const [sortBy, setSortBy] = useState<string>("featured")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const showToast = (msg: string, type: "success" | "error" = "success", duration = 3000) => {
    setToast({ message: msg, type })
    setTimeout(() => setToast(null), duration)
  }

  useEffect(() => {
    const auth = localStorage.getItem("impressa_token")
    if (auth) setIsAuthenticated(true)
  }, [])

  // ✅ Fetch products + dynamically generate categories
  useEffect(() => {
    let cancelled = false

    async function fetchProducts() {
      try {
        setLoading(true)
        const res = await axios.get(`${apiUrl}/templates`)

        if (cancelled) return
        const data = Array.isArray(res.data) ? res.data : []

        setProducts(data)

        // ✅ Extract unique categories dynamically
        const uniqueCats = [
          "all",
          ...new Set(
            data
              .map((p: Product) => (p.category ?? "").toString().toLowerCase())
              .filter(Boolean)
          ),
        ]
        setCategories(uniqueCats)
      } catch (err) {
        console.error("Error fetching products:", err)
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

  const handleAddToCart = async ({
    templateId,
    itemType,
    quantity = 1,
    price,
  }: {
    templateId?: string
    itemType: string
    quantity?: number
    price: number
  }) => {
    if (!isAuthenticated) return router.push("/login")

    try {
      const token = localStorage.getItem("impressa_token")
      await axios.post(
        `${apiUrl}/cart/add`,
        { templateId, itemType, quantity, price },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      showToast("Added to cart", "success")
    } catch {
      showToast("Failed to add to cart", "error")
    }
  }

  // ✅ FILTERING
  const filteredProducts = products.filter((product) => {
    const categoryMatch =
      selectedCategory === "all" ||
      (product.category ?? "").toLowerCase() === selectedCategory

    const customizableMatch = !showCustomizable || product.customizable === true

    return categoryMatch && customizableMatch
  })

  // ✅ SORTING
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

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center py-16">Loading products…</div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* ✅ Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 max-w-xs w-full px-4 py-2 rounded shadow-lg text-sm ${
            toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ✅ COLLAPSABLE FILTER SIDEBAR */}
        <div className="lg:w-64">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center justify-between w-full mb-4"
          >
            <span className="flex items-center gap-2 text-lg font-medium text-navy">
              <FilterIcon className="w-5 h-5" />
              Filters
            </span>
            {filtersOpen ? <ChevronUp /> : <ChevronDown />}
          </button>

          {filtersOpen && (
            <div className="space-y-6 p-4 rounded-lg bg-white shadow-sm">
              {/* ✅ Dynamic Category Filter */}
              <div className="space-y-3">
                <h3 className="font-medium text-navy">Category</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div key={cat} className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedCategory === cat}
                        onCheckedChange={() => setSelectedCategory(cat)}
                      />
                      <Label className="text-sm capitalize">{cat}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* ✅ Customizable Filter */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="customizable"
                  checked={showCustomizable}
                  onCheckedChange={(v) => setShowCustomizable(Boolean(v))}
                />
                <Label htmlFor="customizable" className="text-sm">
                  Customizable Only
                </Label>
              </div>
            </div>
          )}
        </div>

        {/* ✅ PRODUCT GRID */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-light text-navy">Our Collection</h1>
              <p className="text-navy/70">{sortedProducts.length} products found</p>
            </div>

            <div className="flex items-center gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
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

              <div className="flex rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* ✅ PRODUCT CARDS */}
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {sortedProducts.map((product, idx) => {
              // ✅ Choose first image
              const firstImage =
                Array.isArray(product.imageUrls) && product.imageUrls.length > 0
                  ? product.imageUrls[0]
                  : product.imageUrl || "/placeholder.svg"

              return (
                <Card key={product._id ?? idx} className="group hover:shadow-lg transition-all border-none">
                  <CardContent className="p-0">
                    <Link href={`/products/${product._id}`}>
                      <div className="relative overflow-hidden">
                        <Image
                          src={firstImage}
                          alt={product.title ?? "product"}
                          width={300}
                          height={400}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform rounded-t-sm"
                        />
                      </div>
                    </Link>

                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-medium text-navy hover:text-burgundy/50 transition-colors">
                          <Link href={`/products/${product._id}`}>
                            {product.title ?? "Untitled Product"}
                          </Link>
                        </h3>
                        <p className="text-sm text-navy/60 capitalize">{product.category}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium text-navy">
                          ₦{(product.price ?? 0).toLocaleString()}
                        </span>

                        <Button
                          size="sm"
                          className="bg-burgundy text-ivory"
                          disabled={!product.inStock}
                          onClick={() =>
                            handleAddToCart({
                              templateId: product._id,
                              itemType: product.category ?? "product",
                              price: product.price ?? 0,
                            })
                          }
                        >
                          <ShoppingBag className="h-4 w-4 mr-1" /> Add
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
