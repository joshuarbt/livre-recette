"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { CookModeCarousel } from "@/components/recipes/cook-mode/CookModeCarousel";
import { IconButton } from "@/components/ui/IconButton";
import { CookingTimersProvider } from "@/hooks/useCookingTimers";
import { actionIcons } from "@/lib/icons";
import { motionTransition } from "@/lib/motion";
import type { RecipeStepDetail } from "@/types/recipes";

type CookModeOverlayProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  steps: RecipeStepDetail[];
};

export function CookModeOverlay({ open, onClose, title, steps }: CookModeOverlayProps) {
  const titleId = useId();
  const reduced = useReducedMotion() ?? false;
  const [stepIndex, setStepIndex] = useState(0);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (open) {
      setStepIndex(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || typeof navigator === "undefined" || !("wakeLock" in navigator)) {
      return;
    }

    let released = false;
    let wakeLock: WakeLockSentinel | null = null;

    async function requestWakeLock() {
      try {
        wakeLock = await navigator.wakeLock.request("screen");
        wakeLock.addEventListener("release", () => {
          wakeLock = null;
        });
      } catch {
        // Wake Lock may be denied (battery, permissions) — ignore.
      }
    }

    void requestWakeLock();

    function handleVisibility() {
      if (document.visibilityState === "visible" && !released) {
        void requestWakeLock();
      }
    }

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      released = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      void wakeLock?.release();
    };
  }, [open]);

  if (!mounted) {
    return null;
  }

  const overlay = (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="cook-mode"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="fixed inset-0 z-[70] flex flex-col bg-[var(--background)]"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? undefined : { opacity: 0 }}
          transition={motionTransition(reduced)}
        >
          <CookingTimersProvider>
            <header
              className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--border-hairline)] px-6 py-4 md:px-10"
              style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
            >
              <div className="min-w-0">
                <p className="text-overline text-[var(--muted)]">Mode Cuisine</p>
                <h2 id={titleId} className="truncate font-display text-xl text-[var(--foreground)] md:text-2xl">
                  {title}
                </h2>
              </div>
              <IconButton icon={actionIcons.close} label="Quitter le mode cuisine" onClick={onClose} />
            </header>

            <CookModeCarousel steps={steps} index={stepIndex} onIndexChange={setStepIndex} />
          </CookingTimersProvider>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return createPortal(overlay, document.body);
}
