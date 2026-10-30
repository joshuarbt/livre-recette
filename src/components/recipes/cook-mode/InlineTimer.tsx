"use client";

import { Icon } from "@/components/ui/Icon";
import { useCookingTimers } from "@/hooks/useCookingTimers";
import { actionIcons } from "@/lib/icons";
import type { ParsedStepTimer } from "@/types/cooking-mode";
import { formatTimerClock } from "@/utils/parse-step-timers";

type InlineTimerProps = {
  timer: ParsedStepTimer;
  stepNumber: number;
};

export function InlineTimer({ timer, stepNumber }: InlineTimerProps) {
  const { startTimer, getTimerById, getRemainingSeconds } = useCookingTimers();
  const active = getTimerById(timer.id);
  const isRunning = active?.status === "running";
  const isPaused = active?.status === "paused";
  const isCompleted = active?.status === "completed";
  const displaySeconds = active ? getRemainingSeconds(active) : timer.durationSeconds;

  function handleClick() {
    if (isRunning || isPaused) {
      return;
    }
    startTimer(timer, stepNumber);
  }

  const stateClass = isCompleted
    ? "border-[var(--status-success)] bg-[var(--status-success-bg)] text-[var(--status-success)] animate-pulse"
    : isRunning || isPaused
      ? "border-[var(--accent)] bg-[var(--color-primary-highlight)] text-[var(--accent)]"
      : "border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--foreground)]";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isRunning || isPaused}
      className={`inline-flex min-h-14 items-center gap-2 rounded-[var(--radius-md)] border px-4 py-3 text-base font-medium disabled:opacity-100 ${stateClass}`}
      aria-label={
        isCompleted
          ? `Minuteur ${timer.label} terminé`
          : isRunning
            ? `Minuteur ${timer.label} en cours : ${formatTimerClock(displaySeconds)}`
            : isPaused
              ? `Minuteur ${timer.label} en pause`
              : `Lancer un minuteur de ${timer.label}`
      }
    >
      <Icon icon={isCompleted ? actionIcons.timer : actionIcons.play} size="md" />
      <span className="tabular-nums">
        {isRunning || isPaused || isCompleted ? formatTimerClock(displaySeconds) : timer.label}
      </span>
    </button>
  );
}
