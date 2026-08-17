import { useState } from "react";
import type { BathroomAction } from "../types";
import { compareScaleValues } from "../lib/bathroomMath";
import { formatScaleValue } from "../lib/formatting";

interface ActionCardProps {
  action: BathroomAction;
  adjacentAction?: BathroomAction;
  onDelete?: (id: string) => void;
}

function getRelativeStatement(action: BathroomAction, adjacentAction?: BathroomAction): string {
  if (action.value === 0) return "Perfect neutral bathroom self-awareness.";
  if (!adjacentAction || adjacentAction.value === 0) {
    return action.value < 0
      ? "The first measurable movement toward restoration."
      : "The first measurable movement toward defilement.";
  }
  return compareScaleValues(action, adjacentAction).headline;
}

export function ActionCard({ action, adjacentAction, onDelete }: ActionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const relativeStatement = getRelativeStatement(action, adjacentAction);

  return (
    <article className={`action-card action-card--${action.polarity} ${action.isCanonical ? "" : "is-custom"}`}>
      <button
        type="button"
        className="action-card__summary"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
      >
        <span className="action-card__eyebrow">
          {action.category}
          {!action.isCanonical && <span className="custom-badge">User canon</span>}
        </span>
        <span className="action-card__title-row">
          <strong>{action.label}</strong>
          <span aria-hidden="true" className="expand-mark">
            {expanded ? "−" : "+"}
          </span>
        </span>
        <span className="action-card__comparison">{relativeStatement}</span>
      </button>

      {expanded && (
        <div className="action-card__details">
          <p>{action.fullDescription}</p>
          <dl>
            <div>
              <dt>Official value</dt>
              <dd>{formatScaleValue(action.value)}</dd>
            </div>
            <div>
              <dt>Polarity</dt>
              <dd>{action.polarity}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{action.isCanonical ? "Sacred canon" : "Locally canonized"}</dd>
            </div>
          </dl>
          {!action.isCanonical && onDelete && (
            <button className="text-button danger-text" type="button" onClick={() => onDelete(action.id)}>
              Delete local action
            </button>
          )}
        </div>
      )}
    </article>
  );
}
