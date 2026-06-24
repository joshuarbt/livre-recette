"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";

const SPARKLE_COUNT = 20;

type SparkleStyle = {
  left: string;
  top: string;
  animationDelay: string;
  animationDuration: string;
  background: string;
};

function createSparkles(): SparkleStyle[] {
  return Array.from({ length: SPARKLE_COUNT }, () => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 3}s`,
    animationDuration: `${1.5 + Math.random() * 2}s`,
    background: Math.random() > 0.5 ? "white" : "#ffd700",
  }));
}

export function BarbieSparkles() {
  const { theme } = useTheme();
  const [sparkles, setSparkles] = useState<SparkleStyle[]>([]);

  useEffect(() => {
    if (theme === "barbie") {
      setSparkles(createSparkles());
    } else {
      setSparkles([]);
    }
  }, [theme]);

  if (theme !== "barbie" || sparkles.length === 0) {
    return null;
  }

  return (
    <div className="barbie-sparkles pointer-events-none fixed inset-0 -z-10" aria-hidden>
      {sparkles.map((sparkle, index) => (
        <div
          key={index}
          className="barbie-sparkle"
          style={{
            left: sparkle.left,
            top: sparkle.top,
            animationDelay: sparkle.animationDelay,
            animationDuration: sparkle.animationDuration,
            background: sparkle.background,
          }}
        />
      ))}
    </div>
  );
}
