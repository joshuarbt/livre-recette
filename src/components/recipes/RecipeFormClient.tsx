"use client";

import { useMemo, useState, useTransition } from "react";
import { CreateRecipeForm } from "@/components/recipes/CreateRecipeForm";
import { createRecipeFull, updateRecipeFull } from "@/lib/recipes/actions";
import { uploadRecipeImage } from "@/lib/storage/recipe-images";
import type {
  CreateRecipeFormErrors,
  CreateRecipeFormValues,
  CreateRecipePayload,
  RecipeDetail,
} from "@/types/recipes";
import { recipeDetailToCreateRecipeFormValues } from "@/types/recipes";

type RecipeFormClientProps =
  | { mode: "create"; userId: string }
  | { mode: "edit"; userId: string; recipeId: string; initialRecipe: RecipeDetail };

export function RecipeFormClient(props: RecipeFormClientProps) {
  const [serverErrors, setServerErrors] = useState<CreateRecipeFormErrors>({});
  const [isPending, startTransition] = useTransition();

  const initialValues = useMemo(
    () =>
      props.mode === "edit"
        ? recipeDetailToCreateRecipeFormValues(props.initialRecipe)
        : undefined,
    [props],
  );

  const cancelHref =
    props.mode === "edit" ? `/recipes/${props.recipeId}` : "/";

  async function handleSubmit(payload: CreateRecipePayload, values: CreateRecipeFormValues) {
    setServerErrors({});

    let imageUrl = payload.imageUrl;

    if (values.imageMode === "file") {
      if (values.imageFile) {
        const uploadResult = await uploadRecipeImage(values.imageFile, props.userId);
        if ("error" in uploadResult) {
          setServerErrors({ imageUrl: uploadResult.error });
          return;
        }
        imageUrl = uploadResult.url;
      } else if (props.mode === "edit" && props.initialRecipe.imageUrl) {
        imageUrl = props.initialRecipe.imageUrl;
      } else {
        setServerErrors({ imageUrl: "Sélectionnez une image à téléverser." });
        return;
      }
    }

    const finalPayload = { ...payload, imageUrl };

    startTransition(async () => {
      const result =
        props.mode === "edit"
          ? await updateRecipeFull(props.recipeId, finalPayload)
          : await createRecipeFull(finalPayload);

      if (!result.success) {
        setServerErrors(result.errors);
      }
    });
  }

  return (
    <CreateRecipeForm
      mode={props.mode}
      initialValues={initialValues}
      cancelHref={cancelHref}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      serverErrors={serverErrors}
    />
  );
}
