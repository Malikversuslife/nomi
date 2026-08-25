export function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function clampRounded(value: number, minimum: number, maximum: number) {
  return Math.round(clamp(value, minimum, maximum));
}
