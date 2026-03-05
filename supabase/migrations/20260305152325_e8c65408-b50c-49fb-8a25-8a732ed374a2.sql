
-- Create wine type enum
CREATE TYPE public.wine_type AS ENUM ('red', 'white', 'champagne');

-- Create wines table
CREATE TABLE public.wines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  winery TEXT,
  region TEXT,
  country TEXT,
  vintage INTEGER,
  type wine_type NOT NULL DEFAULT 'red',
  grape_variety TEXT,
  notes TEXT,
  image_url TEXT,
  drink_from INTEGER,
  drink_until INTEGER,
  food_pairings TEXT[],
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wines ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own wines" ON public.wines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own wines" ON public.wines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own wines" ON public.wines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own wines" ON public.wines FOR DELETE USING (auth.uid() = user_id);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_wines_updated_at
  BEFORE UPDATE ON public.wines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
