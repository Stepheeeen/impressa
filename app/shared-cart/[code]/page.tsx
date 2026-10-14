import Link from "next/link"
import { ShoppingBag, Users, Wallet } from "lucide-react"
import { InviteActions } from "@/components/invite-actions"

export const metadata = { title: "Shared cart invite - Impressa" }

// Shared carts are private to their members, so this page shows no cart details:
// it gets people into the app, where joining is a tap.
export default async function SharedCartInvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params

  return (
    <div className="container max-w-xl py-16">
      <h1 className="text-3xl font-light tracking-wide text-navy">You&apos;ve been invited to a shared cart</h1>
      <p className="mt-2 mb-8 text-navy/70">
        Shop together in one cart on Impressa, then choose how to pay for it.
      </p>

      <ul className="mb-8 space-y-4">
        <Step icon={<Users className="h-5 w-5" aria-hidden="true" />} title="Add things together">
          Everyone in the cart can add items and change what&apos;s in it.
        </Step>
        <Step icon={<Wallet className="h-5 w-5" aria-hidden="true" />} title="Pay your way">
          The cart owner picks: one person pays, everyone pays for their own items, or the total is split evenly.
        </Step>
        <Step icon={<ShoppingBag className="h-5 w-5" aria-hidden="true" />} title="One delivery">
          The order is placed once everyone has paid their share.
        </Step>
      </ul>

      <InviteActions deepLink={`impressa://shared-cart/${code}`} code={code} />

      <p className="mt-6 text-sm leading-relaxed text-navy/60">
        Already have the app? Open Account, then Shared carts, and enter the code above.
      </p>
      <Link href="/products" className="mt-6 inline-block text-sm text-burgundy hover:underline">
        Or keep shopping on the website
      </Link>
    </div>
  )
}

function Step({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 text-burgundy">{icon}</span>
      <span>
        <strong className="block font-medium text-navy">{title}</strong>
        <span className="text-sm text-navy/70">{children}</span>
      </span>
    </li>
  )
}
