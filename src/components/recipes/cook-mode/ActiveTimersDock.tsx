"use client";

import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { useCookingTimers } from "@/hooks/useCookingTimers";
import { actionIcons } from "@/lib/icons";
import { formatTimerClock } from "@/utils/parse-step-timers";

export function ActiveTimersDock() {
  const { timers, getRemainingSeconds, pauseTimer, resumeTimer, dismissTimer } = useCookingTimers();

  if (timers.length === 0) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute bottom-4 right-[max(1rem,env(safe-area-inset-right))] z-20 flex max-w-[min(100%,20rem)] flex-col gap-2"
      aria-live="polite"
    >
      {timers.map((timer) => {
        const remaining = getRemainingSeconds(timer);
        const isCompleted = timer.status === "completed";
        const isPaused = timer.status === "paused";

        return (
          <div
            key={timer.id}
            className={`pointer-events-auto flex items-center gap-2 rounded-[var(--radius-md)] border px-3 py-2 shadow-[var(--shadow-sm)] ${
              isCompleted
                ? "border-[var(--status-success)] bg-[var(--status-success-bg)] animate-pulse"
                : "border-[var(--border-hairline)] bg-[var(--surface)]"
            }`}
          >
            <Icon
              icon={actionIcons.timer}
              size="sm"
              className={isCompleted ? "text-[var(--status-success)]" : "text-[var(--accent)]"}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-caption text-[var(--muted)]">Étape {timer.stepNumber}</p>
              <p
                className={`text-sm font-medium tabular-nums ${
                  isCompleted ? "text-[var(--status-success)]" : "text-[var(--foreground)]"
                }`}
              >
                {isCompleted ? "Terminé" : formatTimerClock(remaining)}
                {isPaused ? " · pause" : null}
              </p>
            </div>
            {!isCompleted ? (
              <IconButton
                icon={isPaused ? actionIcons.play : actionIcons.pause}
                label={isPaused ? "Reprendre le minuteur" : "Mettre en pause"}
                onClick={() => (isPaused ? resumeTimer(timer.id) : pauseTimer(timer.id))}
              />
            ) : null}
            <IconButton
              icon={actionIcons.close}
              label="Fermer le minuteur"
              onClick={() => dismissTimer(timer.id)}
            />
          </div>
        );
      })}
    </div>
  );
}
