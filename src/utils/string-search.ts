export type HighlightSegment = {
  text: string;
  highlight: boolean;
};

const DIACRITIC_REGEX = /[\u0300-\u036f]/g;

export function normalizeForSearch(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(DIACRITIC_REGEX, "");
}

export function escapeIlikePattern(term: string): string {
  return term.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export function matchesSearch(name: string, term: string): boolean {
  const normalizedName = normalizeForSearch(name);
  const normalizedTerm = normalizeForSearch(term);

  if (!normalizedTerm) {
    return false;
  }

  return normalizedName.includes(normalizedTerm);
}

function findNormalizedMatchIndex(name: string, term: string): number {
  const normalizedName = normalizeForSearch(name);
  const normalizedTerm = normalizeForSearch(term);

  if (!normalizedTerm) {
    return -1;
  }

  return normalizedName.indexOf(normalizedTerm);
}

export function splitHighlightedName(name: string, term: string): HighlightSegment[] {
  const matchIndex = findNormalizedMatchIndex(name, term);

  if (matchIndex < 0) {
    return [{ text: name, highlight: false }];
  }

  const normalizedTermLength = normalizeForSearch(term).length;
  let normalizedCount = 0;
  let startIndex = -1;
  let endIndex = -1;

  for (let index = 0; index < name.length; index += 1) {
    const char = name[index];
    const normalizedChar = normalizeForSearch(char);

    if (!normalizedChar) {
      continue;
    }

    if (normalizedCount === matchIndex && startIndex < 0) {
      startIndex = index;
    }

    normalizedCount += normalizedChar.length;

    if (normalizedCount >= matchIndex + normalizedTermLength && endIndex < 0) {
      endIndex = index + 1;
      break;
    }
  }

  if (startIndex < 0 || endIndex < 0) {
    return [{ text: name, highlight: false }];
  }

  const segments: HighlightSegment[] = [];

  if (startIndex > 0) {
    segments.push({ text: name.slice(0, startIndex), highlight: false });
  }

  segments.push({ text: name.slice(startIndex, endIndex), highlight: true });

  if (endIndex < name.length) {
    segments.push({ text: name.slice(endIndex), highlight: false });
  }

  return segments;
}

export function compareSearchRelevance(name: string, term: string): number {
  const normalizedName = normalizeForSearch(name);
  const normalizedTerm = normalizeForSearch(term);

  if (normalizedName.startsWith(normalizedTerm)) {
    return 0;
  }

  if (normalizedName.includes(normalizedTerm)) {
    return 1;
  }

  return 2;
}
