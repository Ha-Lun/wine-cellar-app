
CREATE TABLE public.drunk_wines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  winery text,
  region text,
  country text,
  vintage integer,
  type public.wine_type NOT NULL DEFAULT 'red',
  grape_variety text,
  notes text,
  food_pairings text[],
  rating integer,
  image_url text,
  drink_from integer,
  drink_until integer,
  quantity integer NOT NULL DEFAULT 1,
  drunk_at timestamp with time zone NOT NULL DEFAULT now(),
  original_created_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.drunk_wines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own drunk wines" ON public.drunk_wines FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own drunk wines" ON public.drunk_wines FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own drunk wines" ON public.drunk_wines FOR DELETE TO authenticated USING (auth.uid() = user_id);
