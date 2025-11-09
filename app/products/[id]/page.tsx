"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import {
  Heart,
  ShoppingBag,
  Palette,
  Star,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { apiUrl } from "@/constants/apiUrl"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [showCustomization, setShowCustomization] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [toast, setToast] = useState<{ message: string; type?: "success" | "error" } | null>(null)

  // preserve your original auth check
  useEffect(() => {
    const auth = localStorage.getItem("impressa_token")
    if (auth) setIsAuthenticated(true)
  }, [])

  const handleAddToCart = async ({
    templateId,
    designId = null,
    itemType,
    quantity,
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

  // ✅ Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${apiUrl}/templates/${id}`)
        setProduct(res.data)
        setSelectedColor(res.data.colors?.[0] ?? "")
        setSelectedSize(res.data.sizes?.[0] ?? "")
      } catch (err) {
        setError("Product not found.")
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchProduct()
  }, [id])

  if (loading) {
    return (
      <div className="container py-16 text-center text-navy">
        Loading product…
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container py-16 text-center text-red-600">
        {error || "Unable to load product"}
      </div>
    )
  }

  const showToast = (message: string, type: "success" | "error" = "success", duration = 3000) => {
    setToast({ message, type })
    window.setTimeout(() => {
      setToast(null)
    }, duration)
  }


  // ✅ Fallback images array (backend only gives one)
  const images = [product.imageUrl]

  return (
    <div className="container py-8">
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
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-[4/5] overflow-hidden rounded-lg bg-warmgray/20">
            <Image
              src={images[selectedImage] || "/placeholder.svg"}
              alt={product.title}
              width={500}
              height={600}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${selectedImage === index
                  ? "border-rosegold"
                  : "border-warmgray/30"
                  }`}
              >
                <Image
                  src={image}
                  alt={`${product.title} ${index + 1}`}
                  width={120}
                  height={120}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs uppercase tracking-wide">
                {product.category}
              </Badge>

              {product.customizable && (
                <Badge className="bg-rosegold text-ivory">
                  <Palette className="w-3 h-3 mr-1" />
                  Customizable
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-light text-navy mb-2">{product.title}</h1>

            {/* <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-rosegold text-rosegold" />
                ))}
              </div>
              <span className="text-sm text-navy/60">(24 reviews)</span>
            </div> */}

            <div className="flex items-center gap-3">
              <span className="text-3xl font-light text-navy">
                ₦{(product.price).toLocaleString()}
              </span>
            </div>
          </div>

          <Separator />

          {/* Product Options */}
          <div className="space-y-6">
            {/* Color Selection */}
            {product.colors?.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Color: {selectedColor}
                </Label>
                <div className="flex gap-3">
                  {product.colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor === color
                        ? "border-rosegold scale-110"
                        : "border-warmgray"
                        }`}
                      style={{
                        backgroundColor: color.toLowerCase(),
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes?.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-medium">Size</Label>
                <Select
                  value={selectedSize}
                  onValueChange={setSelectedSize}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.sizes.map((size: string) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Quantity</Label>
              <Select
                value={quantity.toString()}
                onValueChange={(v) => setQuantity(Number(v))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button
              size="lg"
              className="flex-1 bg-burgundy text-ivory"
              onClick={async () => {
                if (!isAuthenticated) return router.push("/login")
                await handleAddToCart({
                  templateId: product._id,
                  itemType: product.category ?? "product",
                  price: product.price ?? 0,
                  quantity: quantity,
                })
              }}
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>

            {product.customizable && (
              <Dialog open={showCustomization} onOpenChange={setShowCustomization}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-rosegold text-rosegold hover:bg-rosegold hover:text-ivory"
                  >
                    <Palette className="w-5 h-5 mr-2" />
                    Customize This Item
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-light text-navy">
                      Customize {product.title}
                    </DialogTitle>
                  </DialogHeader>

                  {/* Customization UI (Optional Extension) */}
                  <p className="text-navy/60">Customization module coming soon…</p>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 py-6 border-y border-warmgray/30">
            <div className="text-center space-y-2">
              <Truck className="w-6 h-6 text-rosegold mx-auto" />
              <p className="font-medium text-navy">Free Shipping</p>
              <p className="text-navy/60">On orders over ₦500,000</p>
            </div>

            <div className="text-center space-y-2">
              <Shield className="w-6 h-6 text-rosegold mx-auto" />
              <p className="font-medium text-navy">Authenticity</p>
              <p className="text-navy/60">Guaranteed</p>
            </div>

            <div className="text-center space-y-2">
              <RotateCcw className="w-6 h-6 text-rosegold mx-auto" />
              <p className="font-medium text-navy">Easy Returns</p>
              <p className="text-navy/60">30 days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description / Tabs */}
      <div className="mt-16">
        <Tabs defaultValue="description">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-8">
            <Card>
              <CardContent className="p-6">
                <p className="text-navy/80">
                  Product information coming soon…
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="mt-8">
            <Card>
              <CardContent className="p-6">
                <p className="text-navy/80">Specifications coming soon…</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-8">
            <Card>
              <CardContent className="p-6">
                <p className="text-navy/60 text-center">No reviews yet</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
