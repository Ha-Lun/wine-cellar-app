## Goal
Show a Systembolaget link on each wine. If the wine is found there, link directly to the product page; otherwise show "Not available at Systembolaget" with a link to https://www.systembolaget.se/.

## Approach
Reuse the existing **Firecrawl** connector. On wine add/scan, search Systembolaget and store either the product URL or a "not available" marker. Cached forever (no auto re-check).

## Steps

### 1. Database migration
Add two nullable columns to `wines`, `wishlist_wines`, and `drunk_wines`:
- `systembolaget_url text` — direct product link if found
- `systembolaget_checked_at timestamptz` — non-null means we've already looked it up (used to distinguish "not checked yet" from "checked, not available")

### 2. New edge function: `check-systembolaget`
- Input: `{ name, winery?, vintage? }`
- Calls Firecrawl `search` with `site:systembolaget.se/produkt {winery} {name} {vintage}`, limit 3.
- Filters results to URLs matching `https://www.systembolaget.se/produkt/...`.
- Returns `{ url: string | null, reason?: "no_credits" | "rate_limited" }`.
- JWT-protected, CORS, same 402/429 handling as the label-image function.

### 3. Wire into add flows
In `AddWineDialog` and `AddWishlistDialog`, after the existing `fetchLabelImage` background call, also call `checkSystembolaget` (in parallel). On success, update the row with `systembolaget_url` (may be null) and set `systembolaget_checked_at = now()`. Show the same credit-limit / rate-limit toast pattern.

Add a helper in `src/lib/wines.ts`: `checkSystembolaget(params)`.

### 4. Display
In `WineCard`, `WishlistCard`, and the Archive card, add a small link/badge under the rating row:
- If `systembolaget_url` set → link "Buy on Systembolaget ↗" (opens in new tab).
- Else if `systembolaget_checked_at` set → muted text "Not available · Systembolaget ↗" linking to https://www.systembolaget.se/.
- Else (not checked yet — old wines) → nothing, OR a small "Check Systembolaget" button that triggers the lookup on demand. Out of scope unless requested.

Use a small Systembolaget-yellow accent (`#FFD500`) for the available state, muted-foreground for unavailable.

## Technical notes
- Systembolaget product URL pattern: `https://www.systembolaget.se/produkt/{category}/{slug}/{article-id}` — any result containing `/produkt/` is treated as a hit.
- Search URL fallback: `https://www.systembolaget.se/sok/?q={encoded query}`.
- Cache forever per the user's choice; users can clear by removing/re-adding the wine.

## Out of scope
- Backfill for existing wines
- Price scraping
- Stock-level / store-availability check
- Periodic re-checks