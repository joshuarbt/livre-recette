"use client";

import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/Icon";

const stepIconButtonClass =
  "inline-flex h-9 w-9 min-h-11 min-w-11 items-center justify-center rounded-full disabled:opacity-40";

type AutoResizeTextareaProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

function AutoResizeTextarea({ value, onChange, disabled }: AutoResizeTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    element.style.height = "auto";
    element.style.height = `${Math.max(80, element.scrollHeight)}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      disabled={disabled}
      rows={1}
      onChange={(event) => onChange(event.target.value)}
      className="input-field min-h-[80px] w-full resize-none overflow-hidden"
    />
  );
}

type RecipeStepRowProps = {
  stepNumber: number;
  instruction: string;
  isFirst: boolean;
  isLast: boolean;
  isOnly: boolean;
  isSubmitting: boolean;
  error?: string;
  onInstructionChange: (value: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
};

export function RecipeStepRow({
  stepNumber,
  instruction,
  isFirst,
  isLast,
  isOnly,
  isSubmitting,
  error,
  onInstructionChange,
  onMoveUp,
  onMoveDown,
  onRemove,
}: RecipeStepRowProps) {
  return (
    <li className="flex items-start gap-2 sm:gap-3">
      <span
        className="w-6 shrink-0 pt-2 text-sm font-bold text-[var(--color-text-muted)]"
        aria-hidden
      >
        {stepNumber}
      </span>

      <div className="min-w-0 flex-1">
        <AutoResizeTextarea
          value={instruction}
          disabled={isSubmitting}
          onChange={onInstructionChange}
        />
        {error ? (
          <p className="text-status-error mt-1 text-sm" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-col gap-1 pt-1">
        <div className="flex flex-col gap-1 md:hidden">
          <button
            type="button"
            disabled={isSubmitting || isFirst}
            onClick={onMoveUp}
            className={`${stepIconButtonClass} text-[var(--color-text-muted)]`}
            aria-label="Monter l'étape"
          >
            <Icon icon={ChevronUp} size="md" />
          </button>
          <button
            type="button"
            disabled={isSubmitting || isLast}
            onClick={onMoveDown}
            className={`${stepIconButtonClass} text-[var(--color-text-muted)]`}
            aria-label="Descendre l'étape"
          >
            <Icon icon={ChevronDown} size="md" />
          </button>
          <button
            type="button"
            disabled={isSubmitting || isOnly}
            onClick={onRemove}
            className={`${stepIconButtonClass} text-[var(--status-error)]`}
            aria-label="Retirer l'étape"
          >
            <Icon icon={Trash2} size="md" />
          </button>
        </div>

        <div className="hidden flex-col gap-1 md:flex">
          <button
            type="button"
            disabled={isSubmitting || isFirst}
            onClick={onMoveUp}
            className="btn-ghost px-2 py-1 text-xs disabled:opacity-40"
          >
            Monter
          </button>
          <button
            type="button"
            disabled={isSubmitting || isLast}
            onClick={onMoveDown}
            className="btn-ghost px-2 py-1 text-xs disabled:opacity-40"
          >
            Descendre
          </button>
          <button
            type="button"
            disabled={isSubmitting || isOnly}
            onClick={onRemove}
            className="btn-ghost px-2 py-1 text-xs text-[var(--status-error)] disabled:opacity-40"
          >
            Retirer
          </button>
        </div>
      </div>
    </li>
  );
}
