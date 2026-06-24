"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";

const MATRIX_CHARS =
  "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789";

const FONT_SIZE = 14;
const COLUMN_GAP = FONT_SIZE;

type RainDrop = {
  x: number;
  y: number;
  speed: number;
  char: string;
};

function createDrops(columnCount: number, canvasHeight: number): RainDrop[] {
  return Array.from({ length: columnCount }, (_, index) => ({
    x: index * COLUMN_GAP,
    y: Math.random() * canvasHeight,
    speed: 2 + Math.random() * 4,
    char: MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)] ?? "0",
  }));
}

export function MatrixRain() {
  const { isMatrix } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isMatrix) {
      return;
    }

    const canvasElement = canvas;
    const rawCtx = canvasElement.getContext("2d");
    if (!rawCtx) {
      return;
    }

    const drawingContext: CanvasRenderingContext2D = rawCtx;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let drops: RainDrop[] = [];

    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      canvasElement.width = Math.floor(window.innerWidth * dpr);
      canvasElement.height = Math.floor(window.innerHeight * dpr);
      canvasElement.style.width = `${window.innerWidth}px`;
      canvasElement.style.height = `${window.innerHeight}px`;
      drawingContext.setTransform(dpr, 0, 0, dpr, 0, 0);

      const columnCount = Math.ceil(window.innerWidth / COLUMN_GAP);
      drops = createDrops(columnCount, window.innerHeight);
    }

    function drawFrame() {
      drawingContext.fillStyle = "rgba(0, 0, 0, 0.08)";
      drawingContext.fillRect(0, 0, window.innerWidth, window.innerHeight);

      drawingContext.font = `${FONT_SIZE}px "Courier New", monospace`;
      drawingContext.fillStyle = "#00ff41";

      for (const drop of drops) {
        drawingContext.fillText(drop.char, drop.x, drop.y);

        if (!prefersReducedMotion) {
          drop.y += drop.speed;
          if (drop.y > window.innerHeight + FONT_SIZE) {
            drop.y = -FONT_SIZE;
            drop.speed = 2 + Math.random() * 4;
            drop.char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)] ?? "0";
          }

          if (Math.random() > 0.975) {
            drop.char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)] ?? "0";
          }
        }
      }

      animationRef.current = window.requestAnimationFrame(drawFrame);
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    animationRef.current = window.requestAnimationFrame(drawFrame);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      drawingContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
    };
  }, [isMatrix]);

  return (
    <canvas
      ref={canvasRef}
      className="matrix-rain-canvas pointer-events-none fixed inset-0 -z-10 hidden opacity-[0.08]"
      aria-hidden
    />
  );
}
