## Goal

When scanning a wine label (in both Add Wine and Add to Wishlist dialogs), show the captured/uploaded photo inside the "Take Photo / Upload" box so testers can clearly see that the image was received and is being analyzed.

## Behavior

1. **Idle** (no image yet): show the current placeholder with the camera + upload icons and the two buttons. No change.
2. **Image captured** (right after camera/upload returns, while AI is scanning):
   - Replace the placeholder content with a preview of the actual captured image, centered and contained inside the box (max height ~240px).
   - Overlay a semi-transparent layer with a spinner and the text "Analyzing label with AI..." so it's obvious the scan is in progress.
3. **Scan finished successfully**: keep the image visible in the box (without the overlay) so the user sees which photo populated the form. Add a small "Retake / Upload again" button row underneath.
4. **Scan failed**: keep the image visible with a small error message and the Retake / Upload again buttons, so the user can try a different photo.
5. **Dialog closed or form reset**: clear the preview so the next open starts fresh.

## Technical details

Files to change:
- `src/components/AddWineDialog.tsx`
- `src/components/AddWishlistDialog.tsx`

Changes in each dialog:
- Add `previewImage: string | null` state holding the data URL of the latest captured/uploaded photo.
- In `processImageBase64`, set `previewImage` to the data URL before calling `scanWineLabel`, so the preview appears immediately when scanning starts.
- Reset `previewImage` to `null` inside `resetForm()` and when the dialog `onOpenChange` closes.
- Replace the contents of the dashed scan box with conditional rendering:
  - If `previewImage` is null → current placeholder (icons + Take Photo / Upload buttons).
  - If `previewImage` is set → render `<img src={previewImage}>` with `object-contain`, centered, max-height ~240px, rounded; if `scanning` is true, render an absolute-positioned overlay (`bg-background/70 backdrop-blur-sm`) with the spinner + "Analyzing label with AI..." text. Below the image, show a small row with "Retake Photo" and "Upload Different" buttons that call the existing `takePhoto` / `uploadPhoto` handlers.
- Keep all existing scan logic, toasts, and form-population behavior unchanged.

No backend, schema, or business-logic changes. Purely a UI/UX clarity improvement that works the same on web and the Android Capacitor build (uses the existing `Camera.getPhoto` base64 result).