"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, ShoppingBag, Palette, Star, Truck, Shield, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Mock product data
const product = {
  id: 1,
  name: "Silk Evening Dress",
  category: "clothing",
  price: 899,
  originalPrice: 1200,
  images: [
    "/placeholder.svg?height=600&width=500",
    "/placeholder.svg?height=600&width=500",
    "/placeholder.svg?height=600&width=500",
    "/placeholder.svg?height=600&width=500",
  ],
  customizable: true,
  colors: ["Black", "Navy", "Burgundy", "Rose Gold"],
  sizes: ["XS", "S", "M", "L", "XL"],
  inStock: true,
  description:
    "An exquisite silk evening dress crafted with the finest materials. This elegant piece features a timeless silhouette that flatters every figure, making it perfect for special occasions and formal events.",
  features: ["100% Pure Silk", "Hand-finished seams", "Invisible zipper closure", "Dry clean only", "Made in Italy"],
  customizationOptions: {
    colors: ["Black", "Navy", "Burgundy", "Rose Gold", "Emerald", "Ivory"],
    fabrics: ["Silk", "Satin", "Chiffon"],
    lengths: ["Midi", "Full Length", "Tea Length"],
    necklines: ["V-Neck", "Round Neck", "Off-Shoulder"],
    sleeves: ["Sleeveless", "Cap Sleeve", "3/4 Sleeve", "Long Sleeve"],
  },
}

export default function ProductDetailPage() {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(product.colors[0])
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [showCustomization, setShowCustomization] = useState(false)

  // Customization state
  const [customColor, setCustomColor] = useState(product.customizationOptions.colors[0])
  const [customFabric, setCustomFabric] = useState(product.customizationOptions.fabrics[0])
  const [customLength, setCustomLength] = useState(product.customizationOptions.lengths[0])
  const [customNeckline, setCustomNeckline] = useState(product.customizationOptions.necklines[0])
  const [customSleeves, setCustomSleeves] = useState(product.customizationOptions.sleeves[0])

  return (
    <div className="container py-8">
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-[4/5] overflow-hidden rounded-lg bg-warmgray/20">
            <Image
              src={product.images[selectedImage] || "/placeholder.svg"}
              alt={product.name}
              width={500}
              height={600}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                  selectedImage === index ? "border-rosegold" : "border-warmgray/30"
                }`}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${product.name} ${index + 1}`}
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
            <h1 className="text-3xl font-light text-navy mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-rosegold text-rosegold" />
                ))}
              </div>
              <span className="text-sm text-navy/60">(24 reviews)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-light text-navy">${product.price}</span>
              {product.originalPrice && (
                <span className="text-xl text-navy/50 line-through">${product.originalPrice}</span>
              )}
              {product.originalPrice && (
                <Badge variant="destructive" className="bg-burgundy">
                  Save ${product.originalPrice - product.price}
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Product Options */}
          <div className="space-y-6">
            {/* Color Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Color: {selectedColor}</Label>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      selectedColor === color ? "border-rosegold scale-110" : "border-warmgray"
                    }`}
                    style={{
                      backgroundColor:
                        color.toLowerCase() === "rose gold"
                          ? "#B76E79"
                          : color.toLowerCase() === "burgundy"
                            ? "#800020"
                            : color.toLowerCase(),
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Size</Label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {product.sizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Quantity</Label>
              <Select value={quantity.toString()} onValueChange={(value) => setQuantity(Number.parseInt(value))}>
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
            <div className="flex gap-4">
              <Button size="lg" className="flex-1 bg-burgundy hover:bg-burgundy/90 text-ivory" disabled={!selectedSize}>
                <ShoppingBag className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-navy text-navy hover:bg-navy hover:text-ivory bg-transparent"
              >
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            {product.customizable && (
              <Dialog open={showCustomization} onOpenChange={setShowCustomization}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-rosegold text-rosegold hover:bg-rosegold hover:text-ivory bg-transparent"
                  >
                    <Palette className="w-5 h-5 mr-2" />
                    Customize This Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-light text-navy">Customize Your {product.name}</DialogTitle>
                  </DialogHeader>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-base font-medium">Color</Label>
                        <Select value={customColor} onValueChange={setCustomColor}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {product.customizationOptions.colors.map((color) => (
                              <SelectItem key={color} value={color}>
                                {color}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-base font-medium">Fabric</Label>
                        <Select value={customFabric} onValueChange={setCustomFabric}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {product.customizationOptions.fabrics.map((fabric) => (
                              <SelectItem key={fabric} value={fabric}>
                                {fabric}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-base font-medium">Length</Label>
                        <Select value={customLength} onValueChange={setCustomLength}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {product.customizationOptions.lengths.map((length) => (
                              <SelectItem key={length} value={length}>
                                {length}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-base font-medium">Neckline</Label>
                        <Select value={customNeckline} onValueChange={setCustomNeckline}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {product.customizationOptions.necklines.map((neckline) => (
                              <SelectItem key={neckline} value={neckline}>
                                {neckline}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-base font-medium">Sleeves</Label>
                        <Select value={customSleeves} onValueChange={setCustomSleeves}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {product.customizationOptions.sleeves.map((sleeve) => (
                              <SelectItem key={sleeve} value={sleeve}>
                                {sleeve}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="aspect-[4/5] bg-warmgray/20 rounded-lg flex items-center justify-center">
                        <div className="text-center text-navy/60">
                          <Palette className="w-12 h-12 mx-auto mb-2" />
                          <p>Preview will update based on your selections</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Base Price:</span>
                          <span>${product.price}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Customization Fee:</span>
                          <span>$150</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-medium">
                          <span>Total:</span>
                          <span>${product.price + 150}</span>
                        </div>
                      </div>

                      <Button className="w-full bg-burgundy hover:bg-burgundy/90 text-ivory">
                        Add Custom Item to Cart
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-warmgray/30">
            <div className="text-center space-y-2">
              <Truck className="w-6 h-6 text-rosegold mx-auto" />
              <div className="text-sm">
                <p className="font-medium text-navy">Free Shipping</p>
                <p className="text-navy/60">On orders over $500</p>
              </div>
            </div>
            <div className="text-center space-y-2">
              <Shield className="w-6 h-6 text-rosegold mx-auto" />
              <div className="text-sm">
                <p className="font-medium text-navy">Authenticity</p>
                <p className="text-navy/60">Guaranteed genuine</p>
              </div>
            </div>
            <div className="text-center space-y-2">
              <RotateCcw className="w-6 h-6 text-rosegold mx-auto" />
              <div className="text-sm">
                <p className="font-medium text-navy">Easy Returns</p>
                <p className="text-navy/60">30-day policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Information Tabs */}
      <div className="mt-16">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-8">
            <Card>
              <CardContent className="p-6">
                <p className="text-navy/80 leading-relaxed">{product.description}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="mt-8">
            <Card>
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-navy/80">
                      <div className="w-2 h-2 bg-rosegold rounded-full mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-8">
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-navy/60">
                  <Star className="w-12 h-12 mx-auto mb-4 text-rosegold" />
                  <p>Reviews coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
