"use client";
import { useState, useCallback, useEffect } from "react";

export default function JobToggle({ activeTab: controlledTab, defaultTab = "current", onToggle, onChange }) {
  const isControlled = controlledTab !== undefined;
  const [uncontrolledTab, setUncontrolledTab] = useState(defaultTab);
  const activeTab = isControlled ? controlledTab : uncontrolledTab;

  // unify callbacks
  const triggerChange = useCallback(
    (tab) => {
      try {
        onToggle && onToggle(tab);
      } finally {
        onChange && onChange(tab);
      }
    },
    [onToggle, onChange],
  );

  const setTab = useCallback(
    (tab) => {
      if (!isControlled) setUncontrolledTab(tab);
      triggerChange(tab);
    },
    [isControlled, triggerChange],
  );

  const handleKey = (e, tab) => {
    const key = e.key;
    if (key === "Enter" || key === " ") {
      e.preventDefault();
      setTab(tab);
      return;
    }
    if (key === "ArrowLeft") {
      e.preventDefault();
      setTab("current");
      return;
    }
    if (key === "ArrowRight") {
      e.preventDefault();
      setTab("upcoming");
      return;
    }
    if (key === "Home") {
      e.preventDefault();
      setTab("current");
      return;
    }
    if (key === "End") {
      e.preventDefault();
      setTab("upcoming");
      return;
    }
  };

  // keep uncontrolled state in sync if defaultTab changes
  useEffect(() => {
    if (!isControlled) setUncontrolledTab(defaultTab);
  }, [defaultTab, isControlled]);

  return (
    <div
      role="tablist"
      aria-label="Job timing"
      className="relative inline-flex items-center bg-[var(--muted)] rounded-full p-1 w-full max-w-xs"
    >
      {/* Sliding indicator (50% width) */}
      <span
        aria-hidden
        className={`absolute left-1 top-1 bottom-1 w-1/2 rounded-full bg-[var(--accent)] shadow-sm transform transition-transform duration-250 ease-out motion-reduce:transition-none ${
          activeTab === "upcoming" ? "translate-x-full" : "translate-x-0"
        }`}
      />

      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "current"}
        tabIndex={activeTab === "current" ? 0 : -1}
        onClick={() => setTab("current")}
        onKeyDown={(e) => handleKey(e, "current")}
        className={`relative z-10 flex-1 text-center py-2 text-sm font-medium rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--muted)] transition-colors ${
          activeTab === "current" ? "text-white" : "text-[var(--foreground)]/80"
        }`}
      >
        Current
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "upcoming"}
        tabIndex={activeTab === "upcoming" ? 0 : -1}
        onClick={() => setTab("upcoming")}
        onKeyDown={(e) => handleKey(e, "upcoming")}
        className={`relative z-10 flex-1 text-center py-2 text-sm font-medium rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--muted)] transition-colors ${
          activeTab === "upcoming" ? "text-white" : "text-[var(--foreground)]/80"
        }`}
      >
        Upcoming
      </button>
    </div>
  );
}
