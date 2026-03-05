import { Database } from "@/integrations/supabase/types";

export type Wine = Database["public"]["Tables"]["wines"]["Row"];
export type WineInsert = Database["public"]["Tables"]["wines"]["Insert"];
export type WineType = Database["public"]["Enums"]["wine_type"];

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
}
