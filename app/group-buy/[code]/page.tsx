import Link from "next/link"
import { Users, Clock, Smartphone } from "lucide-react"
import { apiUrl } from "@/constants/apiUrl"
import { InviteActions } from "@/components/invite-actions"

type Tier = { minQuantity: number; price: number }

type GroupBuy = {
  code: string
  title: string
  imageUrl: string | null
  status: "open" | "closing" | "closed"
  expiresAt: string
  normalPrice: number
  tiers: Tier[]
  quantity: number
  buyers: number
  currentPrice: number
  nextTier: { minQuantity: number; price: number; quantityNeeded: number } | null
}

export const metadata = { title: "Group buy - Impressa" }

const naira = (value: number) => `₦${Number(value).toLocaleString("en-NG")}`

const lagosTime = (iso: string) =>
  new Date(iso).toLocaleString("en-NG", { timeZone: "Africa/Lagos", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })

async function getGroupBuy(code: string) {
  try {
    const res = await fetch(`${apiUrl}/group-buys/${encodeURIComponent(code)}`, { cache: "no-store" })
    if (res.status === 404) return "missing" as const
    if (!res.ok) return "unavailable" as const
    return (await res.json()) as GroupBuy
  } catch {
    return "unavailable" as const
  }
}

export default async function GroupBuyInvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const group = await getGroupBuy(code)

  if (group === "missing") {
    return (
      <InvitePage title="This group buy has ended" intro="The link may be old, or the group has already closed. Open the app to find group prices on other products.">
        <InviteActions deepLink="impressa://shop" />
      </InvitePage>
    )
  }

  if (group === "unavailable") {
    return (
      <InvitePage title="You've been invited to a group buy" intro="We couldn't load the details just now, but the invite still works in the app.">
        <InviteActions deepLink={`impressa://group-buy/${code}`} code={code} />
      </InvitePage>
    )
  }

  const open = group.status === "open"

  return (
    <InvitePage
      title={open ? "Buy together, pay less" : "This group buy has ended"}
      intro={`${group.title} on Impressa`}
      imageUrl={group.imageUrl}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-navy/70">
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4" aria-hidden="true" />
            {group.quantity} bought by {group.buyers} {group.buyers === 1 ? "person" : "people"}
          </span>
          {open ? (
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" aria-hidden="true" />
              Ends {lagosTime(group.expiresAt)}
            </span>
          ) : null}
        </div>

        {open && group.nextTier ? (
          <p className="text-lg font-light text-navy">
            {group.nextTier.quantityNeeded} more to unlock <strong className="font-medium">{naira(group.nextTier.price)}</strong> each
          </p>
        ) : null}

        <ul className="divide-y divide-warmgray rounded-lg border border-warmgray bg-white">
          <PriceRow label="Normal price" price={group.normalPrice} active={group.currentPrice === group.normalPrice} />
          {group.tiers.map((tier) => (
            <PriceRow
              key={tier.minQuantity}
              label={`${tier.minQuantity} or more bought`}
              price={tier.price}
              active={group.currentPrice === tier.price}
            />
          ))}
        </ul>

        <p className="text-sm leading-relaxed text-navy/70">
          Everyone pays the normal price now. When the group ends, the difference to the group price it reached goes to each
          buyer&apos;s Impressa wallet. If no group price is reached, orders go ahead at the normal price.
        </p>

        {open ? <InviteActions deepLink={`impressa://group-buy/${group.code}`} code={group.code} /> : null}
      </div>
    </InvitePage>
  )
}

function PriceRow({ label, price, active }: { label: string; price: number; active: boolean }) {
  return (
    <li className={`flex items-center justify-between px-4 py-3 ${active ? "bg-navy text-ivory" : "text-navy"}`}>
      <span className="text-sm font-light">{label}</span>
      <span className="text-sm font-medium tabular-nums">{naira(price)} each</span>
    </li>
  )
}

function InvitePage({
  title,
  intro,
  imageUrl,
  children,
}: {
  title: string
  intro: string
  imageUrl?: string | null
  children: React.ReactNode
}) {
  return (
    <div className="container max-w-xl py-16">
      {imageUrl ? (
        // The API returns Cloudinary URLs; next/image optimisation is off for this project.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="mb-6 h-56 w-full rounded-lg object-cover" />
      ) : null}
      <h1 className="text-3xl font-light tracking-wide text-navy">{title}</h1>
      <p className="mt-2 mb-8 text-navy/70">{intro}</p>
      {children}
      <p className="mt-10 flex items-center gap-2 text-xs text-navy/50">
        <Smartphone className="h-4 w-4" aria-hidden="true" />
        Group buys happen in the Impressa app.
      </p>
      <Link href="/products" className="mt-2 inline-block text-sm text-burgundy hover:underline">
        Or keep shopping on the website
      </Link>
    </div>
  )
}
