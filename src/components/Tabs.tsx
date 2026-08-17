import type { KeyboardEvent } from "react";

export type TabId = "scale" | "classify" | "compare" | "net" | "about";

interface TabDefinition {
  id: TabId;
  index: string;
  label: string;
}

const tabs: TabDefinition[] = [
  { id: "scale", index: "01", label: "Scale" },
  { id: "classify", index: "02", label: "Classify" },
  { id: "compare", index: "03", label: "Compare" },
  { id: "net", index: "04", label: "Net force" },
  { id: "about", index: "05", label: "Theory" },
];

interface TabsProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

export function Tabs({ activeTab, onChange }: TabsProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, tabIndex: number) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (tabIndex + direction + tabs.length) % tabs.length;
    const next = tabs[nextIndex];
    onChange(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  };

  return (
    <nav className="tabs" aria-label="Bathroom instruments" role="tablist">
      {tabs.map((tab, index) => (
        <button
          className={`tab ${activeTab === tab.id ? "is-active" : ""}`}
          id={`tab-${tab.id}`}
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          tabIndex={activeTab === tab.id ? 0 : -1}
          onClick={() => onChange(tab.id)}
          onKeyDown={(event) => handleKeyDown(event, index)}
        >
          <span>{tab.index}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
