"use client"

import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function FeatureComingSoon() {
  const router = useRouter()
  return (
    <div className="flex items-center justify-center py-20">
      <Card className="max-w-md text-center border-warmgray/30 shadow-sm">
        <CardContent className="space-y-6 p-10">
          <Sparkles className="mx-auto h-12 w-12 text-rosegold" />

          <h2 className="text-2xl font-light text-navy">This Feature Is Coming Soon</h2>

          <p className="text-navy/70 leading-relaxed text-sm">
            Our design engineers are putting the final touches on the custom design studio.
            You’ll soon be able to personalize colors, fabrics, styles and more — all in real time.
          </p>

          <Button className="bg-burgundy text-ivory hover:bg-burgundy/90" onClick={() => router.push('/products')}>
            Got it
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
