## Goal

Add a **Wishlist** page where you can save wines you don't own yet but want to buy — using the same scan-label flow as the cellar.

## Database

New table `public.wishlist_wines` mirroring `wines` (minus quantity/drink-tracking fields that don't apply yet):
- `id`, `user_id`, `created_at`, `updated_at`
- `name`, `winery`, `region`, `country`, `vintage`, `type` (wine_type), `grape_variety`
- `notes`, `food_pairings`, `image_url`
- `drink_from`, `drink_until`
- `vivino_rating`, `priority` (low/medium/high, default medium)

RLS: each user can view/insert/update/delete only their own rows (same pattern as `wines`).

## Backend

No new edge function — the wishlist reuses `scan-wine-label` and `get-vivino-rating`.

New helpers in `src/lib/wines.ts` (or a new `src/lib/wishlist.ts`):
- `fetchWishlist()`
- `addWishlistWine(wine)`
- `updateWishlistWine(id, updates)`
- `deleteWishlistWine(id)`
- `moveWishlistToCellar(id)` → inserts row into `wines` (quantity 1), deletes from wishlist

## Frontend

### New page `src/pages/Wishlist.tsx`
- Same layout/style as `Index.tsx`: sticky header (with safe-area padding), filter bar by wine type, country grouping, framer-motion entry.
- Empty state with a "Scan a wine you want" CTA.
- Each card shows the wine info + actions:
  - **Move to Cellar** (green primary) → calls `moveWishlistToCellar`
  - **Edit** (reuse a small edit dialog or the existing pattern)
  - **Remove**

### New component `src/components/AddWishlistDialog.tsx`
- Copy of `AddWineDialog` with quantity removed and a `priority` select added.
- Same Scan / Manual tabs, same Vivino rating button.

### New types
- `WishlistWine`, `WishlistWineInsert` in `src/types/wine.ts` (auto-generated from Supabase types after migration).

### Routing & nav
- Add `<Route path="/wishlist" element={<Wishlist />} />` in `src/App.tsx`.
- Add a Wishlist link/icon (Heart or BookmarkPlus) in the top nav of `Index.tsx`, `Archive.tsx`, and the new `Wishlist.tsx` so users can move between Cellar / Wishlist / Archive.

### Reusable card
- Either extend `WineCard` with a `variant: "cellar" | "wishlist"` prop, or create `WishlistCard.tsx` that mirrors `WineCard` but swaps the action buttons. I'll go with a separate `WishlistCard` to keep `WineCard` clean.

## Verification

1. Run migration → confirm new table + RLS.
2. Add a wine via scan and via manual entry on `/wishlist`.
3. Move one to cellar → verify it appears in `/` and disappears from wishlist.
4. Delete one → verify removal.
5. Confirm logged-out users can't see the page (auth gate same as Index).

## Out of scope (can do later)

- Sharing wishlist with friends
- Price tracking / store links
- Notifications when a wine becomes drinkable
