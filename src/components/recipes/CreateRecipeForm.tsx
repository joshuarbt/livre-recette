"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { validateCreateRecipeForm } from "@/lib/recipes/form-validation";
import { actionIcons } from "@/lib/icons";
import type {
  CreateRecipeFormErrors,
  CreateRecipeFormValues,
  CreateRecipePayload,
  RecipeStepFormRow,
} from "@/types/recipes";
import {
  RECIPE_CATEGORIES,
  createDefaultCreateRecipeFormValues,
  createEmptyIngredientRow,
  createEmptyStepRow,
  createEmptyUtensilRow,
} from "@/types/recipes";

type CreateRecipeFormProps = {
  mode?: "create" | "edit";
  initialValues?: CreateRecipeFormValues;
  cancelHref?: string;
  submitLabel?: string;
  onSubmit: (payload: CreateRecipePayload, values: CreateRecipeFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
  serverErrors?: CreateRecipeFormErrors;
};

function moveStep(
  steps: RecipeStepFormRow[],
  clientId: string,
  direction: -1 | 1,
): RecipeStepFormRow[] {
  const index = steps.findIndex((step) => step.clientId === clientId);
  const targetIndex = index + direction;

  if (index < 0 || targetIndex < 0 || targetIndex >= steps.length) {
    return steps;
  }

  const next = [...steps];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return <p className="text-status-error mt-1 text-sm">{message}</p>;
}

type RecipeFormSectionProps = {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

function RecipeFormSection({ title, defaultOpen = true, children }: RecipeFormSectionProps) {
  return (
    <details open={defaultOpen} className="group space-y-4 border-b border-[var(--border-subtle)] pb-6">
      <summary className="flex min-h-[var(--touch-min)] cursor-pointer list-none items-center justify-between py-2 font-medium text-[var(--foreground)] md:hidden [&::-webkit-details-marker]:hidden">
        {title}
        <Icon
          icon={actionIcons.expand}
          size="sm"
          className="text-[var(--muted)] transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="space-y-4 pt-2 md:pt-0">
        <p className="input-label hidden md:block">{title}</p>
        {children}
      </div>
    </details>
  );
}

export function CreateRecipeForm({
  mode = "create",
  initialValues,
  cancelHref = "/",
  submitLabel,
  onSubmit,
  isSubmitting = false,
  serverErrors = {},
}: CreateRecipeFormProps) {
  const [values, setValues] = useState<CreateRecipeFormValues>(
    () => initialValues ?? createDefaultCreateRecipeFormValues(),
  );
  const [errors, setErrors] = useState<CreateRecipeFormErrors>({});

  const fieldErrors = { ...errors, ...serverErrors };
  const resolvedSubmitLabel =
    submitLabel ?? (mode === "edit" ? "Mettre à jour" : "Enregistrer la recette");
  const submittingLabel = mode === "edit" ? "Mise à jour…" : "Enregistrement…";

  function updateField<K extends keyof CreateRecipeFormValues>(
    key: K,
    value: CreateRecipeFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateCreateRecipeForm(values);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    await onSubmit(result.data, values);
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-8">
      <RecipeFormSection title="Informations générales">
        <label className="block space-y-2">
          <span className="input-label">Titre</span>
          <input
            type="text"
            value={values.title}
            disabled={isSubmitting}
            onChange={(event) => updateField("title", event.target.value)}
            className="input-field"
          />
          <FieldError message={fieldErrors.title} />
        </label>

        <label className="block space-y-2">
          <span className="input-label">Description courte</span>
          <textarea
            value={values.description}
            disabled={isSubmitting}
            rows={3}
            onChange={(event) => updateField("description", event.target.value)}
            className="input-field"
          />
        </label>

        <label className="block space-y-2">
          <span className="input-label">Catégorie</span>
          <select
            value={values.category}
            disabled={isSubmitting}
            onChange={(event) =>
              updateField("category", event.target.value as CreateRecipeFormValues["category"])
            }
            className="input-field"
          >
            <option value="">Sélectionner…</option>
            {RECIPE_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-5 sm:grid-cols-3">
          <label className="block space-y-2">
            <span className="input-label">Préparation (min)</span>
            <input
              type="number"
              min={1}
              value={values.prepTime}
              disabled={isSubmitting}
              onChange={(event) => updateField("prepTime", event.target.value)}
              className="input-field"
            />
          </label>
          <label className="block space-y-2">
            <span className="input-label">Cuisson (min)</span>
            <input
              type="number"
              min={1}
              value={values.cookTime}
              disabled={isSubmitting}
              onChange={(event) => updateField("cookTime", event.target.value)}
              className="input-field"
            />
          </label>
          <label className="block space-y-2">
            <span className="input-label">Nombre de parts</span>
            <input
              type="number"
              min={1}
              value={values.servings}
              disabled={isSubmitting}
              onChange={(event) => updateField("servings", event.target.value)}
              className="input-field"
            />
            <FieldError message={fieldErrors.servings} />
          </label>
        </div>
      </RecipeFormSection>

      <RecipeFormSection title="Photo">
        {mode === "edit" && values.imageUrl ? (
          <div className="mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={values.imageUrl}
              alt="Photo actuelle de la recette"
              className="h-24 w-24 rounded-sm border border-[var(--border-hairline)] object-cover"
            />
          </div>
        ) : null}
        <div className="flex gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="imageMode"
              checked={values.imageMode === "url"}
              disabled={isSubmitting}
              onChange={() => updateField("imageMode", "url")}
            />
            URL
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="imageMode"
              checked={values.imageMode === "file"}
              disabled={isSubmitting}
              onChange={() => updateField("imageMode", "file")}
            />
            Fichier
          </label>
        </div>

        {values.imageMode === "url" ? (
          <label className="block space-y-2">
            <span className="input-label">URL de la photo</span>
            <input
              type="url"
              value={values.imageUrl}
              disabled={isSubmitting}
              onChange={(event) => updateField("imageUrl", event.target.value)}
              className="input-field"
              placeholder="https://…"
            />
            <FieldError message={fieldErrors.imageUrl} />
          </label>
        ) : (
          <label className="block space-y-2">
            <span className="input-label">Fichier image</span>
            <input
              type="file"
              accept="image/*"
              disabled={isSubmitting}
              onChange={(event) =>
                updateField("imageFile", event.target.files?.[0] ?? null)
              }
              className="input-field"
            />
          </label>
        )}
      </RecipeFormSection>

      <RecipeFormSection title="Ingrédients">
        <FieldError message={fieldErrors.ingredients} />
        <ul className="space-y-4">
          {values.ingredients.map((row) => (
            <li
              key={row.clientId}
              className="grid gap-3 rounded-sm border border-[var(--border-hairline)] p-3 sm:grid-cols-[1fr_6rem_6rem_auto]"
            >
              <label className="block space-y-1">
                <span className="text-caption">Nom</span>
                <input
                  type="text"
                  value={row.name}
                  disabled={isSubmitting}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      ingredients: current.ingredients.map((item) =>
                        item.clientId === row.clientId
                          ? { ...item, name: event.target.value }
                          : item,
                      ),
                    }))
                  }
                  className="input-field"
                />
                <FieldError message={fieldErrors.ingredientRows?.[row.clientId]?.name} />
              </label>
              <label className="block space-y-1">
                <span className="text-caption">Quantité</span>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={row.quantity}
                  disabled={isSubmitting}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      ingredients: current.ingredients.map((item) =>
                        item.clientId === row.clientId
                          ? { ...item, quantity: event.target.value }
                          : item,
                      ),
                    }))
                  }
                  className="input-field"
                />
                <FieldError message={fieldErrors.ingredientRows?.[row.clientId]?.quantity} />
              </label>
              <label className="block space-y-1">
                <span className="text-caption">Unité</span>
                <input
                  type="text"
                  value={row.unit}
                  disabled={isSubmitting}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      ingredients: current.ingredients.map((item) =>
                        item.clientId === row.clientId
                          ? { ...item, unit: event.target.value }
                          : item,
                      ),
                    }))
                  }
                  className="input-field"
                  placeholder="g, ml, pièce…"
                />
                <FieldError message={fieldErrors.ingredientRows?.[row.clientId]?.unit} />
              </label>
              <div className="flex items-end">
                <button
                  type="button"
                  disabled={isSubmitting || values.ingredients.length === 1}
                  onClick={() =>
                    setValues((current) => ({
                      ...current,
                      ingredients: current.ingredients.filter(
                        (item) => item.clientId !== row.clientId,
                      ),
                    }))
                  }
                  className="btn-ghost text-sm text-[var(--status-error)] disabled:opacity-40"
                >
                  Retirer
                </button>
              </div>
            </li>
          ))}
        </ul>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() =>
            setValues((current) => ({
              ...current,
              ingredients: [...current.ingredients, createEmptyIngredientRow()],
            }))
          }
          className="btn-ghost text-sm"
        >
          + Ajouter un ingrédient
        </button>
      </RecipeFormSection>

      <RecipeFormSection title="Ustensiles" defaultOpen={false}>
        {values.utensils.length === 0 ? (
          <p className="text-caption text-[var(--muted)]">Aucun ustensile ajouté.</p>
        ) : (
          <ul className="space-y-3">
            {values.utensils.map((row) => (
              <li key={row.clientId} className="flex gap-3">
                <label className="min-w-0 flex-1 space-y-1">
                  <span className="text-caption">Ustensile</span>
                  <input
                    type="text"
                    value={row.name}
                    disabled={isSubmitting}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        utensils: current.utensils.map((item) =>
                          item.clientId === row.clientId
                            ? { ...item, name: event.target.value }
                            : item,
                        ),
                      }))
                    }
                    className="input-field"
                  />
                  <FieldError message={fieldErrors.utensilRows?.[row.clientId]?.name} />
                </label>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() =>
                    setValues((current) => ({
                      ...current,
                      utensils: current.utensils.filter(
                        (item) => item.clientId !== row.clientId,
                      ),
                    }))
                  }
                  className="btn-ghost shrink-0 self-end text-sm text-[var(--status-error)]"
                >
                  Retirer
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() =>
            setValues((current) => ({
              ...current,
              utensils: [...current.utensils, createEmptyUtensilRow()],
            }))
          }
          className="btn-ghost text-sm"
        >
          + Ajouter un ustensile
        </button>
      </RecipeFormSection>

      <RecipeFormSection title="Étapes de préparation">
        <ul className="space-y-4">
          {values.steps.map((row, index) => (
            <li key={row.clientId} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-caption font-medium">Étape {index + 1}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSubmitting || index === 0}
                  onClick={() =>
                    setValues((current) => ({
                      ...current,
                      steps: moveStep(current.steps, row.clientId, -1),
                    }))
                  }
                  className="btn-ghost text-sm disabled:opacity-40"
                >
                  Monter
                </button>
                <button
                  type="button"
                  disabled={isSubmitting || index === values.steps.length - 1}
                  onClick={() =>
                    setValues((current) => ({
                      ...current,
                      steps: moveStep(current.steps, row.clientId, 1),
                    }))
                  }
                  className="btn-ghost text-sm disabled:opacity-40"
                >
                  Descendre
                </button>
                <button
                  type="button"
                  disabled={isSubmitting || values.steps.length === 1}
                  onClick={() =>
                    setValues((current) => ({
                      ...current,
                      steps: current.steps.filter((item) => item.clientId !== row.clientId),
                    }))
                  }
                  className="btn-ghost text-sm text-[var(--status-error)] disabled:opacity-40"
                >
                  Retirer
                </button>
              </div>
              </div>
              <textarea
                value={row.instruction}
                disabled={isSubmitting}
                rows={3}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    steps: current.steps.map((item) =>
                      item.clientId === row.clientId
                        ? { ...item, instruction: event.target.value }
                        : item,
                    ),
                  }))
                }
                className="input-field"
              />
              <FieldError message={fieldErrors.stepRows?.[row.clientId]?.instruction} />
            </li>
          ))}
        </ul>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() =>
            setValues((current) => ({
              ...current,
              steps: [...current.steps, createEmptyStepRow()],
            }))
          }
          className="btn-ghost text-sm"
        >
          + Ajouter une étape
        </button>
      </RecipeFormSection>

      {fieldErrors.form ? (
        <p role="alert" className="alert-error">
          {fieldErrors.form}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4 border-t border-[var(--border-subtle)] pt-6">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? submittingLabel : resolvedSubmitLabel}
        </button>
        <Link href={cancelHref} className="btn-ghost">
          Annuler
        </Link>
      </div>
    </form>
  );
}
