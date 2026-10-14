"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

const PLAY_STORE = "https://play.google.com/store/apps/details?id=com.impressa.app"

// Invite links open the app directly once it's installed. These buttons cover everyone else:
// the app link for people who have it, the store for those who don't, and the code to type in by hand.
export function InviteActions({ deepLink, code }: { deepLink: string; code?: string }) {
  const [copied, setCopied] = useState(false)

  const copyCode = async () => {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button asChild size="lg" className="w-full bg-burgundy text-ivory hover:bg-burgundy/90">
        <a href={deepLink}>Open in the Impressa app</a>
      </Button>
      <Button asChild variant="outline" size="lg" className="w-full border-navy text-navy hover:bg-navy hover:text-ivory">
        <a href={PLAY_STORE} target="_blank" rel="noreferrer">
          Get the app on Google Play
        </a>
      </Button>
      <p className="text-xs text-navy/60">On iPhone, search for Impressa in the App Store.</p>
      {code ? (
        <p className="text-sm text-navy/70">
          Invite code:{" "}
          <button type="button" onClick={copyCode} className="font-mono font-medium text-navy underline underline-offset-2">
            {code}
          </button>
          {copied ? <span className="ml-2 text-emerald-700">Copied</span> : null}
        </p>
      ) : null}
    </div>
  )
}
