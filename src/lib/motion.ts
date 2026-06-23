import type { Transition, Variants } from "framer-motion";

export const MOTION_EASE = [0.22, 1, 0.36, 1] as const;
export const MOTION_DURATION = 0.35;

export const sheetBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const sheetPanelMobile: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export const sheetPanelDesktop: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

export const fadeThrough: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

export function motionTransition(reduced: boolean, delay = 0): Transition {
  if (reduced) {
    return { duration: 0, delay: 0 };
  }

  return {
    duration: MOTION_DURATION,
    ease: MOTION_EASE,
    delay,
  };
}

export function sheetMotionProps(reduced: boolean, isDesktop: boolean) {
  const panelVariants = isDesktop ? sheetPanelDesktop : sheetPanelMobile;

  if (reduced) {
    return {
      backdrop: {
        initial: false as const,
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0 },
      },
      panel: {
        initial: false as const,
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0 },
        transition: { duration: 0 },
      },
    };
  }

  return {
    backdrop: {
      initial: "hidden" as const,
      animate: "visible" as const,
      exit: "hidden" as const,
      variants: sheetBackdrop,
      transition: motionTransition(false),
    },
    panel: {
      initial: "hidden" as const,
      animate: "visible" as const,
      exit: "hidden" as const,
      variants: panelVariants,
      transition: motionTransition(false),
    },
  };
}
