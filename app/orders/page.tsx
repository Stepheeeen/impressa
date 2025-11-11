"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { apiUrl } from "@/constants/apiUrl"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Truck, CheckCircle2, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const t = localStorage.getItem("impressa_token")
    const rawUser = localStorage.getItem("impressa_user")

    if (!t) {
      router.push("/login")
      return
    }

    setToken(t)

    try {
      setUser(rawUser ? JSON.parse(rawUser) : null)
    } catch {
      setUser(null)
    }
  }, [router])

  useEffect(() => {
    if (!token) return
    fetchOrders()
  }, [token])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${apiUrl}/orders/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setOrders(res.data || [])
    } catch (err) {
      console.error("Failed to fetch orders:", err)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (val: number) => `₦${Number(val).toLocaleString()}`

  const formatDate = (d: string) =>
    new Date(d).toLocaleString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  const statusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-700">Paid</Badge>
      case "shipped":
        return <Badge className="bg-blue-100 text-blue-700">Shipped</Badge>
      case "delivered":
        return <Badge className="bg-emerald-100 text-emerald-700">Delivered</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
    }
  }

  if (loading) {
    return (
      <div className="container py-16 text-center text-navy">
        Loading your orders…
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="container py-16 text-center">
        <Clock className="h-20 w-20 text-navy/30 mx-auto mb-4" />
        <h2 className="text-2xl font-light text-navy mb-2">No Orders Yet</h2>
        <p className="text-navy/60 mb-6">You haven’t placed any orders yet.</p>
        <Button asChild className="bg-burgundy text-ivory">
          <Link href="/products">
            <ArrowLeft className="mr-2 h-5 w-5" /> Start Shopping
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-10 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-light text-navy">My Orders</h1>
        <Button
          variant="outline"
          onClick={() => router.push("/cart")}
          className="text-burgundy border-burgundy"
        >
          Go to Cart
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => (
          <Card key={order._id} className="border-warmgray/30 hover:shadow-md transition">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-base text-navy">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-burgundy" />
                  Order #{order._id.slice(-6)}
                </div>
              </CardTitle>

              {statusBadge(order.status)}
            </CardHeader>

            <CardContent className="space-y-3 text-sm text-navy/80">
              <div className="flex justify-between">
                <span>Item Type:</span>
                <span className="font-medium">{order.itemType}</span>
              </div>

              <div className="flex justify-between">
                <span>Quantity:</span>
                <span className="font-medium">{order.quantity}</span>
              </div>

              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
              </div>

              <div className="flex justify-between">
                <span>Payment Ref:</span>
                <span className="font-mono text-xs">{order.paymentRef}</span>
              </div>

              {/* ✅ PATCHED DELIVERY ADDRESS */}
              <div className="flex justify-between items-start">
                <span>Address:</span>

                <div className="text-right max-w-[180px] text-xs leading-tight">
                  {order.deliveryAddress ? (
                    <>
                      <div>{order.deliveryAddress.address || "—"}</div>
                      <div>{order.deliveryAddress.state || ""}</div>
                      <div>{order.deliveryAddress.country || ""}</div>
                      <div className="font-mono text-[11px] mt-1 text-navy/60">
                        {order.deliveryAddress.phone || ""}
                      </div>
                    </>
                  ) : (
                    "—"
                  )}
                </div>
              </div>
              {/* ✅ END PATCH */}

              <div className="flex justify-between">
                <span>Ordered:</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>

              <div className="pt-3 border-t border-warmgray/20 flex justify-between items-center">
                {order.status === "paid" ? (
                  <Truck className="h-4 w-4 text-blue-500" />
                ) : order.status === "delivered" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Clock className="h-4 w-4 text-gray-400" />
                )}

                <span className="text-xs text-navy/60">
                  Last updated {formatDate(order.updatedAt)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
