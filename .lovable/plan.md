
## Goal

Remove the Vivino rating feature entirely — no more edge function, no more AI guessing, no more UI surface.

## Changes

### Backend
- Delete edge function `supabase/functions/get-vivino-rating/` (source folder).
- Undeploy `get-vivino-rating` from Lovable Cloud so it stops serving.
- Keep the `vivino_rating` DB columns on `wines`, `drunk_wines`, `wishlist_wines` as-is (non-destructive; existing values stay, no migration). New wines simply won't populate it.

### Client
- `src/lib/wines.ts`: remove `getVivinoRating()`.
- `src/components/WineFilters.tsx`: remove the "Vivino Rating" slider and `minVivinoRating` from the filter state / active count / clear.
- Any component that displays or fetches the Vivino rating (e.g. `WineCard`, `AddWineDialog`, `EditWineDialog`, `WineRatingDialog`, `WishlistCard`, `ScanWineLabel` flow) — remove the display badge/star and any call to `getVivinoRating`. I'll grep for `vivino_rating` and `getVivinoRating` and strip each usage. DB writes that set `vivino_rating` are dropped; reads are simply not rendered.
- `src/types/wine.ts`: remove `vivino_rating` from `WineScanResult`.
- `supabase/functions/scan-wine-label/index.ts`: if the prompt/schema asks for `vivino_rating`, remove that field.

### Out of scope
- No DB schema migration (columns left in place, safe to drop later if desired).
- `scan-wine-label` model choice unchanged.
- No changes to unrelated filters or ratings (user's own 1–5 star `rating` stays).
