import type { SupabaseClient } from "@supabase/supabase-js";

export async function findOrCreateIngredient(
  supabase: SupabaseClient,
  userId: string,
  name: string,
  unit: string,
): Promise<string> {
  const { data: existing, error: existingError } = await supabase
    .from("ingredients")
    .select("id")
    .eq("user_id", userId)
    .eq("name", name)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing) {
    return existing.id;
  }

  const { data, error } = await supabase
    .from("ingredients")
    .insert({ user_id: userId, name, unit })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: retry, error: retryError } = await supabase
        .from("ingredients")
        .select("id")
        .eq("user_id", userId)
        .eq("name", name)
        .single();

      if (retryError || !retry) {
        throw new Error("Impossible de créer l'ingrédient.");
      }

      return retry.id;
    }

    throw new Error(error.message);
  }

  return data.id;
}
