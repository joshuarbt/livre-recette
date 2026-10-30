export type ParsedStepTimer = {
  id: string;
  label: string;
  durationSeconds: number;
  matchText: string;
};

export type CookingTimerStatus = "running" | "paused" | "completed";

export type CookingTimer = {
  id: string;
  label: string;
  durationSeconds: number;
  stepNumber: number;
  status: CookingTimerStatus;
  /** Absolute timestamp when the countdown reaches zero (running only). */
  endsAt: number | null;
  /** Remaining seconds when paused; otherwise derived from endsAt while running. */
  remainingSeconds: number;
};
