export type Polarity = "positive" | "negative" | "neutral";

export interface BathroomAction {
  id: string;
  value: number;
  label: string;
  fullDescription: string;
  polarity: Polarity;
  category: string;
  isCanonical: boolean;
  createdAt?: string;
}

export interface ComparisonResult {
  headline: string;
  detail: string;
  log10Ratio: number | null;
}

export interface NetLineItem {
  id: string;
  actionId: string;
  count: number;
}

export interface NetResult {
  value: number;
  label: string;
  summary: string;
  positiveLog: number;
  negativeLog: number;
}
