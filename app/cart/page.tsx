"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag, Gift, Truck, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const cartItems = [
  {
    id: 1,
    name: "Silk Evening Dress",
    image: "/placeholder.svg?height=200&width=150",
    price: 899,
    originalPrice: 1200,
    quantity: 1,
    color: "Navy",
    size: "M",
    customized: false,
    inStock: true,
  },
  {
    id: 2,
    name: "Custom Leather Bag",
    image: "/placeholder.svg?height=200&width=150",
    price: 625,
    quantity: 1,
    color: "Brown",
    size: "Medium",
    customized: true,
    customizations: ["Premium Leather", "Gold Hardware", "Adjustable Strap"],
    inStock: true,
  },
  {
    id: 3,
    name: "Cashmere Blazer",
    image: "/placeholder.svg?height=200&width=150",
    price: 750,
    quantity: 1,
    color: "Camel",
    size: "L",
    customized: false,
    inStock: false,
  },
]

export default function CartPage() {
  const [items, setItems] = useState(cartItems)
  const [giftWrap, setGiftWrap] = useState(false)
  const [shippingMethod, setShippingMethod] = useState("standard")

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity === 0) {
      setItems(items.filter((item) => item.id !== id))
    } else {
      setItems(items.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
    }
  }

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const savings = items.reduce(
    (sum, item) => sum + ((item.originalPrice || item.price) - item.price) * item.quantity,
    0,
  )
  const giftWrapFee = giftWrap ? 25 : 0
  const shippingFee = shippingMethod === "express" ? 25 : subtotal > 500 ? 0 : 15
  const total = subtotal + giftWrapFee + shippingFee

  if (items.length === 0) {
    return (
      <div className="container py-16">
        <div className="text-center space-y-6">
          <ShoppingBag className="h-24 w-24 text-navy/30 mx-auto" />
          <div>
            <h1 className="text-3xl font-light text-navy mb-2">Your Cart is Empty</h1>
            <p className="text-navy/60">Discover our luxury collection and find your perfect piece</p>
          </div>
          <Button size="lg" className="bg-burgundy hover:bg-burgundy/90 text-ivory" asChild>
            <Link href="/products">
              Continue Shopping
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-navy mb-2">Shopping Cart</h1>
        <p className="text-navy/60">
          {items.length} item{items.length !== 1 ? "s" : ""} in your cart
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="border-warmgray/30">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="relative">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={150}
                      height={200}
                      className="w-24 h-32 object-cover rounded-lg"
                    />
                    {!item.inStock && (
                      <div className="absolute inset-0 bg-navy/80 rounded-lg flex items-center justify-center">
                        <Badge variant="secondary" className="text-xs">
                          Out of Stock
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-navy">{item.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-navy/60 mt-1">
                          <span>Color: {item.color}</span>
                          <span>Size: {item.size}</span>
                        </div>
                        {item.customized && (
                          <div className="mt-2">
                            <Badge className="bg-rosegold text-ivory text-xs">Custom Design</Badge>
                            <div className="mt-1 text-xs text-navy/60">{item.customizations?.join(", ")}</div>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="text-navy/60 hover:text-burgundy"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={!item.inStock}
                          className="h-8 w-8"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={!item.inStock}
                          className="h-8 w-8"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-navy">${item.price}</span>
                          {item.originalPrice && (
                            <span className="text-sm text-navy/50 line-through">${item.originalPrice}</span>
                          )}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-sm text-navy/60">Total: ${item.price * item.quantity}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card className="border-warmgray/30">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal ({items.length} items)</span>
                  <span>${subtotal}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>You Save</span>
                    <span>-${savings}</span>
                  </div>
                )}

                <Separator />

                {/* Shipping Options */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Shipping</Label>
                  <Select value={shippingMethod} onValueChange={setShippingMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (5-7 days) - {subtotal > 500 ? "Free" : "$15"}</SelectItem>
                      <SelectItem value="express">Express (2-3 days) - $25</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Gift Wrap */}
                <div className="flex items-center space-x-2">
                  <Checkbox id="gift-wrap" checked={giftWrap} onCheckedChange={setGiftWrap} />
                  <Label htmlFor="gift-wrap" className="text-sm flex items-center gap-2">
                    <Gift className="h-4 w-4" />
                    Luxury Gift Wrap (+$25)
                  </Label>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shippingFee === 0 ? "Free" : `$${shippingFee}`}</span>
                  </div>
                  {giftWrap && (
                    <div className="flex justify-between">
                      <span>Gift Wrap</span>
                      <span>${giftWrapFee}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-medium">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
              </div>

              <Button
                className="w-full bg-burgundy hover:bg-burgundy/90 text-ivory"
                size="lg"
                disabled={items.some((item) => !item.inStock)}
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm text-navy/60">
                <Truck className="h-4 w-4" />
                <span>Free shipping on orders over $500</span>
              </div>
            </CardContent>
          </Card>

          {/* Security Features */}
          <Card className="border-warmgray/30">
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <div className="text-sm font-medium text-navy">Secure Checkout</div>
                <div className="text-xs text-navy/60">Your payment information is encrypted and secure</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
