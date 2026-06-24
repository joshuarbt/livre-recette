"use client";

import { useTheme } from "@/components/theme/ThemeProvider";

const CLOUDS = [
  { className: "ghibli-cloud ghibli-cloud-1", duration: "40s", delay: "0s" },
  { className: "ghibli-cloud ghibli-cloud-2", duration: "50s", delay: "-10s" },
  { className: "ghibli-cloud ghibli-cloud-3", duration: "35s", delay: "-20s" },
  { className: "ghibli-cloud ghibli-cloud-4", duration: "45s", delay: "-5s" },
] as const;

export function GhibliClouds() {
  const { theme } = useTheme();

  if (theme !== "ghibli") {
    return null;
  }

  return (
    <div className="ghibli-clouds pointer-events-none fixed inset-0 -z-10" aria-hidden>
      {CLOUDS.map((cloud) => (
        <div
          key={cloud.className}
          className={cloud.className}
          style={{
            animationDuration: cloud.duration,
            animationDelay: cloud.delay,
          }}
        />
      ))}
    </div>
  );
}
