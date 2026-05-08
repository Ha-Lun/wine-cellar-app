import { Database } from "@/integrations/supabase/types";

export type Wine = Database["public"]["Tables"]["wines"]["Row"];
export type WineInsert = Database["public"]["Tables"]["wines"]["Insert"];
export type WineType = Database["public"]["Enums"]["wine_type"];

export type WishlistWine = Database["public"]["Tables"]["wishlist_wines"]["Row"];
export type WishlistWineInsert = Database["public"]["Tables"]["wishlist_wines"]["Insert"];
export type WishlistPriority = Database["public"]["Enums"]["wishlist_priority"];

export interface WineScanResult {
  name: string;
  winery?: string;
  region?: string;
  country?: string;
  vintage?: number;
  type: WineType;
  grape_variety?: string;
  drink_from?: number;
  drink_until?: number;
  food_pairings?: string[];
  vivino_rating?: number;
}
