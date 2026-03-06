
ALTER TABLE public.wines
  ADD COLUMN IF NOT EXISTS body integer CHECK (body >= 1 AND body <= 10),
  ADD COLUMN IF NOT EXISTS tannin integer CHECK (tannin >= 1 AND tannin <= 10),
  ADD COLUMN IF NOT EXISTS sweetness integer CHECK (sweetness >= 1 AND sweetness <= 10),
  ADD COLUMN IF NOT EXISTS acidity integer CHECK (acidity >= 1 AND acidity <= 10);

ALTER TABLE public.drunk_wines
  ADD COLUMN IF NOT EXISTS body integer CHECK (body >= 1 AND body <= 10),
  ADD COLUMN IF NOT EXISTS tannin integer CHECK (tannin >= 1 AND tannin <= 10),
  ADD COLUMN IF NOT EXISTS sweetness integer CHECK (sweetness >= 1 AND sweetness <= 10),
  ADD COLUMN IF NOT EXISTS acidity integer CHECK (acidity >= 1 AND acidity <= 10);
