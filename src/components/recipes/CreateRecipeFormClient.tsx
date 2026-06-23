"use client";

import { useState, useTransition } from "react";
import { CreateRecipeForm } from "@/components/recipes/CreateRecipeForm";
import { createRecipeFull } from "@/lib/recipes/actions";
import { uploadRecipeImage } from "@/lib/storage/recipe-images";
import type { CreateRecipeFormErrors, CreateRecipeFormValues, CreateRecipePayload } from "@/types/recipes";

type CreateRecipeFormClientProps = {
  userId: string;
};

export function CreateRecipeFormClient({ userId }: CreateRecipeFormClientProps) {
  const [serverErrors, setServerErrors] = useState<CreateRecipeFormErrors>({});
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(payload: CreateRecipePayload, values: CreateRecipeFormValues) {
    setServerErrors({});

    let imageUrl = payload.imageUrl;

    if (values.imageMode === "file") {
      if (!values.imageFile) {
        setServerErrors({ imageUrl: "Sélectionnez une image à téléverser." });
        return;
      }

      const uploadResult = await uploadRecipeImage(values.imageFile, userId);
      if ("error" in uploadResult) {
        setServerErrors({ imageUrl: uploadResult.error });
        return;
      }
      imageUrl = uploadResult.url;
    }

    startTransition(async () => {
      const result = await createRecipeFull({ ...payload, imageUrl });
      if (!result.success) {
        setServerErrors(result.errors);
      }
    });
  }

  return (
    <div>
      <CreateRecipeForm
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />
    </div>
  );
}
