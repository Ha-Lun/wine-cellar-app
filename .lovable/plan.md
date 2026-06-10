# Improve Scan Label UX

Two visual additions to the Scan tab in `src/components/AddWineDialog.tsx`:

## 1. Label framing guide (before capture)

When no photo has been taken yet, replace the current "Take Photo / Upload" placeholder with a clearer framing visual:

- A tall, rounded rectangle outline (roughly wine-label aspect ratio, e.g. ~3:4) centered in the dashed area.
- Decorative corner brackets at the 4 corners of the outline (like a camera viewfinder) to suggest "fit your label here".
- Centered helper text inside the frame: **"Fit the wine label inside this frame"** with a smaller subline **"Make sure the name and vintage are readable"**.
- Keep the existing **Take Photo** and **Upload** buttons directly below the frame.

This is a static guide rendered in the dialog (not a live camera overlay — Capacitor's camera UI is native and can't be customized from here). It teaches the user how to frame the shot before they tap Take Photo.

## 2. Clearer loading state (during scan + enrichment)

Today, while `scanning` is true, a spinner overlays the preview with text "Analyzing label with AI…". Improve it:

- Keep the overlay, but show a multi-step status:
  1. "Reading the label…" (during `scanWineLabel`)
  2. "Looking up wine details…" (shown briefly after OCR completes, while form is being populated)
- Use a larger spinner + small animated dots, and disable the Retake/Upload buttons while loading (they're already hidden — keep that).
- Apply the same overlay treatment if the user kicks off "Check Rating" from the scan flow? No — out of scope; only the scan/auto-fill phase.

State change: add a small `scanStage` state (`"reading" | "enriching" | null`) controlled inside `processImageBase64` to swap the message. No new network calls.

## Technical notes

- File touched: `src/components/AddWineDialog.tsx` only.
- Frame guide is pure Tailwind/JSX (no new deps); corner brackets via 4 absolutely-positioned `div`s with 2-sided borders.
- Loading overlay reuses the existing `Loader2` from lucide-react.
- No changes to scan logic, edge functions, or data model.

```text
┌─ Scan tab ─────────────────────────┐
│  ╭───────────────────────╮         │
│  │ ┌                   ┐ │         │
│  │                       │         │
│  │   Fit the wine label  │         │
│  │   inside this frame   │         │
│  │                       │         │
│  │ └                   ┘ │         │
│  ╰───────────────────────╯         │
│      [Take Photo] [Upload]         │
└────────────────────────────────────┘
```
