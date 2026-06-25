"use client";

import { useState } from "react";
import { IngredientAutocomplete } from "@/components/IngredientAutocomplete";
import { actionIcons } from "@/lib/icons";
import { Icon } from "@/components/ui/Icon";

type ShoppingListManualAddFormProps = {
  disabled?: boolean;
  onAdd: (name: string, quantity?: number, unit?: string) => Promise<{ success: boolean }>;
};

export function ShoppingListManualAddForm({
  disabled = false,
  onAdd,
}: ShoppingListManualAddFormProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Indiquez un nom d'article.");
      return;
    }

    const parsedQuantity = quantity.trim() ? Number(quantity) : undefined;
    if (parsedQuantity !== undefined && (!Number.isFinite(parsedQuantity) || parsedQuantity < 0)) {
      setError("Quantité invalide.");
      return;
    }

    const result = await onAdd(
      trimmedName,
      parsedQuantity,
      unit.trim() || undefined,
    );

    if (!result.success) {
      return;
    }

    setName("");
    setQuantity("");
    setUnit("");
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="min-w-0 flex-1 space-y-2">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_5rem_5rem_auto]">
        <IngredientAutocomplete
          value={name}
          disabled={disabled}
          placeholder="Nom de l'article…"
          onChange={setName}
          onSelect={(ingredient) => {
            setName(ingredient.name);
            if (ingredient.unit?.trim()) {
              setUnit(ingredient.unit.trim());
            }
          }}
        />
        <input
          type="number"
          min={0}
          step="any"
          value={quantity}
          disabled={disabled}
          onChange={(event) => setQuantity(event.target.value)}
          className="input-field"
          placeholder="Qté"
          aria-label="Quantité"
        />
        <input
          type="text"
          value={unit}
          disabled={disabled}
          onChange={(event) => setUnit(event.target.value)}
          className="input-field"
          placeholder="Unité"
          aria-label="Unité"
        />
        <button type="submit" disabled={disabled} className="btn-primary whitespace-nowrap">
          <Icon icon={actionIcons.add} size="sm" className="mr-1 inline" />
          Ajouter
        </button>
      </div>
      {error ? (
        <p role="alert" className="text-status-error text-sm">
          {error}
        </p>
      ) : null}
    </form>
  );
}
