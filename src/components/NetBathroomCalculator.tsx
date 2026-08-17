import { useMemo, useState } from "react";
import { calculateNetBathroom } from "../lib/bathroomMath";
import { formatScaleValue, pluralize } from "../lib/formatting";
import type { BathroomAction, NetLineItem } from "../types";

interface NetBathroomCalculatorProps {
  actions: BathroomAction[];
}

const exampleIds = ["negative-3", "positive-1", "positive-2", "negative-1", "positive-0-5"];

function newLine(actionId: string, count = 1): NetLineItem {
  return {
    id: `line-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    actionId,
    count,
  };
}

export function NetBathroomCalculator({ actions }: NetBathroomCalculatorProps) {
  const sortedActions = useMemo(() => [...actions].sort((a, b) => a.value - b.value), [actions]);
  const defaultAction = sortedActions.find((action) => action.id === "positive-1") ?? sortedActions[0];
  const [lines, setLines] = useState<NetLineItem[]>([]);

  const resolvedLines = lines
    .map((line) => ({
      action: sortedActions.find((action) => action.id === line.actionId),
      count: line.count,
    }))
    .filter((line): line is { action: BathroomAction; count: number } => Boolean(line.action));
  const result = calculateNetBathroom(resolvedLines);

  const addLine = () => setLines((current) => [...current, newLine(defaultAction.id)]);
  const removeLine = (id: string) => setLines((current) => current.filter((line) => line.id !== id));
  const updateLine = (id: string, patch: Partial<NetLineItem>) => {
    setLines((current) => current.map((line) => (line.id === id ? { ...line, ...patch } : line)));
  };
  const loadExample = () => {
    setLines(
      exampleIds.map((id) => newLine(id, id === "positive-1" ? 2 : 1)),
    );
  };

  return (
    <section className="instrument-section net-section" aria-labelledby="net-heading">
      <div className="section-heading">
        <div>
          <p className="kicker">Aggregate instrument / BNS–04</p>
          <h2 id="net-heading">Net bathroom calculator</h2>
        </div>
        <p>Combine a complete visit using signed force, logarithmic summation, and cancellation.</p>
      </div>

      <div className="net-layout">
        <div className="net-ledger">
          <div className="ledger-heading">
            <div><span>Count</span><span>Observed action</span></div>
            <button className="text-button" type="button" onClick={loadExample}>Load specimen visit</button>
          </div>

          {lines.length === 0 ? (
            <div className="empty-state">
              <span>∅</span>
              <h3>No bathroom events recorded</h3>
              <p>The chamber is presently in mirror-gazing equilibrium.</p>
              <button className="primary-button" type="button" onClick={addLine}>Add first action</button>
            </div>
          ) : (
            <div className="ledger-lines">
              {lines.map((line) => (
                <div className="ledger-line" key={line.id}>
                  <input
                    aria-label="Action count"
                    type="number"
                    min="1"
                    max="9999"
                    value={line.count}
                    onChange={(event) => updateLine(line.id, { count: Math.max(1, Number(event.target.value) || 1) })}
                  />
                  <select
                    aria-label="Bathroom action"
                    value={line.actionId}
                    onChange={(event) => updateLine(line.id, { actionId: event.target.value })}
                  >
                    {sortedActions.map((action) => (
                      <option value={action.id} key={action.id}>
                        {formatScaleValue(action.value)} — {action.label}
                      </option>
                    ))}
                  </select>
                  <button type="button" onClick={() => removeLine(line.id)} aria-label="Remove action">×</button>
                </div>
              ))}
              <div className="ledger-actions">
                <button className="secondary-button" type="button" onClick={addLine}>+ Add action</button>
                <button className="text-button danger-text" type="button" onClick={() => setLines([])}>Clear visit</button>
              </div>
            </div>
          )}
        </div>

        <aside className={`net-result ${result.value < 0 ? "net-result--negative" : result.value > 0 ? "net-result--positive" : "net-result--neutral"}`} aria-live="polite">
          <p className="stage-label">Net finding</p>
          <span className="net-number">{formatScaleValue(result.value)}</span>
          <h3>{result.label}</h3>
          <p>{result.summary}</p>
          <div className="force-meter" aria-label={`Net result ${formatScaleValue(result.value)}`}>
            <div />
            <i style={{ left: `${((result.value + 6) / 12) * 100}%` }} />
          </div>
          <div className="force-meter-labels"><span>restorative</span><span>defiling</span></div>
          <small>
            {resolvedLines.reduce((sum, item) => sum + item.count, 0)} {pluralize(resolvedLines.reduce((sum, item) => sum + item.count, 0), "event")} analyzed
          </small>
        </aside>
      </div>

      <details className="method-note">
        <summary>How this total is calculated</summary>
        <p>
          Each action becomes a signed magnitude. Counts are multiplied in log space; positive and negative totals are summed separately with base-10 log-sum-exp, then the smaller force is subtracted from the larger. The remainder is inverted back onto the scale. A shower therefore contributes 81 handwashes of restorative force—not “minus three points.”
        </p>
      </details>
    </section>
  );
}
