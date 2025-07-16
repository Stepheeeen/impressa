"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Filter, Grid, List, Heart, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

const products = [
  {
    id: 1,
    name: "Silk Evening Dress",
    category: "clothing",
    price: 899,
    originalPrice: 1200,
    image: "/placeholder.svg?height=400&width=300",
    customizable: true,
    colors: ["Black", "Navy", "Burgundy"],
    inStock: true,
  },
  {
    id: 2,
    name: "Leather Crossbody Bag",
    category: "bags",
    price: 450,
    image: "/placeholder.svg?height=400&width=300",
    customizable: true,
    colors: ["Brown", "Black", "Tan"],
    inStock: true,
  },
  {
    id: 3,
    name: "Cashmere Blazer",
    category: "clothing",
    price: 750,
    image: "/placeholder.svg?height=400&width=300",
    customizable: false,
    colors: ["Camel", "Navy"],
    inStock: false,
  },
  {
    id: 4,
    name: "Designer Tote Bag",
    category: "bags",
    price: 680,
    image: "/placeholder.svg?height=400&width=300",
    customizable: true,
    colors: ["Black", "White", "Rose Gold"],
    inStock: true,
  },
  {
    id: 5,
    name: "Luxury Scarf",
    category: "clothing",
    price: 280,
    image: "/placeholder.svg?height=400&width=300",
    customizable: true,
    colors: ["Ivory", "Navy", "Rose Gold"],
    inStock: true,
  },
  {
    id: 6,
    name: "Evening Clutch",
    category: "bags",
    price: 320,
    image: "/placeholder.svg?height=400&width=300",
    customizable: false,
    colors: ["Gold", "Silver", "Black"],
    inStock: true,
  },
]

export default function ProductsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [showCustomizable, setShowCustomizable] = useState(false)
  const [sortBy, setSortBy] = useState("featured")

  const filteredProducts = products.filter((product) => {
    if (selectedCategory !== "all" && product.category !== selectedCategory) return false
    if (selectedColors.length > 0 && !product.colors.some((color) => selectedColors.includes(color))) return false
    if (showCustomizable && !product.customizable) return false
    return true
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "name":
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  return (
    <div className="container py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-64 space-y-6">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-navy" />
            <h2 className="text-lg font-medium text-navy">Filters</h2>
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <h3 className="font-medium text-navy">Category</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="all"
                  checked={selectedCategory === "all"}
                  onCheckedChange={() => setSelectedCategory("all")}
                />
                <Label htmlFor="all" className="text-sm">
                  All Products
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="clothing"
                  checked={selectedCategory === "clothing"}
                  onCheckedChange={() => setSelectedCategory("clothing")}
                />
                <Label htmlFor="clothing" className="text-sm">
                  Clothing
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bags"
                  checked={selectedCategory === "bags"}
                  onCheckedChange={() => setSelectedCategory("bags")}
                />
                <Label htmlFor="bags" className="text-sm">
                  Bags
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Color Filter */}
          <div className="space-y-3">
            <h3 className="font-medium text-navy">Colors</h3>
            <div className="space-y-2">
              {["Black", "Navy", "White", "Brown", "Burgundy", "Rose Gold"].map((color) => (
                <div key={color} className="flex items-center space-x-2">
                  <Checkbox
                    id={color}
                    checked={selectedColors.includes(color)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedColors([...selectedColors, color])
                      } else {
                        setSelectedColors(selectedColors.filter((c) => c !== color))
                      }
                    }}
                  />
                  <Label htmlFor={color} className="text-sm">
                    {color}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Customizable Filter */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="customizable" checked={showCustomizable} onCheckedChange={setShowCustomizable} />
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
            {sortedProducts.map((product) => (
              <Card key={product.id} className="group border-warmgray/30 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={300}
                      height={400}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4 space-y-2">
                      {product.customizable && <Badge className="bg-rosegold text-ivory">Customizable</Badge>}
                      {!product.inStock && <Badge variant="secondary">Out of Stock</Badge>}
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="secondary" className="bg-ivory/90">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-medium text-navy group-hover:text-rosegold transition-colors">
                        <Link href={`/products/${product.id}`}>{product.name}</Link>
                      </h3>
                      <p className="text-sm text-navy/60 capitalize">{product.category}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-lg font-medium text-navy">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-navy/50 line-through">${product.originalPrice}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {product.colors.slice(0, 3).map((color) => (
                          <div
                            key={color}
                            className="w-4 h-4 rounded-full border border-warmgray"
                            style={{
                              backgroundColor: color.toLowerCase() === "rose gold" ? "#B76E79" : color.toLowerCase(),
                            }}
                          />
                        ))}
                        {product.colors.length > 3 && (
                          <span className="text-xs text-navy/60">+{product.colors.length - 3}</span>
                        )}
                      </div>

                      <Button
                        size="sm"
                        className="bg-burgundy hover:bg-burgundy/90 text-ivory"
                        disabled={!product.inStock}
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
