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

export async function scanWineLabel(imageBase64: string) {
  const { data, error } = await supabase.functions.invoke("scan-wine-label", {
    body: { image: imageBase64 },
  });
  if (error) throw error;
  return data;
}
