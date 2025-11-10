"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag, Truck, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import axios from "axios"
import { apiUrl } from "@/constants/apiUrl"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CartPage() {
  const router = useRouter()

  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<{ username?: string; email?: string; role?: string } | null>(null)
  const [apiSubtotal, setApiSubtotal] = useState<number | null>(null)
  const [giftWrap, setGiftWrap] = useState(false)
  const [shippingMethod, setShippingMethod] = useState("standard")
  const [deliveryAddress, setDeliveryAddress] = useState("")

  // helper: safely parse numbers
  const safeNumber = (v: any) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }

  const getItemId = (item: any) => item?.id ?? item?.itemId ?? item?._id ?? ""
  const formatCurrency = (value: number) => `₦${Math.round(value).toLocaleString()}`

  // ✅ Load auth + saved address
  useEffect(() => {
    const t = localStorage.getItem("impressa_token")
    const rawUser = localStorage.getItem("impressa_user")
    const savedAddress = localStorage.getItem("deliveryAddress")

    if (!t) {
      router.push("/login")
    }

    setToken(t)
    setDeliveryAddress(savedAddress || "")

    try {
      const parsed = rawUser ? JSON.parse(rawUser) : null
      setUser(parsed)
    } catch {
      setUser(null)
    }
  }, [router])

  // ✅ Fetch Cart
  useEffect(() => {
    if (!token) return
    fetchCart()
  }, [token])

  const fetchCart = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${apiUrl}/cart/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = res.data || {}
      setItems(Array.isArray(data.items) ? data.items : [])
      setApiSubtotal(safeNumber(data.subtotal))
    } catch (err) {
      console.error("Failed to fetch cart:", err)
      setItems([])
      setApiSubtotal(null)
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      await axios.delete(`${apiUrl}/cart/remove/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchCart()
    } catch (err) {
      console.error("Delete failed:", err)
    }
  }

  const clearCart = async () => {
    try {
      await axios.delete(`${apiUrl}/cart/clear`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchCart()
    } catch (err) {
      console.error("Clear cart failed:", err)
    }
  }

  const updateQuantity = async (itemId: string, newQty: number) => {
    if (newQty < 1) {
      removeItem(itemId)
      return
    }
    try {
      await axios.post(
        `${apiUrl}/cart/update`,
        { id: itemId, quantity: newQty },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchCart()
    } catch (err) {
      console.error("Update quantity failed:", err)
    }
  }

  // ✅ Initialize Payment (Frontend)
  const initializePayment = async () => {
    if (!deliveryAddress.trim()) {
      alert("Please enter your delivery address before proceeding.")
      return
    }

    try {
      localStorage.setItem("deliveryAddress", deliveryAddress)

      const subtotalValue =
        apiSubtotal !== null
          ? apiSubtotal
          : items.reduce(
              (acc, item) =>
                acc +
                (Number(item.itemTotal) ||
                  Number(item.unitPrice) * Number(item.quantity)),
              0
            )

      const totalWithDelivery = subtotalValue + 1500
      const orderId = crypto.randomUUID()

      const res = await axios.post(
        `${apiUrl}/pay/initialize`,
        {
          email: user?.email,
          amount: totalWithDelivery,
          orderId,
          cart: items,
          deliveryAddress,
          itemType: items[0]?.title || "general-item",
          quantity: items.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const { authorization_url, reference } = res.data
      const paystackWindow = window.open(authorization_url, "_blank")

      // ✅ Auto verify payment
      const pollInterval = setInterval(async () => {
        try {
          const verifyRes = await axios.get(`${apiUrl}/pay/verify/${reference}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (verifyRes.data?.status === "success" || verifyRes.data?.status === "paid") {
            clearInterval(pollInterval)
            paystackWindow?.close()
            clearCart()
            alert("Payment successful! Your order has been created.")
            // router.push("/orders")
          }
        } catch {
          // keep polling
        }
      }, 4000)

      setTimeout(() => clearInterval(pollInterval), 120000)
    } catch (err) {
      console.error("Payment init failed:", err)
      alert("Payment initialization failed, please try again.")
    }
  }

  if (loading) {
    return (
      <div className="container py-16 text-center text-navy">
        Loading your cart…
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container py-16">
        <div className="text-center space-y-6">
          <ShoppingBag className="h-24 w-24 text-navy/30 mx-auto" />
          <div>
            <h1 className="text-3xl font-light text-navy mb-2">Your Cart is Empty</h1>
            <p className="text-navy/60">Explore our products and find something amazing.</p>
          </div>
          <Button size="lg" className="bg-burgundy text-ivory" asChild>
            <Link href="/products">
              Continue Shopping <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const computedSubtotal =
    apiSubtotal !== null
      ? apiSubtotal
      : items.reduce((sum, item) => {
          const itemTotal = safeNumber(item.itemTotal)
          if (itemTotal > 0) return sum + itemTotal
          return sum + safeNumber(item.unitPrice) * safeNumber(item.quantity)
        }, 0)

  const shippingFee = 1500
  const total = computedSubtotal + shippingFee

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-light text-navy mb-2">Shopping Cart</h1>
            <p className="text-navy/60">{items.length} items in cart</p>
          </div>
          <Button variant="ghost" className="text-burgundy" onClick={clearCart}>
            Clear Cart
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const itemId = getItemId(item)
            const qty = safeNumber(item.quantity)
            const unitPrice = safeNumber(item.unitPrice)
            const lineTotal =
              safeNumber(item.itemTotal) > 0 ? safeNumber(item.itemTotal) : unitPrice * qty

            return (
              <Card key={itemId || Math.random()} className="border-warmgray/30">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Image
                      src={item.imageUrl || "/placeholder.svg"}
                      alt={item.title || "Product"}
                      width={150}
                      height={200}
                      className="w-24 h-32 rounded-md object-cover"
                    />
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-navy">{item.title}</h3>
                          <p className="text-sm text-navy/60">Standard Item</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeItem(itemId)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={qty <= 1}
                            onClick={() => updateQuantity(itemId, Math.max(1, qty - 1))}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{qty}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(itemId, qty + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right font-medium text-navy">
                          {formatCurrency(lineTotal)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card className="border-warmgray/30">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(computedSubtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatCurrency(shippingFee)}</span>
              </div>

              <Separator />

              {/* ✅ Delivery Address Input */}
              <div className="space-y-2">
                <Label htmlFor="deliveryAddress">Delivery Address</Label>
                <Input
                  id="deliveryAddress"
                  placeholder="Enter your delivery address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="border-warmgray/50"
                />
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-medium">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>

              <Button
                className="w-full bg-burgundy text-ivory"
                size="lg"
                onClick={initializePayment}
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm text-navy/60">
                <Truck className="h-4 w-4" />
                <span>Free shipping on orders over ₦500,000</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
