"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { CreateRecipeForm } from "@/components/recipes/CreateRecipeForm";
import { createRecipeFull, updateRecipeFull } from "@/lib/recipes/actions";
import { uploadRecipeImage } from "@/lib/storage/recipe-images";
import {
  RECIPE_URL_IMPORT_STORAGE_KEY,
  type RecipeUrlImportSession,
} from "@/lib/import-recipe-url/types";
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
  const searchParams = useSearchParams();
  const [serverErrors, setServerErrors] = useState<CreateRecipeFormErrors>({});
  const [isPending, startTransition] = useTransition();
  const [importedValues, setImportedValues] = useState<CreateRecipeFormValues | undefined>();
  const [importPartial, setImportPartial] = useState(false);

  useEffect(() => {
    if (props.mode !== "create" || searchParams.get("fromUrl") !== "1") {
      return;
    }

    const raw = sessionStorage.getItem(RECIPE_URL_IMPORT_STORAGE_KEY);
    if (!raw) {
      return;
    }

    sessionStorage.removeItem(RECIPE_URL_IMPORT_STORAGE_KEY);

    try {
      const session = JSON.parse(raw) as RecipeUrlImportSession;
      setImportedValues(session.values);
      setImportPartial(session.partial);
    } catch {
      // ignore invalid session payload
    }
  }, [props.mode, searchParams]);

  const initialValues = useMemo(
    () =>
      props.mode === "edit"
        ? recipeDetailToCreateRecipeFormValues(props.initialRecipe)
        : importedValues,
    [props, importedValues],
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
    <div className="space-y-4">
      {importPartial ? (
        <p className="alert-warning text-sm" role="status">
          Certaines informations n&apos;ont pas pu être extraites, vérifiez le formulaire avant de
          sauvegarder
        </p>
      ) : null}
      <CreateRecipeForm
        mode={props.mode}
        initialValues={initialValues}
        cancelHref={cancelHref}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />
    </div>
  );
}
