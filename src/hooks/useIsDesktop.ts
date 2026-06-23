"use client";

import { useMinWidth } from "@/hooks/useMediaQuery";

export function useIsDesktop(breakpoint = 768): boolean {
  return useMinWidth(breakpoint);
}
