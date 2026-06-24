"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Icon } from "@/components/ui/Icon";
import {
  RECIPE_URL_IMPORT_STORAGE_KEY,
  type ImportRecipeUrlResponse,
  type RecipeUrlImportSession,
} from "@/lib/import-recipe-url/types";
import { actionIcons } from "@/lib/icons";

export function RecipeUrlImportAction() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function resetState() {
    setUrl("");
    setError(null);
    setIsLoading(false);
  }

  function handleClose() {
    setOpen(false);
    resetState();
  }

  async function handleAnalyze() {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/import-recipe-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmedUrl }),
      });

      const result = (await response.json()) as ImportRecipeUrlResponse;

      if (!result.success) {
        setError(result.error);
        return;
      }

      const session: RecipeUrlImportSession = {
        values: result.data,
        partial: result.partial,
      };

      sessionStorage.setItem(RECIPE_URL_IMPORT_STORAGE_KEY, JSON.stringify(session));
      handleClose();
      router.push("/recettes/nouvelle?fromUrl=1");
    } catch {
      setError("Impossible d'accéder à ce site");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-ghost inline-flex items-center gap-2"
      >
        <Icon icon={actionIcons.link} size="sm" />
        Importer depuis un site
      </button>

      <BottomSheet
        open={open}
        onClose={handleClose}
        title="Importer depuis un site"
        footer={
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="btn-primary"
              disabled={isLoading || !url.trim()}
              onClick={() => void handleAnalyze()}
            >
              {isLoading ? "Analyse en cours…" : "Analyser la recette"}
            </button>
            <button type="button" className="btn-ghost" disabled={isLoading} onClick={handleClose}>
              Annuler
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <label className="block">
            <span className="input-label mb-2 block">URL de la recette</span>
            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://www.marmiton.org/..."
              className="input-field w-full"
              disabled={isLoading}
            />
          </label>
          {error ? (
            <p role="alert" className="alert-error text-sm">
              {error}
            </p>
          ) : null}
        </div>
      </BottomSheet>
    </div>
  );
}
