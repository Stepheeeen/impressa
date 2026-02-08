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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import SizeSelector from "@/components/SizeSelector"
import { resolveSizeOptions } from "@/lib/sizePresets"

interface DeliveryAddress {
  country: string
  state: string
  location: string
}

// Nigerian states (includes FCT)
const NIGERIA_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa",
  "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger",
  "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "FCT"
]

export default function CartPage() {
  const router = useRouter()

  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<{ username?: string; email?: string; phone?: string; role?: string } | null>(null)
  const [apiSubtotal, setApiSubtotal] = useState<number | null>(null)
  const [giftWrap, setGiftWrap] = useState(false)
  const [shippingMethod, setShippingMethod] = useState("standard")
  // default country is Nigeria per request
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    country: "Nigeria",
    state: "",
    location: "",
  })
  const [phone, setPhone] = useState("")

  // helper: safely parse numbers
  const safeNumber = (v: any) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }

  const formatCurrency = (value: number) => `₦${Math.round(value).toLocaleString()}`

  // ✅ Load auth + saved address
  useEffect(() => {
    const t = localStorage.getItem("impressa_token")
    const rawUser = localStorage.getItem("impressa_user")
    const savedAddress = localStorage.getItem("deliveryAddress")
    const savedPhone = localStorage.getItem("phoneNumber")

    if (!t) router.push("/login")

    setToken(t)

    // ✅ Safe parse delivery address
    if (savedAddress) {
      try {
        const parsed = JSON.parse(savedAddress)
        if (typeof parsed === "object") setDeliveryAddress(parsed)
        else setDeliveryAddress({ country: "", state: "", location: parsed }) // fallback
      } catch {
        // fallback: treat savedAddress as location only
        setDeliveryAddress({ country: "", state: "", location: savedAddress })
      }
    }

    if (savedPhone) setPhone(savedPhone)

    try {
      const parsedUser = rawUser ? JSON.parse(rawUser) : null
      setUser(parsedUser)
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
      console.log("Fetched cart data:", data)
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

  // Robust image resolver for cart items
  const getItemImage = (item: any) => {
    return (
      item?.imageUrl ||
      (Array.isArray(item?.imageUrls) && item.imageUrls.length > 0 ? item.imageUrls[0] : null) ||
      item?.template?.imageUrl ||
      (Array.isArray(item?.template?.imageUrls) && item.template.imageUrls.length > 0
        ? item.template.imageUrls[0]
        : null) ||
      "/placeholder.svg"
    )
  }

  // Optional: a helper to normalize item id if needed
  const getItemId = (item: any) => item?.id || item?._id || item?.templateId || item?.template?._id

  // Ensure initializePayment includes options + image so order records preserve variants
  const initializePayment = async () => {
    if (
      !deliveryAddress.country ||
      !deliveryAddress.state ||
      !deliveryAddress.location ||
      !phone.trim()
    ) {
      alert("Please fill all delivery fields and your WhatsApp number before proceeding.");
      return;
    }

    try {
      localStorage.setItem("deliveryAddress", JSON.stringify(deliveryAddress));
      localStorage.setItem("phoneNumber", phone);

      const subtotalValue =
        apiSubtotal !== null
          ? apiSubtotal
          : items.reduce(
            (acc, item) =>
              acc +
              (Number(item.itemTotal) ||
                Number(item.unitPrice) * Number(item.quantity)),
            0
          );

      const shippingFee = 1500;
      const totalWithDelivery = subtotalValue + shippingFee;
      const orderId = crypto.randomUUID();

      const res = await axios.post(
        `${apiUrl}/pay/initialize`,
        {
          email: user?.email,
          phone,
          country: deliveryAddress.country,
          state: deliveryAddress.state,
          address: deliveryAddress.location,
          amount: totalWithDelivery,
          orderId,

          // include full cart with options + image
          cart: items.map((i: any) => {
            return {
              id: getItemId(i),
              title: i?.title,
              quantity: Number(i?.quantity) || 1,
              unitPrice: Number(i?.unitPrice) || undefined,
              itemTotal: Number(i?.itemTotal) || undefined,
              itemType: i?.itemType,
              imageUrl: getItemImage(i),
              rawImageUrl: i?.imageUrl ?? undefined,
              options: {
                ...(i?.options ?? {}),
                size: i?.options?.size ?? i?.size ?? undefined,
                color: i?.options?.color ?? i?.color ?? undefined,
              },
              inStock: typeof i?.inStock === "boolean" ? i.inStock : undefined,
            }
          }),

          itemType: items[0]?.title || "general-item",
          quantity: items.reduce((acc: number, item: any) => acc + (Number(item.quantity) || 1), 0),
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      )

      const { authorization_url, reference } = res.data;
      const paystackWindow = window.open(authorization_url, "_blank", "width=600,height=700");

      if (!paystackWindow) {
        alert("Popup blocked. Please allow popups and try again.");
        return;
      }

      const pollInterval = setInterval(async () => {
        try {
          const verifyRes = await axios.get(`${apiUrl}/pay/verify/${reference}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (verifyRes.data?.status === "success" || verifyRes.data?.status === "paid") {
            clearInterval(pollInterval);

            try {
              paystackWindow.close();
            } catch { }

            await clearCart();
            alert("Payment successful! Your order has been created.");

            router.push("/orders");
          }
        } catch (err) {
          console.warn("Verify polling...", err);
        }
      }, 4000);

      setTimeout(() => clearInterval(pollInterval), 120000);
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
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-light text-navy mb-2">Shopping Cart</h1>
          <p className="text-navy/60">{items.length} items in cart</p>
        </div>
        <Button variant="ghost" className="text-burgundy self-start sm:self-auto" onClick={clearCart}>
          Clear Cart
        </Button>
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
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <Image
                      src={getItemImage(item)}
                      alt={item?.title || "Product"}
                      width={150}
                      height={200}
                      className="w-full h-48 sm:w-24 sm:h-32 rounded-md object-cover"
                    />
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
                        <div>
                          <h3 className="font-medium text-navy">{item?.title || "Product"}</h3>
                          <p className="text-sm text-navy/60">
                            {item?.itemType ? String(item.itemType).toLowerCase() : "standard item"}
                          </p>
                          {(item?.options?.size || item?.options?.color || item?.size || item?.color) && (
                            <div className="text-xs text-navy/70 mt-1 flex flex-col sm:flex-row sm:items-center sm:gap-3">
                              {/* Size (dynamic presets) */}
                              <div>
                                <SizeSelector
                                  category={String(item?.category ?? item?.itemType ?? "")}
                                  current={item?.options?.size ?? item?.size ?? null}
                                  readOnly={true} // cart is display-only; set to false where users can change size
                                  numericRange={
                                    // example: if item carries numeric range meta
                                    item?.sizeRange ? { min: item.sizeRange.min, max: item.sizeRange.max, step: item.sizeRange.step } : undefined
                                  }
                                />
                              </div>

                              {/* Color */}
                              {(item?.options?.color || item?.color) && (
                                <div className="mt-1 sm:mt-0">
                                  Color: {item?.options?.color ?? item?.color}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="text-xs text-navy/60 mt-1 flex items-center gap-3">
                            {/* <span>SKU: {getItemId(item) ?? "—"}</span> */}
                            <span className={item?.inStock ? "text-green-600" : "text-red-500"}>
                              {item?.inStock ? "In stock" : "Out of stock"}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="self-end sm:self-auto" onClick={() => removeItem(itemId)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>

                      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            disabled={qty <= 1}
                            onClick={() => updateQuantity(itemId, Math.max(1, qty - 1))}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{qty}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => updateQuantity(itemId, qty + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right font-medium text-navy sm:text-right">
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

        {/* Order Summary & Address */}
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

              {/* Delivery Instructions */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm text-yellow-900 rounded-md space-y-1">
                <p>Orders take <strong>3-7 business days</strong> for delivery.</p>
                <p>Provide an <strong>active WhatsApp number</strong> to receive updates via WhatsApp or email.</p>
              </div>

              {/* Address Fields */}
              <div className="space-y-4">
                <div>

                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={user?.username || ""}
                    onChange={(e) => setUser({ ...user!, username: e.target.value })}
                    className="border-warmgray/50"
                  />
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number (WhatsApp)</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="e.g., +2348012345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border-warmgray/50"
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={deliveryAddress.country}
                    onValueChange={(v) => setDeliveryAddress({ ...deliveryAddress, country: v, state: "" })}
                  >
                    <SelectTrigger id="country" className="w-full">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nigeria">Nigeria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="state" className="mt-2">State</Label>
                  {/* show Nigerian states when country is Nigeria, otherwise show a small select with "Other" */}
                  <Select
                    value={deliveryAddress.state}
                    onValueChange={(v) => setDeliveryAddress({ ...deliveryAddress, state: v })}
                  >
                    <SelectTrigger id="state" className="w-full">
                      <SelectValue placeholder={deliveryAddress.country === "Nigeria" ? "Select state" : "Select / Enter state"} />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryAddress.country === "Nigeria"
                        ? NIGERIA_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)
                        : (
                          <>
                            <SelectItem value="Other">Other</SelectItem>
                          </>
                        )}
                    </SelectContent>
                  </Select>
                  {/* If user selected Other for non-Nigeria countries, allow manual entry */}
                  {deliveryAddress.country !== "Nigeria" && deliveryAddress.state === "Other" && (
                    <Input
                      id="stateManual"
                      placeholder="Enter your state / region"
                      value={deliveryAddress.state === "Other" ? "" : deliveryAddress.state}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, state: e.target.value })}
                      className="border-warmgray/50 mt-2"
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="location">City / Location</Label>
                  <Input
                    id="location"
                    placeholder="Enter your city or neighborhood"
                    value={deliveryAddress.location}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, location: e.target.value })}
                    className="border-warmgray/50"
                  />
                </div>
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
                <span>Free shipping on orders over ₦50,000</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
