"use client";
import { useMemo } from "react";

export default function FiltersBar({
  query,
  location,
  sort,
  remoteOnly,
  type,
  date,
  loading,
  onChange,
  onSubmit,
}) {
  const disabled = useMemo(() => loading || (!query.trim() && !location.trim()), [loading, query, location]);

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-3 md:grid-cols-[1fr_200px_140px_140px_140px_auto]">
      <input
        type="text"
        placeholder="Search keywords (e.g., frontend react)"
        value={query}
        onChange={(e) => onChange({ query: e.target.value })}
        className="rounded-full border border-[var(--border)] bg-transparent px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
      />
      <input
        type="text"
        placeholder="Location (city/state or remote)"
        value={location}
        onChange={(e) => onChange({ location: e.target.value })}
        className="rounded-full border border-[var(--border)] bg-transparent px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
      />
      <select
        value={sort}
        onChange={(e) => onChange({ sort: e.target.value })}
        className="rounded-full border border-[var(--border)] bg-transparent px-4 py-3 text-sm"
      >
        <option value="relevance">Sort: Relevance</option>
        <option value="date">Sort: Newest</option>
      </select>
      <select
        value={type}
        onChange={(e) => onChange({ type: e.target.value })}
        className="rounded-full border border-[var(--border)] bg-transparent px-4 py-3 text-sm"
      >
        <option value="">Any Type</option>
        <option value="full_time">Full-time</option>
        <option value="part_time">Part-time</option>
        <option value="contract">Contract</option>
        <option value="internship">Internship</option>
        <option value="temporary">Temporary</option>
      </select>
      <select
        value={date}
        onChange={(e) => onChange({ date: e.target.value })}
        className="rounded-full border border-[var(--border)] bg-transparent px-4 py-3 text-sm"
      >
        <option value="">Any Time</option>
        <option value="24h">Last 24h</option>
        <option value="3d">Last 3 days</option>
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
      </select>
      <label className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border)] px-4 py-3 text-sm">
        <input
          type="checkbox"
          className="accent-[var(--accent)]"
          checked={remoteOnly}
          onChange={(e) => onChange({ remoteOnly: e.target.checked })}
        />
        Remote
      </label>
      <button
        type="submit"
        disabled={disabled}
        className="rounded-full bg-[var(--accent)] text-white px-6 py-3 text-sm shadow-[0_6px_24px_rgba(0,0,0,0.20)] disabled:opacity-60 md:col-span-6"
      >
        {loading ? "Searching…" : "Search"}
      </button>
    </form>
  );
}


