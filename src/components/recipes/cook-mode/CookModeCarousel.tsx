"use client";

import { useCallback, useRef, type PointerEvent } from "react";
import { useReducedMotion } from "framer-motion";
import { Crossfade } from "@/components/layout/motion";
import { ActiveTimersDock } from "@/components/recipes/cook-mode/ActiveTimersDock";
import { CookModeStep } from "@/components/recipes/cook-mode/CookModeStep";
import { Icon } from "@/components/ui/Icon";
import { actionIcons } from "@/lib/icons";
import type { RecipeStepDetail } from "@/types/recipes";

const SWIPE_THRESHOLD_PX = 50;

type CookModeCarouselProps = {
  steps: RecipeStepDetail[];
  index: number;
  onIndexChange: (index: number) => void;
};

export function CookModeCarousel({ steps, index, onIndexChange }: CookModeCarouselProps) {
  const reduced = useReducedMotion() ?? false;
  const pointerStartX = useRef<number | null>(null);
  const step = steps[index];
  const isFirst = index <= 0;
  const isLast = index >= steps.length - 1;

  const goPrev = useCallback(() => {
    if (!isFirst) {
      onIndexChange(index - 1);
    }
  }, [index, isFirst, onIndexChange]);

  const goNext = useCallback(() => {
    if (!isLast) {
      onIndexChange(index + 1);
    }
  }, [index, isLast, onIndexChange]);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (reduced) {
      return;
    }
    pointerStartX.current = event.clientX;
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (reduced || pointerStartX.current === null) {
      pointerStartX.current = null;
      return;
    }

    const delta = event.clientX - pointerStartX.current;
    pointerStartX.current = null;

    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) {
      return;
    }

    if (delta < 0) {
      goNext();
    } else {
      goPrev();
    }
  }

  function handlePointerCancel() {
    pointerStartX.current = null;
  }

  if (!step) {
    return null;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative min-h-0 flex-1">
        <div
          className="h-full touch-pan-y overflow-y-auto px-6 py-4 md:px-10"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          <Crossfade contentKey={String(step.stepNumber)} className="mx-auto h-full max-w-4xl">
            <CookModeStep step={step} totalSteps={steps.length} />
          </Crossfade>
        </div>
        <ActiveTimersDock />
      </div>

      <div
        className="flex shrink-0 items-center justify-between gap-4 border-t border-[var(--border-hairline)] px-6 py-4 md:px-10"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <button
          type="button"
          onClick={goPrev}
          disabled={isFirst}
          className="btn-secondary inline-flex min-h-16 min-w-[8.5rem] items-center justify-center gap-2 px-5 text-base disabled:opacity-40"
        >
          <Icon icon={actionIcons.weekPrev} size="md" />
          Précédent
        </button>

        <p className="text-caption tabular-nums text-[var(--muted)]" aria-live="polite">
          {index + 1} / {steps.length}
        </p>

        <button
          type="button"
          onClick={goNext}
          disabled={isLast}
          className="btn-primary inline-flex min-h-16 min-w-[8.5rem] items-center justify-center gap-2 px-5 text-base disabled:opacity-40"
        >
          Suivant
          <Icon icon={actionIcons.weekNext} size="md" />
        </button>
      </div>
    </div>
  );
}
