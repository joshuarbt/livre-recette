"use client";

import { useMemo } from "react";
import { InlineTimer } from "@/components/recipes/cook-mode/InlineTimer";
import type { RecipeStepDetail } from "@/types/recipes";
import { parseStepTimers } from "@/utils/parse-step-timers";

type CookModeStepProps = {
  step: RecipeStepDetail;
  totalSteps: number;
};

export function CookModeStep({ step, totalSteps }: CookModeStepProps) {
  const timers = useMemo(
    () => parseStepTimers(step.instruction, step.stepNumber),
    [step.instruction, step.stepNumber],
  );

  return (
    <div className="flex h-full flex-col justify-center gap-8 px-2">
      <p className="text-overline tracking-wide text-[var(--muted)]">
        Étape {step.stepNumber} sur {totalSteps}
      </p>
      <p
        className="whitespace-pre-wrap font-display text-[clamp(1.5rem,3.2vw,2.5rem)] leading-[1.35] text-[var(--foreground)]"
      >
        {step.instruction}
      </p>
      {timers.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {timers.map((timer) => (
            <InlineTimer key={timer.id} timer={timer} stepNumber={step.stepNumber} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
