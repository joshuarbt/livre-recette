"use client";

import { useRef, useState, useTransition } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Icon } from "@/components/ui/Icon";
import {
  RECIPE_IMPORT_INVALID_MESSAGE,
  getRecipeImportPreview,
  parseRecipeImportJson,
  type RecipeExportJson,
} from "@/lib/export-import";
import { importRecipe } from "@/lib/export-import/import-recipe";
import { actionIcons } from "@/lib/icons";

type RecipeImportActionProps = {
  userId: string;
  existingTitles: string[];
};

export function RecipeImportAction({ userId, existingTitles }: RecipeImportActionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [importData, setImportData] = useState<RecipeExportJson | null>(null);
  const [sheetError, setSheetError] = useState<string | null>(null);

  const preview = importData ? getRecipeImportPreview(importData) : null;

  function resetInput() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function closePreview() {
    setImportData(null);
    setSheetError(null);
    resetInput();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError(null);
    setSheetError(null);

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = typeof reader.result === "string" ? reader.result : "";
        const json = JSON.parse(text) as unknown;
        const parsed = parseRecipeImportJson(json);

        if (!parsed.valid) {
          setError(RECIPE_IMPORT_INVALID_MESSAGE);
          resetInput();
          return;
        }

        setImportData(parsed.data);
      } catch {
        setError(RECIPE_IMPORT_INVALID_MESSAGE);
        resetInput();
      }
    };
    reader.onerror = () => {
      setError(RECIPE_IMPORT_INVALID_MESSAGE);
      resetInput();
    };
    reader.readAsText(file);
  }

  function handleConfirmImport() {
    if (!importData) {
      return;
    }

    const title = importData.recipe.title.trim();
    const isDuplicate = existingTitles.some((existing) => existing.trim() === title);

    if (isDuplicate) {
      const confirmed = window.confirm(
        `Une recette « ${title} » existe déjà. Importer quand même ?`,
      );
      if (!confirmed) {
        return;
      }
    }

    setSheetError(null);
    startTransition(async () => {
      const result = await importRecipe(importData, userId);
      if (!result.success) {
        setSheetError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="btn-ghost inline-flex items-center gap-2"
      >
        <Icon icon={actionIcons.upload} size="sm" />
        Importer une recette
      </button>
      {error ? (
        <p role="alert" className="text-status-error w-full text-sm">
          {error}
        </p>
      ) : null}

      <BottomSheet
        open={importData !== null}
        onClose={closePreview}
        title="Importer une recette"
        footer={
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={handleConfirmImport}
              className="btn-primary"
            >
              {isPending ? "Import…" : "Confirmer l'import"}
            </button>
            <button type="button" disabled={isPending} onClick={closePreview} className="btn-ghost">
              Annuler
            </button>
          </div>
        }
      >
        {preview ? (
          <div className="space-y-3 text-sm">
            <p>
              <span className="text-caption">Titre</span>
              <br />
              <span className="font-medium">{preview.title}</span>
            </p>
            <p>
              <span className="text-caption">Catégorie</span>
              <br />
              <span>{preview.categoryLabel}</span>
            </p>
            <p>
              <span className="text-caption">Contenu</span>
              <br />
              <span>
                {preview.ingredientCount} ingrédient{preview.ingredientCount === 1 ? "" : "s"} ·{" "}
                {preview.stepCount} étape{preview.stepCount === 1 ? "" : "s"}
              </span>
            </p>
            {sheetError ? (
              <p role="alert" className="alert-error">
                {sheetError}
              </p>
            ) : null}
          </div>
        ) : null}
      </BottomSheet>
    </div>
  );
}
