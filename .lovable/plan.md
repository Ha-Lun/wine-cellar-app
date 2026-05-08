## Goal
Fetch a higher-quality wine label image from the web (instead of relying on the user's scan photo) and store it as a separate field on each wine across cellar, wishlist, and archive.

## Approach
Use the **Firecrawl** connector to search the web (Vivino results in particular) for the wine's official label image. Run automatically when a wine is added or scanned. The user's scan photo stays untouched; the new image is shown by default with a fallback to the scan if no result is found.

## Steps

### 1. Connect Firecrawl
- Use the Firecrawl connector (set up via `standard_connectors--connect`) — `FIRECRAWL_API_KEY` becomes available to edge functions.

### 2. Database migration
Add a nullable `label_image_url text` column to:
- `wines`
- `wishlist_wines`
- `drunk_wines`

(Keep existing `image_url` for the user's scan photo.)

### 3. New edge function: `fetch-label-image`
- Input: `{ name, winery?, vintage? }`
- Calls Firecrawl `search` (`site:vivino.com` + wine name/winery/vintage), requesting screenshot/branding or parsing the result page for the bottle image URL.
- Returns `{ image_url: string | null }`.
- JWT-protected, CORS, 402/429 handling.

### 4. Wire into add flows
After a successful insert in:
- `AddWineDialog` (cellar)
- `AddWishlistDialog` (wishlist)

Trigger `fetch-label-image` in the background; on success update the row's `label_image_url`. Non-blocking — the wine is saved immediately even if fetching fails.

### 5. Display
- `WineCard`, `WishlistCard`, archive card: prefer `label_image_url`, fall back to `image_url`, then to the existing placeholder.
- Add a small "Refresh image" action in the edit dialogs to retry manually.

### 6. Backfill (optional)
A one-shot button in settings (or just leave existing wines as-is) to fetch label images for wines that don't have one yet. Out of scope unless requested.

## Technical notes
- Firecrawl search with `scrapeOptions.formats: ['html']` + `site:vivino.com {wine}` → parse the first `og:image` or product image meta tag.
- Store the remote URL directly (no Supabase Storage upload needed) — Vivino image CDN URLs are stable.
- Failure modes: Firecrawl 402 (no credits) → return null silently; UI keeps fallback image.

## Out of scope
- Re-uploading/hosting images on Supabase Storage
- Bulk backfill UI
- Image moderation/cropping