"use client";

export default function JobList({ jobs, loading, error, onLoadMore, hasMore }) {
  return (
    <div className="mt-8">
      {error ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 text-sm text-red-600 dark:text-red-400">{error}</div>
      ) : null}

      <ul className="mt-4 space-y-4">
        {jobs.map((j) => (
          <li key={j.id} className="rounded-2xl border border-[var(--border)] p-5 bg-[var(--background)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-medium">{j.title}</div>
                <div className="text-sm text-[var(--foreground)]/70">{j.company}{j.location ? ` • ${j.location}` : ""}</div>
              </div>
              {j.link ? (
                <a href={j.link} target="_blank" rel="noreferrer" className="text-sm underline underline-offset-4">Apply</a>
              ) : null}
            </div>
            {j.description ? (
              <div className="mt-3 text-sm text-[var(--foreground)]/80 line-clamp-3">{j.description}</div>
            ) : null}
          </li>
        ))}
        {!loading && jobs.length === 0 ? (
          <li className="rounded-2xl border border-[var(--border)] p-5 text-sm text-[var(--foreground)]/70">No jobs found. Try different keywords or locations.</li>
        ) : null}
      </ul>

      <div className="mt-6 flex justify-center">
        {hasMore ? (
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="rounded-full border border-[var(--border)] bg-transparent px-6 py-3 text-sm disabled:opacity-60"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        ) : null}
      </div>
    </div>
  );
}


