-- Add vivino_rating to wines table
ALTER TABLE public.wines
ADD COLUMN vivino_rating numeric(3,1) NULL;

-- Add vivino_rating to drunk_wines table
ALTER TABLE public.drunk_wines
ADD COLUMN vivino_rating numeric(3,1) NULL;
