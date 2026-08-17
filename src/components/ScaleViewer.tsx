import { canonicalScale } from "../data/canonicalScale";
import { formatScaleValue } from "../lib/formatting";
import type { BathroomAction } from "../types";
import { ActionCard } from "./ActionCard";

interface ScaleViewerProps {
  customActions: BathroomAction[];
  onDeleteCustom: (id: string) => void;
}

function findAdjacentTowardZero(action: BathroomAction, allActions: BathroomAction[]) {
  if (action.value === 0) return undefined;
  const candidates = allActions.filter(
    (candidate) =>
      candidate.id !== action.id &&
      Math.sign(candidate.value) === Math.sign(action.value) &&
      Math.abs(candidate.value) < Math.abs(action.value),
  );
  return candidates.sort((a, b) => Math.abs(b.value) - Math.abs(a.value))[0];
}

export function ScaleViewer({ customActions, onDeleteCustom }: ScaleViewerProps) {
  const actions = [...canonicalScale, ...customActions].sort((a, b) => a.value - b.value);

  return (
    <section className="instrument-section scale-section" aria-labelledby="scale-heading">
      <div className="section-heading">
        <div>
          <p className="kicker">Canonical instrument / BNS–01</p>
          <h2 id="scale-heading">The complete axis</h2>
        </div>
        <p>
          Lower is better. Higher is worse. Select any entry to inspect its official
          classification.
        </p>
      </div>

      <div className="polarity-legend" aria-label="Scale polarity legend">
        <span className="legend-negative"><i /> − Restoration &amp; salvation</span>
        <span className="legend-neutral"><i /> 0 Neutral awareness</span>
        <span className="legend-positive"><i /> + Defilement &amp; damnation</span>
      </div>

      {customActions.length > 0 && (
        <div className="local-notice">
          <span>{customActions.length.toString().padStart(2, "0")}</span>
          Local {customActions.length === 1 ? "action has" : "actions have"} been admitted into the
          working canon on this device.
        </div>
      )}

      <div className="scale-axis">
        <div className="axis-line" aria-hidden="true" />
        {actions.map((action) => {
          const canonicalPool = action.isCanonical ? canonicalScale : actions;
          const adjacent = findAdjacentTowardZero(action, canonicalPool);
          return (
            <div className={`scale-row scale-row--${action.polarity}`} key={action.id}>
              <div className="scale-card-slot">
                <ActionCard
                  action={action}
                  adjacentAction={adjacent}
                  onDelete={action.isCanonical ? undefined : onDeleteCustom}
                />
              </div>
              <div className="axis-value" aria-label={`Number ${formatScaleValue(action.value)}`}>
                <span>{formatScaleValue(action.value)}</span>
              </div>
              <div className="scale-card-spacer" />
            </div>
          );
        })}
      </div>
    </section>
  );
}
