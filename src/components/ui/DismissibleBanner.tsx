"use client";

import { useState } from "react";

type DismissibleBannerProps = {
  message: string;
  className?: string;
};

export function DismissibleBanner({ message, className = "" }: DismissibleBannerProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return null;
  }

  return (
    <div
      role="status"
      className={`alert-warning mb-6 flex items-start justify-between gap-4 ${className}`.trim()}
    >
      <p className="min-w-0 flex-1 break-words">{message}</p>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="btn-ghost shrink-0 text-sm text-[var(--status-warning)] min-h-[var(--touch-min)]"
        aria-label="Ignorer"
      >
        Ignorer
      </button>
    </div>
  );
}
