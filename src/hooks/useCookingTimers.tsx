"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CookingTimer, ParsedStepTimer } from "@/types/cooking-mode";
import { playTimerCompleteBeep } from "@/utils/timer-beep";

type CookingTimersContextValue = {
  timers: CookingTimer[];
  now: number;
  startTimer: (parsed: ParsedStepTimer, stepNumber: number) => void;
  pauseTimer: (id: string) => void;
  resumeTimer: (id: string) => void;
  dismissTimer: (id: string) => void;
  getRemainingSeconds: (timer: CookingTimer) => number;
  getTimerById: (id: string) => CookingTimer | undefined;
};

const CookingTimersContext = createContext<CookingTimersContextValue | null>(null);

function remainingFromEndsAt(endsAt: number, now: number): number {
  return Math.max(0, Math.ceil((endsAt - now) / 1000));
}

export function CookingTimersProvider({ children }: { children: ReactNode }) {
  const [timers, setTimers] = useState<CookingTimer[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const completedBeepedRef = useRef<Set<string>>(new Set());

  const hasRunning = timers.some((timer) => timer.status === "running");

  useEffect(() => {
    if (!hasRunning) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [hasRunning]);

  useEffect(() => {
    const completedIds: string[] = [];

    for (const timer of timers) {
      if (timer.status !== "running" || timer.endsAt === null) {
        continue;
      }
      if (remainingFromEndsAt(timer.endsAt, now) > 0) {
        continue;
      }
      if (!completedBeepedRef.current.has(timer.id)) {
        completedBeepedRef.current.add(timer.id);
        playTimerCompleteBeep();
      }
      completedIds.push(timer.id);
    }

    if (completedIds.length === 0) {
      return;
    }

    setTimers((previous) =>
      previous.map((timer) =>
        completedIds.includes(timer.id)
          ? { ...timer, status: "completed", endsAt: null, remainingSeconds: 0 }
          : timer,
      ),
    );
  }, [now, timers]);

  const getRemainingSeconds = useCallback(
    (timer: CookingTimer): number => {
      if (timer.status === "completed") {
        return 0;
      }
      if (timer.status === "paused") {
        return timer.remainingSeconds;
      }
      if (timer.endsAt === null) {
        return timer.remainingSeconds;
      }
      return remainingFromEndsAt(timer.endsAt, now);
    },
    [now],
  );

  const startTimer = useCallback((parsed: ParsedStepTimer, stepNumber: number) => {
    const startedAt = Date.now();
    setTimers((previous) => {
      const existing = previous.find((timer) => timer.id === parsed.id);
      if (existing && existing.status === "running") {
        return previous;
      }

      completedBeepedRef.current.delete(parsed.id);

      const next: CookingTimer = {
        id: parsed.id,
        label: parsed.label,
        durationSeconds: parsed.durationSeconds,
        stepNumber,
        status: "running",
        endsAt: startedAt + parsed.durationSeconds * 1000,
        remainingSeconds: parsed.durationSeconds,
      };

      if (existing) {
        return previous.map((timer) => (timer.id === parsed.id ? next : timer));
      }

      return [...previous, next];
    });
  }, []);

  const pauseTimer = useCallback((id: string) => {
    const pausedAt = Date.now();
    setTimers((previous) =>
      previous.map((timer) => {
        if (timer.id !== id || timer.status !== "running" || timer.endsAt === null) {
          return timer;
        }
        return {
          ...timer,
          status: "paused",
          remainingSeconds: remainingFromEndsAt(timer.endsAt, pausedAt),
          endsAt: null,
        };
      }),
    );
  }, []);

  const resumeTimer = useCallback((id: string) => {
    const resumedAt = Date.now();
    setTimers((previous) =>
      previous.map((timer) => {
        if (timer.id !== id || timer.status !== "paused") {
          return timer;
        }
        return {
          ...timer,
          status: "running",
          endsAt: resumedAt + timer.remainingSeconds * 1000,
        };
      }),
    );
  }, []);

  const dismissTimer = useCallback((id: string) => {
    completedBeepedRef.current.delete(id);
    setTimers((previous) => previous.filter((timer) => timer.id !== id));
  }, []);

  const getTimerById = useCallback(
    (id: string) => timers.find((timer) => timer.id === id),
    [timers],
  );

  const value = useMemo<CookingTimersContextValue>(
    () => ({
      timers,
      now,
      startTimer,
      pauseTimer,
      resumeTimer,
      dismissTimer,
      getRemainingSeconds,
      getTimerById,
    }),
    [timers, now, startTimer, pauseTimer, resumeTimer, dismissTimer, getRemainingSeconds, getTimerById],
  );

  return <CookingTimersContext.Provider value={value}>{children}</CookingTimersContext.Provider>;
}

export function useCookingTimers(): CookingTimersContextValue {
  const context = useContext(CookingTimersContext);
  if (!context) {
    throw new Error("useCookingTimers must be used within CookingTimersProvider");
  }
  return context;
}
