import { useMemo, useState } from "react";
import { AboutMath } from "./components/AboutMath";
import { ActionInsertionWizard } from "./components/ActionInsertionWizard";
import { ComparisonTool } from "./components/ComparisonTool";
import { NetBathroomCalculator } from "./components/NetBathroomCalculator";
import { ScaleViewer } from "./components/ScaleViewer";
import { Tabs, type TabId } from "./components/Tabs";
import { canonicalScale } from "./data/canonicalScale";
import { useCustomActions } from "./hooks/useCustomActions";

function App() {
  const [activeTab, setActiveTab] = useState<TabId>("scale");
  const { actions: customActions, addAction, deleteAction } = useCustomActions();
  const allActions = useMemo(() => [...canonicalScale, ...customActions], [customActions]);

  const navigate = (tab: TabId) => {
    setActiveTab(tab);
    window.requestAnimationFrame(() => {
      document.getElementById("instrument-deck")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="app-shell">
      <header className="masthead">
        <a className="wordmark" href="#top" aria-label="Bathroom Number Scale home">
          <span>BNS</span>
          <b>Institute for Bathroom Metrology</b>
        </a>
        <div className="masthead-meta">
          <span>Closed system</span>
          <span>Rev. 1.0</span>
          <span>−6 → +6</span>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="kicker">The definitive signed taxonomy</p>
            <h1>
              The Bathroom
              <span>Number Scale</span>
            </h1>
            <p className="hero-subtitle">
              A signed, tower-exponential taxonomy of hygiene, defilement, salvation, and damnation.
            </p>
            <div className="hero-actions">
              <button className="primary-button" type="button" onClick={() => navigate("scale")}>
                View the scale <span aria-hidden="true">↓</span>
              </button>
              <button className="secondary-button" type="button" onClick={() => navigate("classify")}>
                Classify an action
              </button>
            </div>
          </div>

          <div className="hero-instrument" aria-label="Bathroom scale overview">
            <div className="instrument-topline">
              <span>Polarity calibration</span>
              <i>Closed range</i>
            </div>

            <div className="polarity-calibration">
              <div className="calibration-zones" aria-hidden="true">
                <span className="calibration-zone calibration-zone--negative">← Restorative polarity</span>
                <span className="calibration-zone calibration-zone--positive">Defiling polarity →</span>
              </div>

              <div className="calibration-track">
                <div className="calibration-rail calibration-rail--negative" aria-hidden="true">
                  <i /><i /><i /><i /><i /><i />
                </div>
                <div className="calibration-zero">
                  <small>neutral state</small>
                  <b>0</b>
                  <span>calm mirror-gazing</span>
                </div>
                <div className="calibration-rail calibration-rail--positive" aria-hidden="true">
                  <i /><i /><i /><i /><i /><i />
                </div>
              </div>

              <div className="calibration-terminals">
                <div className="calibration-terminal calibration-terminal--negative">
                  <span>−6</span>
                  <div><small>Restorative terminus</small><strong>Universal perfect heaven</strong></div>
                </div>
                <div className="calibration-terminal calibration-terminal--positive">
                  <span>+6</span>
                  <div><small>Defiling terminus</small><strong>Universal eternal hell</strong></div>
                </div>
              </div>
            </div>

            <div className="instrument-note">
              <span>Nonlinear magnitude</span>
              <p>Equal spacing marks ordinal position only. Force escalates by right-associative powers of three.</p>
            </div>
          </div>
        </section>

        <section className="axiom-strip" aria-label="Core scale axioms">
          <div><span>01</span><p><b>Signed</b>Negative restores. Positive defiles.</p></div>
          <div><span>02</span><p><b>Nonlinear</b>A shower equals 81 handwashes.</p></div>
          <div><span>03</span><p><b>Closed</b>Nothing exceeds universal heaven or hell.</p></div>
        </section>

        <div className="instrument-deck" id="instrument-deck">
          <Tabs activeTab={activeTab} onChange={setActiveTab} />
          <div
            className="tab-panel"
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
          >
            {activeTab === "scale" && (
              <ScaleViewer customActions={customActions} onDeleteCustom={deleteAction} />
            )}
            {activeTab === "classify" && (
              <ActionInsertionWizard
                onCanonize={addAction}
                onOpenScale={() => setActiveTab("scale")}
              />
            )}
            {activeTab === "compare" && <ComparisonTool actions={allActions} />}
            {activeTab === "net" && <NetBathroomCalculator actions={allActions} />}
            {activeTab === "about" && <AboutMath />}
          </div>
        </div>
      </main>

      <footer className="site-footer">
        <div>
          <span>BNS</span>
          <p>Institute for Bathroom Metrology<br />Standards Division</p>
        </div>
        <p>
          Custom actions remain on this device. No observations are transmitted beyond the chamber.
        </p>
        <a href="#top">Return to zero ↑</a>
      </footer>
    </div>
  );
}

export default App;
