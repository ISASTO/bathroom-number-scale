import type { BathroomAction, ComparisonResult, NetResult } from "../types";
import { formatScaleValue } from "./formatting";

export const LOG10_3 = Math.log10(3);
export const THREE_TO_27 = 7_625_597_484_987;

const ANCHOR_LOGS = new Map<number, number>([
  [1, 0],
  [2, LOG10_3],
  [3, 4 * LOG10_3],
  [4, 31 * LOG10_3],
  [5, (31 + THREE_TO_27) * LOG10_3],
  [6, Number.POSITIVE_INFINITY],
]);

const nearlyEqual = (a: number, b: number, epsilon = 1e-9) => Math.abs(a - b) < epsilon;

export function getAnchorLog10Magnitude(absInteger: number): number {
  const value = ANCHOR_LOGS.get(absInteger);
  if (value === undefined) {
    throw new RangeError("Anchor magnitude must be an integer from 1 through 6.");
  }
  return value;
}

export function getLog10Magnitude(scaleValue: number): number {
  const absolute = Math.abs(scaleValue);
  if (absolute === 0) return Number.NEGATIVE_INFINITY;
  if (absolute > 6) throw new RangeError("The Bathroom Number Scale is closed at ±6.");

  if (absolute < 1) {
    return (absolute - 1) * LOG10_3;
  }

  if (Number.isInteger(absolute)) {
    return getAnchorLog10Magnitude(absolute);
  }

  const lower = Math.floor(absolute);
  const upper = Math.ceil(absolute);
  const lowerLog = getAnchorLog10Magnitude(lower);
  const upperLog = getAnchorLog10Magnitude(upper);
  const progress = absolute - lower;

  if (!Number.isFinite(upperLog)) return Number.POSITIVE_INFINITY;
  return lowerLog + (upperLog - lowerLog) * progress;
}

export function getSignedLog10Magnitude(
  scaleValue: number,
): { sign: -1 | 0 | 1; log10Magnitude: number | null } {
  if (scaleValue === 0) return { sign: 0, log10Magnitude: null };
  return {
    sign: scaleValue < 0 ? -1 : 1,
    log10Magnitude: getLog10Magnitude(scaleValue),
  };
}

export function getIntervalRatioLog10(lower: number, upper: number): number {
  if (lower === 0 || upper === 0 || Math.sign(lower) !== Math.sign(upper)) {
    throw new RangeError("Interval endpoints must be nonzero and point in the same bathroom direction.");
  }
  return Math.abs(getLog10Magnitude(upper) - getLog10Magnitude(lower));
}

export function interpolateScalePosition(lower: number, upper: number, multiplier: number): number {
  if (!Number.isFinite(multiplier) || multiplier <= 0) {
    throw new RangeError("Multiplier must be a positive finite number.");
  }

  const ratioLog = getIntervalRatioLog10(lower, upper);
  const multiplierLog = Math.log10(multiplier);
  if (Number.isFinite(ratioLog) && multiplierLog > ratioLog + 1e-10) {
    throw new RangeError("Multiplier exceeds the full interval ratio.");
  }

  if (!Number.isFinite(ratioLog)) return lower;
  return lower + (upper - lower) * (multiplierLog / ratioLog);
}

export function invertLog10MagnitudeToScale(log10Magnitude: number, sign: 1 | -1): number {
  if (log10Magnitude === Number.POSITIVE_INFINITY) return sign * 6;

  const halfStepLog = getLog10Magnitude(0.5);
  let absolute: number;

  if (log10Magnitude < halfStepLog) {
    absolute = 0.5 * Math.pow(10, log10Magnitude - halfStepLog);
  } else if (log10Magnitude < 0) {
    absolute = 1 + log10Magnitude / LOG10_3;
  } else {
    absolute = 5;
    for (let lower = 1; lower < 5; lower += 1) {
      const lowerLog = getAnchorLog10Magnitude(lower);
      const upperLog = getAnchorLog10Magnitude(lower + 1);
      if (log10Magnitude <= upperLog) {
        absolute = lower + (log10Magnitude - lowerLog) / (upperLog - lowerLog);
        break;
      }
    }
  }

  return sign * Math.min(absolute, 6);
}

export function formatMultiplier(log10Value: number): string {
  if (!Number.isFinite(log10Value)) return "3^(3^(3^27))";
  if (nearlyEqual(log10Value, LOG10_3 / 2)) return "√3, or approximately 1.732";
  if (nearlyEqual(log10Value, LOG10_3)) return "3";
  if (nearlyEqual(log10Value, 3 * LOG10_3)) return "27";
  if (nearlyEqual(log10Value, 4 * LOG10_3)) return "81";
  if (nearlyEqual(log10Value, 13.5 * LOG10_3)) {
    return "3^13.5, or approximately 2.761 × 10^6";
  }
  if (nearlyEqual(log10Value, 27 * LOG10_3)) {
    return "3^27, or 7.626 × 10^12";
  }
  if (nearlyEqual(log10Value, THREE_TO_27 * LOG10_3, 0.001)) return "3^(3^27)";

  if (log10Value < 6) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 }).format(
      Math.pow(10, log10Value),
    );
  }

  if (log10Value < 16) {
    const exponent = Math.floor(log10Value);
    const coefficient = Math.pow(10, log10Value - exponent);
    return `${coefficient.toFixed(3)} × 10^${exponent}`;
  }

  if (log10Value < 1e9) return `approximately 10^${log10Value.toExponential(3)}`;
  return `approximately 10^(${log10Value.toExponential(3)})`;
}

export function formatTowerExpression(from: number, to: number): string {
  const low = Math.min(Math.abs(from), Math.abs(to));
  const high = Math.max(Math.abs(from), Math.abs(to));
  if (low === 4 && high === 5) return "3^(3^27)";
  if (low === 5 && high === 6) return "3^(3^(3^27))";
  return formatMultiplier(getIntervalRatioLog10(from, to));
}

export function compareScaleValues(a: BathroomAction, b: BathroomAction): ComparisonResult {
  if (a.value === b.value) {
    return {
      headline: `${a.label} and ${b.label} occupy the same bathroom number: ${formatScaleValue(a.value)}.`,
      detail: "Their bathroom forces are mathematically equal.",
      log10Ratio: 0,
    };
  }

  if (a.value === 0 || b.value === 0) {
    const active = a.value === 0 ? b : a;
    return {
      headline: `${active.label} departs from mirror-gazing equilibrium in the ${active.value < 0 ? "restorative" : "defiling"} direction.`,
      detail: "Zero has no bathroom force, so a multiplicative ratio is undefined.",
      log10Ratio: null,
    };
  }

  const aLog = getLog10Magnitude(a.value);
  const bLog = getLog10Magnitude(b.value);

  if (Math.sign(a.value) !== Math.sign(b.value)) {
    if ((aLog === Number.POSITIVE_INFINITY && bLog === Number.POSITIVE_INFINITY) || nearlyEqual(aLog, bLog)) {
      return {
        headline: `${a.label} is ${a.value < 0 ? "restorative" : "defiling"}. ${b.label} is ${b.value < 0 ? "restorative" : "defiling"}. These actions point in opposite bathroom directions.`,
        detail: "Their pure bathroom magnitudes are exactly equal, so neither dominates the other.",
        log10Ratio: 0,
      };
    }
    const ratio = Math.abs(aLog - bLog);
    const stronger = aLog >= bLog ? a : b;
    const weaker = stronger.id === a.id ? b : a;
    return {
      headline: `${a.label} is ${a.value < 0 ? "restorative" : "defiling"}. ${b.label} is ${b.value < 0 ? "restorative" : "defiling"}. These actions point in opposite bathroom directions.`,
      detail: `${stronger.label} is ${formatMultiplier(ratio)} times stronger in pure magnitude than ${weaker.label}, but in the opposite direction.`,
      log10Ratio: ratio,
    };
  }

  const aIsStronger = aLog > bLog;
  const stronger = aIsStronger ? a : b;
  const weaker = aIsStronger ? b : a;
  const direction = stronger.value < 0 ? "better" : "worse";
  const ratio = Math.abs(aLog - bLog);

  return {
    headline: `${stronger.label} is ${formatMultiplier(ratio)} times ${direction} than ${weaker.label}.`,
    detail: `${formatScaleValue(stronger.value)} has greater ${stronger.value < 0 ? "cleansing" : "defiling"} magnitude than ${formatScaleValue(weaker.value)}.`,
    log10Ratio: ratio,
  };
}

export function log10Sum(logs: number[]): number {
  if (logs.length === 0) return Number.NEGATIVE_INFINITY;
  if (logs.some((value) => value === Number.POSITIVE_INFINITY)) {
    return Number.POSITIVE_INFINITY;
  }
  const max = Math.max(...logs);
  return max + Math.log10(logs.reduce((sum, value) => sum + Math.pow(10, value - max), 0));
}

function log10Subtract(larger: number, smaller: number): number {
  if (smaller === Number.NEGATIVE_INFINITY) return larger;
  const difference = larger - smaller;
  if (difference < 1e-12) return Number.NEGATIVE_INFINITY;
  if (difference > 15) return larger;
  return larger + Math.log10(1 - Math.pow(10, -difference));
}

export function getInterpretiveLabel(value: number): string {
  const absolute = Math.abs(value);
  if (absolute < 0.05) return "Mirror-gazing equilibrium";
  if (value > 0) {
    if (absolute < 0.75) return "Barely bathroom-positive";
    if (absolute < 1.4) return "Pee-adjacent";
    if (absolute < 2.5) return "Poop-adjacent defilement";
    if (absolute < 3.35) return "Vomitward trending";
    if (absolute < 4.5) return "Catastrophic";
    if (absolute < 5.75) return "Bathroom eschatology event detected";
    return "Damned terminal state";
  }
  if (absolute < 1.25) return "Restorative";
  if (absolute < 2.5) return "Hygienically significant";
  if (absolute < 3.5) return "Shower-class cleansing";
  if (absolute < 4.5) return "Transcendent";
  return "Salvific terminal state";
}

export function calculateNetBathroom(
  items: Array<{ action: BathroomAction; count: number }>,
): NetResult {
  const positiveTerminal = items
    .filter(({ action }) => action.value === 6)
    .reduce((sum, item) => sum + item.count, 0);
  const negativeTerminal = items
    .filter(({ action }) => action.value === -6)
    .reduce((sum, item) => sum + item.count, 0);
  const terminalDifference = positiveTerminal - negativeTerminal;

  if (terminalDifference !== 0) {
    const value = terminalDifference > 0 ? 6 : -6;
    return {
      value,
      label: getInterpretiveLabel(value),
      summary:
        value > 0
          ? "Universal damnation overwhelms every finite bathroom force."
          : "Universal salvation overwhelms every finite bathroom force.",
      positiveLog: positiveTerminal > 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY,
      negativeLog: negativeTerminal > 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY,
    };
  }

  const nonterminal = items.filter(({ action }) => Math.abs(action.value) < 6 && action.value !== 0);
  const positiveLogs = nonterminal
    .filter(({ action, count }) => action.value > 0 && count > 0)
    .map(({ action, count }) => getLog10Magnitude(action.value) + Math.log10(count));
  const negativeLogs = nonterminal
    .filter(({ action, count }) => action.value < 0 && count > 0)
    .map(({ action, count }) => getLog10Magnitude(action.value) + Math.log10(count));

  const positiveLog = log10Sum(positiveLogs);
  const negativeLog = log10Sum(negativeLogs);

  if (positiveLog === negativeLog) {
    return {
      value: 0,
      label: getInterpretiveLabel(0),
      summary: "Positive and negative bathroom force cancel exactly.",
      positiveLog,
      negativeLog,
    };
  }

  const sign: 1 | -1 = positiveLog > negativeLog ? 1 : -1;
  const netLog =
    sign === 1
      ? log10Subtract(positiveLog, negativeLog)
      : log10Subtract(negativeLog, positiveLog);
  const value =
    netLog === Number.NEGATIVE_INFINITY ? 0 : invertLog10MagnitudeToScale(netLog, sign);

  return {
    value,
    label: getInterpretiveLabel(value),
    summary:
      value === 0
        ? "The room has returned to perfect mirror-gazing equilibrium."
        : `${value < 0 ? "Restorative" : "Defiling"} force remains after logarithmic cancellation.`,
    positiveLog,
    negativeLog,
  };
}
