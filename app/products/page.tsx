"use client"

import { useEffect, useState, useRef, useCallback } from "react"
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
  isFeatured?: boolean
  itemType?: string
  sizes?: string[]
  tags?: string[]
  description?: string
  createdAt?: string
  updatedAt?: string
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

  // mountedRef prevents state updates after unmount
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // fetchProducts as stable callback so we can call it from listeners
  const normalizeTemplate = (item: any): Product => {
    const imageUrls = Array.isArray(item?.imageUrls)
      ? item.imageUrls
      : item?.imageUrl
      ? [item.imageUrl]
      : []

    return {
      _id: item?._id,
      title: item?.title ?? "",
      category: item?.category ?? "",
      price: typeof item?.price === "number" ? item.price : Number(item?.price) || 0,
      imageUrl: item?.imageUrl ?? imageUrls?.[0],
      imageUrls,
      customizable: Boolean(item?.customizable),
      colors: Array.isArray(item?.colors) ? item.colors : [],
      inStock: item?.inStock !== undefined ? Boolean(item?.inStock) : true,
      isFeatured: Boolean(item?.isFeatured),
      itemType: item?.itemType ?? item?.category ?? "product",
      sizes: Array.isArray(item?.sizes) ? item.sizes : [],
      tags: Array.isArray(item?.tags) ? item.tags : [],
      description: item?.description ?? "",
      createdAt: item?.createdAt,
      updatedAt: item?.updatedAt,
    }
  }

  const fetchProducts = useCallback(async () => {
    try {
      if (mountedRef.current) setLoading(true)
      const res = await axios.get(`${apiUrl}/templates`)
      if (!mountedRef.current) return
      const raw =
        Array.isArray(res.data) ? res.data :
        Array.isArray(res.data?.data) ? res.data.data :
        Array.isArray(res.data?.templates) ? res.data.templates :
        []
      const data = raw.map(normalizeTemplate)
      setProducts(data)

      // Extract unique categories dynamically
      const uniqueCats: string[] = [
        "all",
        ...new Set<string>(
          data
            .map((p: Product) => (p.category ?? "").toString().toLowerCase())
            .filter((cat:any): cat is string => Boolean(cat))
        ),
      ]
      setCategories(uniqueCats)
    } catch (err) {
      console.error("Error fetching products:", err)
      if (mountedRef.current) setProducts([])
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [])

  // initial fetch
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // sync auth state and refresh products on relevant events
  useEffect(() => {
    const updateAuth = () => {
      const auth = typeof window !== "undefined" ? localStorage.getItem("impressa_token") : null
      setIsAuthenticated(!!auth)
    }

    const onStorage = (e: StorageEvent) => {
      // if token or products changed in another tab, update
      if (e.key === "impressa_token" || e.key === null) updateAuth()
      // optionally react to other keys that indicate data changes
      if (e.key === null || e.key === "impressa_products") {
        fetchProducts()
      }
    }

    const onAuthChange = () => {
      updateAuth()
      // when auth changes, refetch products if necessary
      fetchProducts()
    }

    const onFocus = () => {
      // refresh when the user returns to the tab (keeps UI fresh)
      fetchProducts()
      updateAuth()
    }

    updateAuth()
    window.addEventListener("storage", onStorage)
    window.addEventListener("impressa_auth_change", onAuthChange as EventListener)
    window.addEventListener("focus", onFocus)

    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("impressa_auth_change", onAuthChange as EventListener)
      window.removeEventListener("focus", onFocus)
    }
  }, [fetchProducts])

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

  // Reusable helper to get a first image for list items
  const getListPrimaryImage = (p: any) => {
    if (!p) return "/placeholder.svg"
    if (Array.isArray(p.imageUrls) && p.imageUrls.length > 0) return p.imageUrls[0]
    if (p.imageUrl) return p.imageUrl
    return "/placeholder.svg"
  }

  // Extend/define a list-specific add-to-cart that carries image and respects stock
  const handleAddToCartFromList = async (product: any) => {
    if (!isAuthenticated) return router.push("/login")

    // Respect stock on list view
    if (product?.inStock === false) {
      showToast?.("This item is currently out of stock", "error")
      return
    }

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("impressa_token") : null

      await axios.post(
        `${apiUrl}/cart/add`,
        {
          templateId: product?._id,
          itemType: product?.itemType ?? product?.category ?? "product",
          quantity: 1,
          price: Number(product?.price) || 0,
          imageUrl: getListPrimaryImage(product),
          title: product?.title ?? undefined,
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      )

      showToast?.("Added to cart", "success")
    } catch (err) {
      console.error("Add to cart (list) failed:", err)
      showToast?.("Failed to add to cart", "error")
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

  // if (loading) {
  //   return (
  //     <div className="container py-8">
  //       <div className="text-center py-16">Loading products…</div>
  //     </div>
  //   )
  // }

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
                <Card key={product._id ?? idx} className="group hover:shadow-lg transition-all border-none relative">
                  <CardContent className="p-0">
                    {product.isFeatured && (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge variant="secondary" className="text-xs uppercase">Featured</Badge>
                      </div>
                    )}
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
                        <h3 className="font-medium text-navy hover:text-burgundy/50 transition-colors capitalize">
                          <Link href={`/products/${product._id}`}>
                            {product.title ?? "Untitled Product"}
                          </Link>
                        </h3>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-navy/60 capitalize">{product.category}</p>
                          {/* {product.itemType && <span className="text-xs text-navy/50">• {product.itemType}</span>} */}
                          <div className="ml-auto flex items-center gap-2">
                            {product.inStock === false && (
                              <Badge className="bg-red-600 text-white text-xs">Out of stock</Badge>
                            )}
                          </div>
                        </div>
                        {product.description && (
                          <p className="text-sm text-navy my-4 line-clamp-4 capitalize">{product.description}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium text-navy">
                          ₦{(product.price ?? 0).toLocaleString()}
                        </span>

                        <Link href={`/products/${product._id}`}>
                          <Button
                            size="sm"
                            className="bg-burgundy text-ivory"
                          >
                            View Product
                          </Button>
                        </Link>
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
