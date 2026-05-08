import { supabase } from "@/integrations/supabase/client";
import { WishlistWineInsert } from "@/types/wine";

export async function fetchWishlist() {
  const { data, error } = await supabase
    .from("wishlist_wines")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function addWishlistWine(wine: WishlistWineInsert) {
  const { data, error } = await supabase
    .from("wishlist_wines")
    .insert(wine)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateWishlistWine(id: string, updates: Partial<WishlistWineInsert>) {
  const { data, error } = await supabase
    .from("wishlist_wines")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteWishlistWine(id: string) {
  const { error } = await supabase.from("wishlist_wines").delete().eq("id", id);
  if (error) throw error;
}

export async function moveWishlistToCellar(id: string) {
  const { data: wine, error: fetchError } = await supabase
    .from("wishlist_wines")
    .select("*")
    .eq("id", id)
    .single();
  if (fetchError) throw fetchError;

  const { error: insertError } = await supabase.from("wines").insert({
    user_id: wine.user_id,
    name: wine.name,
    winery: wine.winery,
    region: wine.region,
    country: wine.country,
    vintage: wine.vintage,
    type: wine.type,
    grape_variety: wine.grape_variety,
    notes: wine.notes,
    food_pairings: wine.food_pairings,
    image_url: wine.image_url,
    label_image_url: wine.label_image_url,
    drink_from: wine.drink_from,
    drink_until: wine.drink_until,
    vivino_rating: wine.vivino_rating,
    quantity: 1,
  });
  if (insertError) throw insertError;

  const { error: deleteError } = await supabase
    .from("wishlist_wines")
    .delete()
    .eq("id", id);
  if (deleteError) throw deleteError;
}
