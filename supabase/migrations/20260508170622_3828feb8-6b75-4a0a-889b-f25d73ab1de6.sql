ALTER TABLE public.wines ADD COLUMN IF NOT EXISTS vivino_rating numeric;
ALTER TABLE public.drunk_wines ADD COLUMN IF NOT EXISTS vivino_rating numeric;