"use client";

export default function JobToggle({ activeTab, onToggle }) {
  return (
    <div className="inline-flex items-center bg-[var(--muted)] rounded-full p-1">
      <button
        onClick={() => onToggle("current")}
        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
          activeTab === "current"
            ? "bg-[var(--accent)] text-white shadow-md"
            : "text-[var(--foreground)]/70 hover:text-[var(--foreground)]"
        }`}
      >
        Current
      </button>
      <button
        onClick={() => onToggle("upcoming")}
        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
          activeTab === "upcoming"
            ? "bg-[var(--accent)] text-white shadow-md"
            : "text-[var(--foreground)]/70 hover:text-[var(--foreground)]"
        }`}
      >
        Upcoming
      </button>
    </div>
  );
}
