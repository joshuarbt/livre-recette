import type { ParsedStepTimer } from "@/types/cooking-mode";

type RawMatch = {
  start: number;
  end: number;
  durationSeconds: number;
  matchText: string;
  label: string;
};

/** `heures?` before `h` so "heure" is not truncated to "h". */
const HOURS_MINUTES =
  /(\d+)\s*(?:heures?|h)\s*(?:(\d+)\s*(?:min(?:utes?)?|m)?)?/gi;
const MINUTES = /(\d+)\s*(?:minutes?|mins?|min)\b/gi;
const SECONDS = /(\d+)\s*(?:secondes?|secs?|sec)\b/gi;

function formatDurationLabel(totalSeconds: number): string {
  if (totalSeconds < 60) {
    return `${totalSeconds} s`;
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    if (minutes > 0) {
      return `${hours} h ${minutes} min`;
    }
    return `${hours} h`;
  }

  if (seconds > 0) {
    return `${minutes} min ${seconds} s`;
  }

  return `${minutes} min`;
}

function collectMatches(instruction: string, pattern: RegExp, toSeconds: (match: RegExpExecArray) => number | null): RawMatch[] {
  const results: RawMatch[] = [];
  pattern.lastIndex = 0;

  let match = pattern.exec(instruction);
  while (match) {
    const durationSeconds = toSeconds(match);
    if (durationSeconds !== null && durationSeconds > 0) {
      results.push({
        start: match.index,
        end: match.index + match[0].length,
        durationSeconds,
        matchText: match[0].trim(),
        label: formatDurationLabel(durationSeconds),
      });
    }
    match = pattern.exec(instruction);
  }

  return results;
}

function overlaps(a: RawMatch, b: RawMatch): boolean {
  return a.start < b.end && b.start < a.end;
}

/**
 * Extracts cooking durations from free-text French step instructions.
 * Prefers longer / earlier matches when ranges overlap (e.g. "2 h 30" over "30").
 */
export function parseStepTimers(instruction: string, stepNumber: number): ParsedStepTimer[] {
  if (!instruction.trim()) {
    return [];
  }

  const raw: RawMatch[] = [
    ...collectMatches(instruction, HOURS_MINUTES, (match) => {
      const hours = Number(match[1]);
      const minutes = match[2] ? Number(match[2]) : 0;
      if (!Number.isFinite(hours) || hours < 0) {
        return null;
      }
      return hours * 3600 + minutes * 60;
    }),
    ...collectMatches(instruction, MINUTES, (match) => {
      const minutes = Number(match[1]);
      if (!Number.isFinite(minutes) || minutes <= 0) {
        return null;
      }
      return minutes * 60;
    }),
    ...collectMatches(instruction, SECONDS, (match) => {
      const seconds = Number(match[1]);
      if (!Number.isFinite(seconds) || seconds <= 0) {
        return null;
      }
      return seconds;
    }),
  ];

  raw.sort((a, b) => {
    const lengthDiff = b.end - b.start - (a.end - a.start);
    if (lengthDiff !== 0) {
      return lengthDiff;
    }
    return a.start - b.start;
  });

  const selected: RawMatch[] = [];
  for (const candidate of raw) {
    if (selected.some((kept) => overlaps(kept, candidate))) {
      continue;
    }
    selected.push(candidate);
  }

  selected.sort((a, b) => a.start - b.start);

  return selected.map((item, index) => ({
    id: `${stepNumber}-${index}`,
    label: item.label,
    durationSeconds: item.durationSeconds,
    matchText: item.matchText,
  }));
}

export function formatTimerClock(totalSeconds: number): string {
  const clamped = Math.max(0, Math.ceil(totalSeconds));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
