import { useMemo, useState } from "react";
import { canonicalById, insertionAnchors } from "../data/canonicalScale";
import {
  formatMultiplier,
  getIntervalRatioLog10,
  interpolateScalePosition,
} from "../lib/bathroomMath";
import { formatPercent, formatScaleValue, sentenceCase } from "../lib/formatting";
import type { BathroomAction, Polarity } from "../types";

type WizardPolarity = Exclude<Polarity, "neutral">;
type WizardStep = "name" | "polarity" | "bracket" | "multiplier" | "result" | "terminal";

interface ActionInsertionWizardProps {
  onCanonize: (action: BathroomAction) => void;
  onOpenScale: () => void;
}

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `custom-${crypto.randomUUID()}`;
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function ActionInsertionWizard({ onCanonize, onOpenScale }: ActionInsertionWizardProps) {
  const [step, setStep] = useState<WizardStep>("name");
  const [name, setName] = useState("");
  const [polarity, setPolarity] = useState<WizardPolarity | null>(null);
  const [anchorIndex, setAnchorIndex] = useState(0);
  const [lowerAnchor, setLowerAnchor] = useState<BathroomAction | null>(null);
  const [upperAnchor, setUpperAnchor] = useState<BathroomAction | null>(null);
  const [multiplier, setMultiplier] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [canonized, setCanonized] = useState(false);

  const anchors = polarity ? insertionAnchors[polarity] : [];
  const currentAnchor = anchors[anchorIndex];
  const relationWord = polarity === "negative" ? "better" : "worse";

  const ratioLog = useMemo(() => {
    if (!lowerAnchor || !upperAnchor) return null;
    return getIntervalRatioLog10(lowerAnchor.value, upperAnchor.value);
  }, [lowerAnchor, upperAnchor]);

  const reset = () => {
    setStep("name");
    setName("");
    setPolarity(null);
    setAnchorIndex(0);
    setLowerAnchor(null);
    setUpperAnchor(null);
    setMultiplier("");
    setResult(null);
    setError("");
    setCanonized(false);
  };

  const submitName = () => {
    if (!name.trim()) {
      setError("An action cannot enter the canon without a name.");
      return;
    }
    setError("");
    setName(name.trim());
    setStep("polarity");
  };

  const choosePolarity = (choice: WizardPolarity) => {
    setPolarity(choice);
    setAnchorIndex(0);
    setStep("bracket");
  };

  const answerBracket = (exceedsAnchor: boolean) => {
    if (!polarity || !currentAnchor) return;
    if (exceedsAnchor) {
      if (anchorIndex === anchors.length - 1) {
        setStep("terminal");
        return;
      }
      setAnchorIndex((index) => index + 1);
      return;
    }

    const firstLower =
      polarity === "positive"
        ? canonicalById.get("positive-0-5")!
        : canonicalById.get("negative-0-5")!;
    setLowerAnchor(anchorIndex === 0 ? firstLower : anchors[anchorIndex - 1]);
    setUpperAnchor(currentAnchor);
    setStep("multiplier");
  };

  const calculate = () => {
    if (!lowerAnchor || !upperAnchor || ratioLog === null) return;
    const parsed = Number(multiplier);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Enter a positive numeric multiplier.");
      return;
    }
    if (parsed < 1) {
      setError(`The multiplier must be at least 1 to remain above ${lowerAnchor.label}.`);
      return;
    }
    if (Number.isFinite(ratioLog) && Math.log10(parsed) > ratioLog + 1e-10) {
      setError(
        `That exceeds the full interval. The upper anchor is only ${formatMultiplier(ratioLog)} times ${relationWord}.`,
      );
      return;
    }
    setError("");
    setResult(interpolateScalePosition(lowerAnchor.value, upperAnchor.value, parsed));
    setStep("result");
  };

  const canonize = () => {
    if (result === null || !polarity) return;
    const label = sentenceCase(name);
    onCanonize({
      id: makeId(),
      value: result,
      label,
      fullDescription: label,
      polarity,
      category: "User Canon",
      isCanonical: false,
      createdAt: new Date().toISOString(),
    });
    setCanonized(true);
  };

  const progress =
    step === "name" ? 1 : step === "polarity" ? 2 : step === "bracket" ? 3 : step === "multiplier" ? 4 : 5;

  return (
    <section className="instrument-section wizard-section" aria-labelledby="wizard-heading">
      <div className="section-heading">
        <div>
          <p className="kicker">Classification instrument / BNS–02</p>
          <h2 id="wizard-heading">Action insertion wizard</h2>
        </div>
        <p>Place an uncatalogued act into the canon through controlled logarithmic interpolation.</p>
      </div>

      <div className="wizard-shell">
        <aside className="wizard-progress" aria-label={`Step ${progress} of 5`}>
          <span>Procedure</span>
          {["Name", "Polarity", "Bracket", "Ratio", "Verdict"].map((label, index) => (
            <div className={index + 1 <= progress ? "is-complete" : ""} key={label}>
              <i>{String(index + 1).padStart(2, "0")}</i>
              <b>{label}</b>
            </div>
          ))}
        </aside>

        <div className="wizard-stage" aria-live="polite">
          {step === "name" && (
            <div className="wizard-pane">
              <p className="stage-label">Subject identification</p>
              <h3>What action requires classification?</h3>
              <label className="field-label" htmlFor="action-name">Action name</label>
              <input
                id="action-name"
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && submitName()}
                placeholder="e.g. losing a tooth"
              />
              {error && <p className="field-error">{error}</p>}
              <button className="primary-button" type="button" onClick={submitName}>
                Begin classification <span aria-hidden="true">→</span>
              </button>
            </div>
          )}

          {step === "polarity" && (
            <div className="wizard-pane">
              <p className="stage-label">Directional determination</p>
              <h3>Which way does “{name}” point?</h3>
              <div className="polarity-choices">
                <button className="polarity-choice polarity-choice--negative" type="button" onClick={() => choosePolarity("negative")}>
                  <span>−</span>
                  <strong>Negative / better</strong>
                  <small>Cleanliness, restoration, hygiene, transcendence, salvation.</small>
                </button>
                <button className="polarity-choice polarity-choice--positive" type="button" onClick={() => choosePolarity("positive")}>
                  <span>+</span>
                  <strong>Positive / worse</strong>
                  <small>Defilement, damage, suffering, grossness, catastrophe.</small>
                </button>
              </div>
              <button className="text-button" type="button" onClick={() => setStep("name")}>← Back</button>
            </div>
          )}

          {step === "bracket" && currentAnchor && polarity && (
            <div className="wizard-pane bracket-pane">
              <p className="stage-label">Interval search / {anchorIndex + 1} of {anchors.length}</p>
              <div className={`question-symbol question-symbol--${polarity}`}>{polarity === "negative" ? "−" : "+"}</div>
              <h3>Is {name} {relationWord} than {currentAnchor.label.toLowerCase()}?</h3>
              <p className="question-context">
                Reference: number {formatScaleValue(currentAnchor.value)} — {currentAnchor.fullDescription}.
              </p>
              <div className="button-row">
                <button className="primary-button" type="button" onClick={() => answerBracket(true)}>Yes</button>
                <button className="secondary-button" type="button" onClick={() => answerBracket(false)}>No</button>
              </div>
              <button className="text-button" type="button" onClick={() => setStep("polarity")}>← Change polarity</button>
            </div>
          )}

          {step === "multiplier" && lowerAnchor && upperAnchor && ratioLog !== null && (
            <div className="wizard-pane">
              <p className="stage-label">Logarithmic placement</p>
              <h3>{sentenceCase(name)} is between {lowerAnchor.label.toLowerCase()} and {upperAnchor.label.toLowerCase()}.</h3>
              <div className="interval-readout">
                <span>{formatScaleValue(lowerAnchor.value)}</span>
                <div><i /><b>{formatMultiplier(ratioLog)}× total interval</b><i /></div>
                <span>{formatScaleValue(upperAnchor.value)}</span>
              </div>
              {Number.isFinite(ratioLog) ? (
                <>
                  <label className="field-label" htmlFor="multiplier">
                    How many times {relationWord} than {lowerAnchor.label.toLowerCase()} is it?
                  </label>
                  <input
                    id="multiplier"
                    inputMode="decimal"
                    value={multiplier}
                    onChange={(event) => setMultiplier(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && calculate()}
                    placeholder={ratioLog < 2 ? "e.g. 2" : "e.g. 15"}
                  />
                  {ratioLog > 308 && (
                    <p className="field-note">
                      This interval is tower-exponential. Any ordinary finite multiplier will land extremely close to {formatScaleValue(lowerAnchor.value)}.
                    </p>
                  )}
                  {error && <p className="field-error">{error}</p>}
                  <div className="button-row">
                    <button className="primary-button" type="button" onClick={calculate}>Calculate number</button>
                    <button className="secondary-button" type="button" onClick={() => setStep("bracket")}>Re-bracket</button>
                  </div>
                </>
              ) : (
                <div className="terminal-interval-note">
                  <strong>Ordinary numeric entry ends here.</strong>
                  <p>
                    The ratio from {formatScaleValue(lowerAnchor.value)} to {formatScaleValue(upperAnchor.value)} is {formatMultiplier(ratioLog)}. Every finite JavaScript number lands indistinguishably at {formatScaleValue(lowerAnchor.value)} on this interval.
                  </p>
                  <button className="secondary-button" type="button" onClick={reset}>Classify another action</button>
                </div>
              )}
            </div>
          )}

          {step === "result" && result !== null && lowerAnchor && upperAnchor && ratioLog !== null && (
            <div className="wizard-pane result-pane">
              <p className="stage-label">Classification verdict</p>
              <div className={`result-number result-number--${polarity}`}>{formatScaleValue(result)}</div>
              <h3>{sentenceCase(name)} is number {formatScaleValue(result)} on the Bathroom Number Scale.</h3>
              <p>
                It was placed between {lowerAnchor.label.toLowerCase()} and {upperAnchor.label.toLowerCase()}. You rated it as {multiplier} times {relationWord} than {lowerAnchor.label.toLowerCase()}.
              </p>
              <div className="formula-box">
                <span>Position</span>
                <code>
                  {lowerAnchor.value} + ({upperAnchor.value} − {lowerAnchor.value}) × log({multiplier}) / log({formatMultiplier(ratioLog)}) = {result.toFixed(10)}
                </code>
                <small>
                  {formatPercent(Math.log10(Number(multiplier)) / ratioLog)} of the way through the interval
                </small>
              </div>
              <div className="button-row">
                {!canonized ? (
                  <button className="primary-button" type="button" onClick={canonize}>Canonize this action</button>
                ) : (
                  <button className="primary-button success-button" type="button" onClick={onOpenScale}>Canonized — view on scale</button>
                )}
                <button className="secondary-button" type="button" onClick={reset}>Start over</button>
              </div>
            </div>
          )}

          {step === "terminal" && polarity && (
            <div className="wizard-pane terminal-pane">
              <p className="stage-label">Boundary violation</p>
              <div className={`question-symbol question-symbol--${polarity}`}>!</div>
              <h3>The scale is closed.</h3>
              <p>
                {polarity === "positive"
                  ? "The Bathroom Number Scale has no value above +6. Universal eternal hell is the terminal positive state."
                  : "The Bathroom Number Scale has no value below -6. Universal perfect heaven is the terminal negative state."}
              </p>
              <button className="primary-button" type="button" onClick={reset}>Return to permitted reality</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
