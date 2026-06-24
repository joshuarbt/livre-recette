export function getBaseServings(servings: number | null): number {
  if (servings !== null && Number.isInteger(servings) && servings > 0) {
    return servings;
  }
  return 1;
}

export function computeServingsRatio(selected: number, base: number): number {
  if (base <= 0) {
    return selected;
  }
  return selected / base;
}

export function scaleQuantity(quantity: number, ratio: number): number {
  return quantity * ratio;
}

export function formatScaledQuantity(value: number): string {
  const rounded = Math.round(value);
  if (Math.abs(value - rounded) < 0.05) {
    return String(rounded);
  }

  const oneDecimal = Math.round(value * 10) / 10;
  if (Number.isInteger(oneDecimal)) {
    return String(oneDecimal);
  }

  return String(oneDecimal);
}
