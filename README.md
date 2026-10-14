# Impressa website

The Impressa storefront: browsing, cart, checkout, orders, account and the support chat.
Next.js 15 (App Router) with Tailwind.

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm start       # serve the production build
```

## Settings

Create `.env.local` (git ignores it):

| Name | What it does |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the Impressa API, including `/api`. Leave unset to use the Render address the site ships with. |

Anything named `NEXT_PUBLIC_…` is visible to everyone who opens the site, so never put a secret here.
Emails, payments and the support assistant all run on the API, which keeps those keys.

## Invite links

`/group-buy/<code>` and `/shared-cart/<code>` are the pages shared from the app. They open the app when
it's installed, and otherwise explain the invite and link to the store.

Opening the app automatically needs two files in `public/.well-known/`, both of which still hold
placeholders:

- `apple-app-site-association` — replace `REPLACE_WITH_APPLE_TEAM_ID` with the Apple Developer Team ID.
- `assetlinks.json` — replace `REPLACE_WITH_PLAY_APP_SIGNING_SHA256_FINGERPRINT` with the SHA-256
  fingerprint from Play Console (Play app signing), or `eas credentials`.

Both must be served from the same domain the app lists, `impressaenterprise.com`.
