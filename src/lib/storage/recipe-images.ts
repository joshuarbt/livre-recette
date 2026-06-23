import { createClient } from "@/lib/supabase/client";

export const RECIPE_IMAGES_BUCKET = "recipe-images";

export async function uploadRecipeImage(
  file: File,
  userId: string,
): Promise<{ url: string } | { error: string }> {
  const supabase = createClient();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(RECIPE_IMAGES_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    return { error: error.message };
  }

  const { data } = supabase.storage.from(RECIPE_IMAGES_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}
