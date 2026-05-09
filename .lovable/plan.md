## 1. Center wine label images & make them clickable

Currently the label thumbnails use `object-cover`, which crops the image to fill the box. This often cuts off parts of the label and makes it look off-center.

**Change in `WineCard.tsx`, `WishlistCard.tsx`, and `Archive.tsx`:**
- Switch the thumbnail from `object-cover` to `object-contain` with `bg-muted` and centered alignment, so the entire label fits inside the box and is visually centered.
- Wrap the `<img>` in a `<button>` that opens a `Dialog` showing the full-size image.
- Dialog content: large centered image (max ~90vh), tap outside / close button to dismiss.

A small reusable `LabelImage` component (e.g. `src/components/LabelImage.tsx`) will hold the thumbnail + dialog logic so all three card surfaces share the same behavior.

## 2. Show/hide password on login screen

In `src/components/AuthForm.tsx`:
- Add a small eye icon button (lucide `Eye` / `EyeOff`) inside the password input on both the Sign In and Sign Up tabs.
- Toggle the input's `type` between `password` and `text` on click.
- Use a single local state `showPassword` shared by both tabs.
- Keep mobile-friendly tap target (≥36px) and 16px font for inputs (per project mobile rules).

## Files affected

- `src/components/LabelImage.tsx` (new, shared thumbnail + lightbox)
- `src/components/WineCard.tsx`
- `src/components/WishlistCard.tsx`
- `src/pages/Archive.tsx`
- `src/components/AuthForm.tsx`

No backend, schema, or auth-logic changes.
