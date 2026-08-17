import { useMemo, useState } from "react";
import { compareScaleValues } from "../lib/bathroomMath";
import { formatScaleValue } from "../lib/formatting";
import type { BathroomAction } from "../types";

interface ComparisonToolProps {
  actions: BathroomAction[];
}

export function ComparisonTool({ actions }: ComparisonToolProps) {
  const sortedActions = useMemo(() => [...actions].sort((a, b) => a.value - b.value), [actions]);
  const [firstId, setFirstId] = useState("negative-3");
  const [secondId, setSecondId] = useState("negative-1");

  const first = sortedActions.find((action) => action.id === firstId) ?? sortedActions[0];
  const second = sortedActions.find((action) => action.id === secondId) ?? sortedActions[1];
  const comparison = compareScaleValues(first, second);

  const swap = () => {
    setFirstId(second.id);
    setSecondId(first.id);
  };

  return (
    <section className="instrument-section comparison-section" aria-labelledby="comparison-heading">
      <div className="section-heading">
        <div>
          <p className="kicker">Relational instrument / BNS–03</p>
          <h2 id="comparison-heading">Bathroom comparison tool</h2>
        </div>
        <p>Compare any two acts without reducing the scale to meaningless additive points.</p>
      </div>

      <div className="comparison-grid">
        <label className={`action-select-card action-select-card--${first.polarity}`}>
          <span>Action A</span>
          <select value={first.id} onChange={(event) => setFirstId(event.target.value)}>
            {sortedActions.map((action) => (
              <option key={action.id} value={action.id}>{formatScaleValue(action.value)} — {action.label}</option>
            ))}
          </select>
          <strong>{formatScaleValue(first.value)}</strong>
          <small>{first.category}</small>
        </label>

        <button className="swap-button" type="button" onClick={swap} aria-label="Swap compared actions">⇄</button>

        <label className={`action-select-card action-select-card--${second.polarity}`}>
          <span>Action B</span>
          <select value={second.id} onChange={(event) => setSecondId(event.target.value)}>
            {sortedActions.map((action) => (
              <option key={action.id} value={action.id}>{formatScaleValue(action.value)} — {action.label}</option>
            ))}
          </select>
          <strong>{formatScaleValue(second.value)}</strong>
          <small>{second.category}</small>
        </label>
      </div>

      <div className="comparison-verdict" aria-live="polite">
        <p className="stage-label">Official finding</p>
        <h3>{comparison.headline}</h3>
        <p>{comparison.detail}</p>
        <div className="comparison-axis" aria-hidden="true">
          <span style={{ left: `${((first.value + 6) / 12) * 100}%` }}><i />A</span>
          <span style={{ left: `${((second.value + 6) / 12) * 100}%` }}><i />B</span>
        </div>
        <div className="comparison-axis-labels"><span>−6 heaven</span><span>0 mirror</span><span>+6 hell</span></div>
      </div>
    </section>
  );
}
