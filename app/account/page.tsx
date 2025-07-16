import Link from "next/link"
import { User, Package, Heart, Settings, CreditCard, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const recentOrders = [
  {
    id: "ORD-001",
    date: "2024-01-15",
    status: "Delivered",
    total: 899,
    items: ["Silk Evening Dress"],
  },
  {
    id: "ORD-002",
    date: "2024-01-10",
    status: "In Production",
    total: 625,
    items: ["Custom Leather Bag"],
  },
  {
    id: "ORD-003",
    date: "2024-01-05",
    status: "Shipped",
    total: 750,
    items: ["Cashmere Blazer"],
  },
]

const savedDesigns = [
  {
    id: 1,
    name: "Custom Evening Dress",
    image: "/placeholder.svg?height=150&width=120",
    price: 1049,
    customizations: ["Navy Silk", "V-Neck", "Full Length"],
  },
  {
    id: 2,
    name: "Personalized Tote Bag",
    image: "/placeholder.svg?height=150&width=120",
    price: 575,
    customizations: ["Brown Leather", "Gold Hardware", "Large Size"],
  },
]

export default function AccountPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-navy mb-2">My Account</h1>
        <p className="text-navy/60">Manage your profile, orders, and preferences</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start text-navy hover:text-rosegold hover:bg-rosegold/10">
            <User className="mr-3 h-4 w-4" />
            Profile
          </Button>
          <Button variant="ghost" className="w-full justify-start text-navy hover:text-rosegold hover:bg-rosegold/10">
            <Package className="mr-3 h-4 w-4" />
            Orders
          </Button>
          <Button variant="ghost" className="w-full justify-start text-navy hover:text-rosegold hover:bg-rosegold/10">
            <Heart className="mr-3 h-4 w-4" />
            Wishlist
          </Button>
          <Button variant="ghost" className="w-full justify-start text-navy hover:text-rosegold hover:bg-rosegold/10">
            <CreditCard className="mr-3 h-4 w-4" />
            Payment Methods
          </Button>
          <Button variant="ghost" className="w-full justify-start text-navy hover:text-rosegold hover:bg-rosegold/10">
            <MapPin className="mr-3 h-4 w-4" />
            Addresses
          </Button>
          <Button variant="ghost" className="w-full justify-start text-navy hover:text-rosegold hover:bg-rosegold/10">
            <Settings className="mr-3 h-4 w-4" />
            Settings
          </Button>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Profile Overview */}
          <Card className="border-warmgray/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-rosegold" />
                Profile Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-rosegold/10 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-rosegold" />
                </div>
                <div>
                  <h3 className="font-medium text-navy">Sarah Johnson</h3>
                  <p className="text-navy/60">sarah.johnson@email.com</p>
                  <Badge className="bg-rosegold text-ivory mt-1">VIP Member</Badge>
                </div>
              </div>
              <Separator />
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-light text-navy">12</div>
                  <div className="text-sm text-navy/60">Total Orders</div>
                </div>
                <div>
                  <div className="text-2xl font-light text-navy">$3,247</div>
                  <div className="text-sm text-navy/60">Total Spent</div>
                </div>
                <div>
                  <div className="text-2xl font-light text-navy">5</div>
                  <div className="text-sm text-navy/60">Custom Designs</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="border-warmgray/30">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-rosegold" />
                Recent Orders
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/account/orders">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border border-warmgray/30 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-navy">{order.id}</div>
                      <div className="text-sm text-navy/60">{order.date}</div>
                      <div className="text-sm text-navy/80">{order.items.join(", ")}</div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={order.status === "Delivered" ? "default" : "secondary"}
                        className={order.status === "Delivered" ? "bg-green-100 text-green-800" : ""}
                      >
                        {order.status}
                      </Badge>
                      <div className="text-sm font-medium text-navy mt-1">${order.total}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Saved Designs */}
          <Card className="border-warmgray/30">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-rosegold" />
                Saved Designs
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/custom">Create New</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {savedDesigns.map((design) => (
                  <div key={design.id} className="border border-warmgray/30 rounded-lg p-4">
                    <div className="flex gap-3">
                      <img
                        src={design.image || "/placeholder.svg"}
                        alt={design.name}
                        className="w-16 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-navy">{design.name}</h4>
                        <div className="text-sm text-navy/60 mt-1">{design.customizations.join(", ")}</div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-medium text-navy">${design.price}</span>
                          <Button size="sm" className="bg-burgundy hover:bg-burgundy/90 text-ivory">
                            Order Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
