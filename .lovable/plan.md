## Goal

Let users decide where a wine goes (Cellar or Wishlist) when adding/scanning, and let them move existing entries either direction.

## Changes

### 1. Destination selector in add dialogs
Add a "Destination" toggle (Cellar / Wishlist) at the top of both add dialogs, above the Scan/Manual tabs. The selected destination drives which table the wine is saved to and which extra field shows up.

- **`src/components/AddWineDialog.tsx`** (entry point from Cellar page, default = Cellar):
  - New `destination` state, default `"cellar"`.
  - When `"wishlist"` is selected: hide Quantity, show Priority dropdown (Low / Medium / High); submit button label becomes "Add to Wishlist"; dialog title becomes "Add to Wishlist".
  - `handleSubmit` branches: if `destination === "wishlist"`, call `addWishlistWine` + `updateWishlistWine` for background label/Systembolaget enrichment; otherwise current cellar path.

- **`src/components/AddWishlistDialog.tsx`** (entry point from Wishlist page, default = Wishlist):
  - Mirror change: destination toggle (default `"wishlist"`), show Quantity when Cellar is picked, hide Priority. Submit/title labels switch accordingly.
  - Branch to `addWine` when Cellar is chosen.

Scan flow stays identical — the scanned data populates the same shared form; only the save destination differs.

### 2. Move existing cellar wine → wishlist
- **`src/lib/wines.ts`**: new `moveCellarToWishlist(wineId)`. Reads the wine, inserts a row into `wishlist_wines` (mapping shared columns, default `priority = "medium"`), then deletes the cellar row (or decrements quantity if `quantity > 1`, matching the drunk-wines pattern).
- **`src/components/WineCard.tsx`**: add a Heart icon button in the action row with `title="Move to wishlist"`, calling a new `onMoveToWishlist` prop.
- **`src/pages/Index.tsx`**: implement the handler — call `moveCellarToWishlist`, toast, refresh.

### 3. Wishlist → Cellar (already exists)
`moveWishlistToCellar` and the "Got it" button on `WishlistCard` already cover this direction. No change needed.

## Technical notes

- No DB schema changes; both tables already have matching shared columns.
- The destination toggle is a simple shadcn `Tabs` or segmented `ToggleGroup` rendered before the existing Scan/Manual tabs — keeps the scan UX (preview box, etc.) untouched.
- Background enrichment (`fetchLabelImage`, `checkSystembolaget`) runs for both destinations using the matching update function.
