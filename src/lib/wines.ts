import { supabase } from "@/integrations/supabase/client";
import { WineInsert } from "@/types/wine";

export async function fetchWines() {
  const { data, error } = await supabase
    .from("wines")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function addWine(wine: WineInsert) {
  const { data, error } = await supabase
    .from("wines")
    .insert(wine)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateWine(id: string, updates: Partial<WineInsert>) {
  const { data, error } = await supabase
    .from("wines")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteWine(id: string) {
  const { error } = await supabase.from("wines").delete().eq("id", id);
  if (error) throw error;
}

export async function markWineAsDrunk(wineId: string) {
  // Fetch the wine first
  const { data: wine, error: fetchError } = await supabase
    .from("wines")
    .select("*")
    .eq("id", wineId)
    .single();
  if (fetchError) throw fetchError;

  // Insert into drunk_wines archive
  const { error: insertError } = await supabase
    .from("drunk_wines")
    .insert({
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
      rating: wine.rating,
      image_url: wine.image_url,
      drink_from: wine.drink_from,
      drink_until: wine.drink_until,
      quantity: 1,
      original_created_at: wine.created_at,
    });
  if (insertError) throw insertError;

  // If quantity > 1, decrement; otherwise delete
  if (wine.quantity > 1) {
    const { error: updateError } = await supabase
      .from("wines")
      .update({ quantity: wine.quantity - 1 })
      .eq("id", wineId);
    if (updateError) throw updateError;
  } else {
    const { error: deleteError } = await supabase
      .from("wines")
      .delete()
      .eq("id", wineId);
    if (deleteError) throw deleteError;
  }
}

export async function fetchDrunkWines() {
  const { data, error } = await supabase
    .from("drunk_wines")
    .select("*")
    .order("drunk_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function scanWineLabel(imageBase64: string) {
  const { data, error } = await supabase.functions.invoke("scan-wine-label", {
    body: { image: imageBase64 },
  });
  if (error) throw error;
  return data;
}
