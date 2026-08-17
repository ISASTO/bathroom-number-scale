import type { BathroomAction } from "../types";

const STORAGE_KEY = "bathroom-number-scale:custom-actions:v1";

function isBathroomAction(value: unknown): value is BathroomAction {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<BathroomAction>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.value === "number" &&
    Number.isFinite(candidate.value) &&
    candidate.value >= -6 &&
    candidate.value <= 6 &&
    typeof candidate.label === "string" &&
    typeof candidate.fullDescription === "string" &&
    (candidate.polarity === "positive" || candidate.polarity === "negative") &&
    candidate.isCanonical === false
  );
}

export function loadCustomActions(): BathroomAction[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isBathroomAction) : [];
  } catch {
    return [];
  }
}

export function saveCustomActions(actions: BathroomAction[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(actions));
}
