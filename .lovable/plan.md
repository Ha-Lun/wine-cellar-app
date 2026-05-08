## Problem

The current `get-vivino-rating` edge function scrapes vivino.com directly (and falls back to DuckDuckGo HTML search). Both routes are unreliable:
- Vivino is behind Cloudflare bot protection — the Googlebot UA trick fails most of the time.
- The DuckDuckGo HTML endpoint frequently returns no usable snippet, and the regex is brittle.
- Result: users almost always get "Could not find a Vivino rating".

## Solution

Replace the scraping logic with a call to the **Lovable AI Gateway** (free during the promo window, fast, no API key needed beyond the auto-provisioned `LOVABLE_API_KEY`). Ask the model to return its best estimate of the wine's Vivino rating as strict JSON.

This is not a live scrape of vivino.com, but it gives a realistic rating estimate based on the model's training data — which is what users actually want from the "Check Rating" button. We'll be transparent in the UI label.

## Changes

### 1. `supabase/functions/get-vivino-rating/index.ts`
- Remove all Vivino + DuckDuckGo fetch code.
- Keep JWT auth check + CORS.
- Validate `query` input.
- Call `https://ai.gateway.lovable.dev/v1/chat/completions` with:
  - Model: `google/gemini-2.5-flash` (fast + cheap + free in promo).
  - System prompt: "You are a wine rating expert. Given a wine name and vintage, return its approximate Vivino community rating (0.0–5.0)."
  - `response_format: { type: "json_object" }` so we get `{ "rating": 4.2 }` reliably.
- Handle 429 (rate limit) → 429 response with friendly message.
- Handle 402 (credits exhausted) → 402 response.
- Return `{ rating: number | null }` matching the existing client contract.

### 2. `src/components/AddWineDialog.tsx` (minor)
- Update the label "Vivino Rating" → "Estimated Rating" (or keep "Vivino Rating" with a tooltip — see question below) so users understand it's an AI estimate, not a scrape.

### 3. No DB / RLS / types changes needed.

## Verification

1. Deploy edge function (automatic).
2. Use `supabase--curl_edge_functions` to POST `{ "query": "Château Margaux 2015" }` and confirm a sensible numeric rating comes back.
3. Check `supabase--edge_function_logs` for any errors.
4. Try in the UI from the Add Wine dialog.

## Question for you

Before I implement, one decision:
