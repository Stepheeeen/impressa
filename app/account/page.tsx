"use client"
import Link from "next/link"
import { User, Package, Power } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import axios from "axios"
import { Skeleton } from "@/components/ui/skeleton"
import { apiUrl } from "@/constants/apiUrl"
import { apiErrorMessage } from "@/lib/apiError"

interface Order {
	_id: string
	itemType: string
	totalAmount: number
	status: string
	paymentRef: string
	createdAt: string
}

export default function AccountPage() {
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [user, setUser] = useState<{ username?: string; email?: string; role?: string } | null>(null)
	const [orders, setOrders] = useState<Order[]>([])
	const [loadingOrders, setLoadingOrders] = useState(true)
	const router = useRouter()

	useEffect(() => {
		const checkAuth = () => {
			const token = localStorage.getItem("impressa_token")
			const rawUser = localStorage.getItem("impressa_user")

			if (!token) {
				setIsAuthenticated(false)
				setUser(null)
				router.push("/products")
				return
			}

			try {
				const parsed = rawUser ? JSON.parse(rawUser) : null
				setUser(parsed)
			} catch {
				setUser(null)
			}
			setIsAuthenticated(true)
		}

		checkAuth()

		const onStorage = (e: StorageEvent) => {
			if (e.key === "impressa_token" || e.key === "impressa_user" || e.key === null) {
				checkAuth()
			}
		}

		window.addEventListener("storage", onStorage)
		return () => window.removeEventListener("storage", onStorage)
	}, [router])

	useEffect(() => {
		const fetchOrders = async () => {
			setLoadingOrders(true)
			try {
				const token = localStorage.getItem("impressa_token")
				const res = await axios.get(`${apiUrl}/orders/user/me`, {
					headers: { Authorization: `Bearer ${token}` },
				})
				const sorted = res.data.sort(
					(a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				)
				setOrders(sorted)
			} catch (err) {
				console.error("Failed to fetch orders:", err)
			} finally {
				setLoadingOrders(false)
			}
		}

		if (isAuthenticated) fetchOrders()
	}, [isAuthenticated])

	const [deleteOpen, setDeleteOpen] = useState(false)
	const [deletePassword, setDeletePassword] = useState("")
	const [deleteError, setDeleteError] = useState("")
	const [deleting, setDeleting] = useState(false)

	const handleLogout = () => {
		localStorage.removeItem("impressa_token")
		localStorage.removeItem("impressa_user")
		window.dispatchEvent(new Event("impressa_auth_change"))
		router.push("/products")
	}

	const openDeleteDialog = (open: boolean) => {
		setDeleteOpen(open)
		setDeletePassword("")
		setDeleteError("")
	}

	const handleDeleteAccount = async (e: React.FormEvent) => {
		e.preventDefault()
		setDeleteError("")
		if (!deletePassword) {
			setDeleteError("Enter your password to confirm.")
			return
		}

		setDeleting(true)
		try {
			const token = localStorage.getItem("impressa_token")
			await axios.delete(`${apiUrl}/auth/me`, {
				headers: { Authorization: `Bearer ${token}` },
				data: { password: deletePassword },
			})
			setDeleteOpen(false)
			handleLogout()
		} catch (err) {
			setDeleteError(apiErrorMessage(err, "Couldn't delete your account. Try again."))
		} finally {
			setDeleting(false)
		}
	}

	if (!isAuthenticated) return null

	const totalOrders = orders.length
	const recentOrders = orders.slice(0, 5)

	return (
		<div className="container py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-light text-navy mb-2">My Account</h1>
			</div>

			<div className="grid lg:grid-cols-4 gap-8">
				{/* Sidebar Navigation */}
				<div className="space-y-2">
					<Button
						variant="ghost"
						className="w-full justify-start text-navy hover:text-rosegold hover:bg-rosegold/10"
						onClick={() => router.push("/orders")}
					>
						<Package className="mr-3 h-4 w-4" />
						Orders
					</Button>
					<Button
						variant="ghost"
						className="w-full justify-start text-navy hover:text-rosegold hover:bg-rosegold/10"
						onClick={handleLogout}
					>
						<Power className="mr-3 h-4 w-4" />
						Logout
					</Button>
				</div>

				{/* Main Content */}
				<div className="lg:col-span-3 space-y-8">
					{/* Profile Overview */}
					<Card className="border-warmgray/30">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">Profile Overview</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center gap-4">
								<div className="w-16 h-16 bg-rosegold/10 rounded-full flex items-center justify-center">
									<User className="h-8 w-8 text-rosegold" />
								</div>
								<div>
									<h3 className="font-medium text-navy">{user?.username || "Guest"}</h3>
									<p className="text-navy/60">{user?.email || "—"}</p>
								</div>
							</div>
							<Separator />
							<div className="grid md:grid-cols-2 gap-4 text-center">
								<div>
									<div className="text-2xl font-light text-navy">
										{loadingOrders ? <Skeleton className="h-6 w-8 mx-auto" /> : totalOrders}
									</div>
									<div className="text-sm text-navy/60">Total Orders</div>
								</div>
								<div>
									<div className="text-2xl font-light text-navy">0</div>
									<div className="text-sm text-navy/60">Custom Designs</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Recent Orders */}
					<Card className="border-warmgray/30">
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle className="flex items-center gap-2">Recent Orders</CardTitle>
							<Button variant="outline" size="sm" asChild>
								<Link href="/orders">View All</Link>
							</Button>
						</CardHeader>
						<CardContent>
							{loadingOrders ? (
								<div className="space-y-3">
									{[...Array(3)].map((_, i) => (
										<Skeleton key={i} className="h-16 w-full rounded-md" />
									))}
								</div>
							) : recentOrders.length === 0 ? (
								<p className="text-sm text-muted-foreground py-2">No recent orders found.</p>
							) : (
								<div className="space-y-4">
									{recentOrders.map((order) => (
										<div
											key={order._id}
											className="flex items-center justify-between p-4 border border-warmgray/30 rounded-lg"
										>
											<div>
												<div className="font-medium text-navy">{order.paymentRef}</div>
												<div className="text-sm text-navy/60">
													{new Date(order.createdAt).toLocaleDateString()}
												</div>
												<div className="text-sm text-navy/80 capitalize">{order.itemType}</div>
											</div>
											<div className="text-right">
												<Badge
													variant={
														order.status === "delivered" ? "default" : "secondary"
													}
													className={
														order.status === "delivered"
															? "bg-green-100 text-green-800"
															: ""
													}
												>
													{order.status}
												</Badge>
												<div className="text-sm font-medium text-navy mt-1">
													₦{order.totalAmount.toLocaleString()}
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Delete Account */}
					<Card className="border-warmgray/30">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">Delete account</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="text-sm text-navy/70 max-w-prose">
								Permanently delete your Impressa account, cart and saved details. Records of past orders are kept for
								accounting, without your contact details. You can only delete your account once all your orders have
								been delivered.
							</p>
							<Button
								variant="outline"
								className="border-destructive text-destructive hover:bg-destructive hover:text-white"
								onClick={() => openDeleteDialog(true)}
							>
								Delete account
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>

			<Dialog open={deleteOpen} onOpenChange={openDeleteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete your account?</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleDeleteAccount} className="space-y-4">
						<p className="text-sm text-navy/70">
							This can't be undone. Enter your password to confirm.
						</p>
						<div className="space-y-2">
							<Label htmlFor="delete-password">Password</Label>
							<Input
								id="delete-password"
								type="password"
								autoComplete="current-password"
								value={deletePassword}
								onChange={(e) => setDeletePassword(e.target.value)}
							/>
						</div>
						{deleteError && (
							<p className="text-destructive text-sm" role="alert">
								{deleteError}
							</p>
						)}
						<div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
							<Button type="button" variant="outline" onClick={() => openDeleteDialog(false)} disabled={deleting}>
								Keep my account
							</Button>
							<Button type="submit" className="bg-destructive text-white hover:bg-destructive/90" disabled={deleting}>
								{deleting ? "Deleting..." : "Delete account"}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	)
}
