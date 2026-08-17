const NUMBER_FORMAT = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 4,
});

export function formatScaleValue(value: number): string {
  if (Math.abs(value) < 0.00005) return "0";
  const rounded = Number(value.toFixed(4));
  return `${rounded > 0 ? "+" : ""}${NUMBER_FORMAT.format(rounded)}`;
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return count === 1 ? singular : plural;
}

export function sentenceCase(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
