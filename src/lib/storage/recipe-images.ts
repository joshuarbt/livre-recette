import { createClient } from "@/lib/supabase/client";

export const RECIPE_IMAGES_BUCKET = "recipe-images";

function getExtension(file: File): string {
  if (file.type === "image/webp") {
    return "webp";
  }

  return file.name.split(".").pop()?.toLowerCase() || "jpg";
}

export function getRecipeImagePathFromUrl(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    const marker = `/storage/v1/object/public/${RECIPE_IMAGES_BUCKET}/`;
    const index = url.pathname.indexOf(marker);

    if (index === -1) {
      return null;
    }

    return decodeURIComponent(url.pathname.slice(index + marker.length));
  } catch {
    return null;
  }
}

export async function uploadRecipeImage(
  file: File,
  userId: string,
): Promise<{ url: string } | { error: string }> {
  const supabase = createClient();
  const extension = getExtension(file);
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(RECIPE_IMAGES_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });

  if (error) {
    return { error: error.message };
  }

  const { data } = supabase.storage.from(RECIPE_IMAGES_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}

export async function deleteRecipeImageByUrl(
  imageUrl: string,
): Promise<{ success: true } | { error: string }> {
  const path = getRecipeImagePathFromUrl(imageUrl);
  if (!path) {
    return { success: true };
  }

  const supabase = createClient();
  const { error } = await supabase.storage.from(RECIPE_IMAGES_BUCKET).remove([path]);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
