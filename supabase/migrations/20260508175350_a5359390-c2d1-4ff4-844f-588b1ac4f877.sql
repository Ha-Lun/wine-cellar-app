ALTER TABLE public.wines ADD COLUMN systembolaget_url text, ADD COLUMN systembolaget_checked_at timestamptz;
ALTER TABLE public.wishlist_wines ADD COLUMN systembolaget_url text, ADD COLUMN systembolaget_checked_at timestamptz;
ALTER TABLE public.drunk_wines ADD COLUMN systembolaget_url text, ADD COLUMN systembolaget_checked_at timestamptz;