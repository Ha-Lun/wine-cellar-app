## Goal

Switch `scan-wine-label` from direct Google Gemini API to the **Lovable AI Gateway** so the entire app uses one unified AI provider (free in promo, no `GEMINI_API_KEY` needed).

## Changes

### `supabase/functions/scan-wine-label/index.ts`
- Replace endpoint `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions` → `https://ai.gateway.lovable.dev/v1/chat/completions`.
- Replace secret `GEMINI_API_KEY` → auto-provisioned `LOVABLE_API_KEY`.
- Update model id `gemini-3-flash-preview` → `google/gemini-2.5-flash` (Lovable Gateway naming, supports vision + tool-calling).
- Keep everything else identical: JWT auth check, image input, tool-calling for structured `wine_data` output, drinking-window prompt, 429/402 handling.

### Cleanup
- The `GEMINI_API_KEY` secret becomes unused. I'll leave it in place (harmless); you can delete it later in Cloud settings if you want.

## Verification

1. Auto-deploy edge function.
2. Test with `curl_edge_functions` using a small base64 test payload to confirm 200 + tool-call structure.
3. Confirm via the Add Wine → Scan Label flow in the UI.

## Notes

- No DB / RLS / frontend changes.
- Same response shape as today, so `AddWineDialog.tsx` works unchanged.
