"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { IconButton } from "@/components/ui/IconButton";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { actionIcons } from "@/lib/icons";
import { sheetMotionProps } from "@/lib/motion";

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  titleId?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  hideHandle?: boolean;
};

export function BottomSheet({
  open,
  onClose,
  title,
  titleId: titleIdProp,
  children,
  footer,
  className = "",
  hideHandle = false,
}: BottomSheetProps) {
  const generatedId = useId();
  const titleId = titleIdProp ?? generatedId;
  const reduced = useReducedMotion() ?? false;
  const isDesktop = useIsDesktop();
  const sheetMotion = sheetMotionProps(reduced, isDesktop);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

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

  const overlay = (
    <AnimatePresence>
      {open ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center md:items-center md:p-4"
          role="presentation"
        >
          <motion.div
            className="absolute inset-0 bg-[var(--foreground)]/25 backdrop-blur-sm"
            aria-hidden="true"
            onClick={onClose}
            {...sheetMotion.backdrop}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={`relative z-10 flex w-full flex-col border border-[var(--border-hairline)] bg-[var(--surface)] max-h-[min(90dvh,calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)))] md:max-h-[90vh] md:max-w-md md:rounded-sm ${className}`.trim()}
            style={{
              paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0px)",
            }}
            onClick={(event) => event.stopPropagation()}
            {...sheetMotion.panel}
          >
            {!hideHandle ? (
              <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-[var(--border-strong)] md:hidden" />
            ) : null}
            <div className="flex shrink-0 items-start justify-between gap-4 px-5 pb-2 pt-[max(1rem,env(safe-area-inset-top,0px))] md:pt-6">
              <h2 id={titleId} className="font-display text-xl text-[var(--foreground)] md:text-2xl">
                {title}
              </h2>
              <IconButton icon={actionIcons.close} label="Fermer" onClick={onClose} />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">{children}</div>
            {footer ? (
              <div className="shrink-0 border-t border-[var(--border-hairline)] px-5 py-4">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );

  if (!mounted) {
    return null;
  }

  return createPortal(overlay, document.body);
}
