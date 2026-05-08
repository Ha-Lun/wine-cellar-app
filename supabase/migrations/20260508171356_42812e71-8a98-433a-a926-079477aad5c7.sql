CREATE TYPE public.wishlist_priority AS ENUM ('low', 'medium', 'high');

CREATE TABLE public.wishlist_wines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  winery text,
  region text,
  country text,
  vintage integer,
  type wine_type NOT NULL DEFAULT 'red',
  grape_variety text,
  notes text,
  food_pairings text[],
  image_url text,
  drink_from integer,
  drink_until integer,
  vivino_rating numeric,
  priority public.wishlist_priority NOT NULL DEFAULT 'medium',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wishlist_wines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wishlist wines"
  ON public.wishlist_wines FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own wishlist wines"
  ON public.wishlist_wines FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own wishlist wines"
  ON public.wishlist_wines FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own wishlist wines"
  ON public.wishlist_wines FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_wishlist_wines_updated_at
  BEFORE UPDATE ON public.wishlist_wines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();