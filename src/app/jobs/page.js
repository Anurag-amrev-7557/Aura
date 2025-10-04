"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FiltersBar from "@/components/jobs/FiltersBar";
import JobList from "@/components/jobs/JobList";

function useDebouncedCallback(fn, delayMs) {
  const timeoutRef = useRef(null);
  return useCallback(
    (...args) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => fn(...args), delayMs);
    },
    [fn, delayMs],
  );
}

export default function JobsPage() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("relevance");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [jobs, setJobs] = useState([]);

  const disabled = useMemo(
    () => loading || (!query.trim() && !location.trim()),
    [loading, query, location],
  );

  const buildParams = useCallback(
    (p = 1) => {
      const params = new URLSearchParams();
      params.set("q", (query || "software engineer").slice(0, 300));
      // always pass user-provided location; JSearch supports remote with location
      params.set("where", (location || "global").slice(0, 80));
      params.set("page", String(p));
      if (sort && sort !== "relevance") params.set("sort", sort);
      if (remoteOnly) params.set("remote", "true");
      if (type) params.set("type", type);
      if (date) params.set("date", date);
      return params;
    },
    [query, location, sort, remoteOnly, type, date],
  );

  const syncUrl = useCallback(
    (p = 1, mode = "push") => {
      const params = buildParams(p);
      const url = `?${params.toString()}`;
      if (typeof window !== "undefined") {
        if (mode === "replace") window.history.replaceState(null, "", url);
        else window.history.pushState(null, "", url);
      }
    },
    [buildParams],
  );

  const fetchPage = useCallback(
    async (p) => {
      setLoading(true);
      setError("");
      try {
        return [];
      } catch (e) {
        setError(e.message || "Search failed");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [buildParams],
  );

  const onSubmit = useCallback(
    async (e) => {
      e?.preventDefault();
      setJobs([]);
      const first = await fetchPage(1);
      setJobs(first);
      syncUrl(1, "push");
    },
    [fetchPage, syncUrl],
  );

  const debouncedSearch = useDebouncedCallback(() => {
    onSubmit();
  }, 500);

  function onChange(next) {
    if (Object.prototype.hasOwnProperty.call(next, "query"))
      setQuery(next.query);
    if (Object.prototype.hasOwnProperty.call(next, "location"))
      setLocation(next.location);
    if (Object.prototype.hasOwnProperty.call(next, "sort")) setSort(next.sort);
    if (Object.prototype.hasOwnProperty.call(next, "remoteOnly"))
      setRemoteOnly(next.remoteOnly);
    if (Object.prototype.hasOwnProperty.call(next, "type")) setType(next.type);
    if (Object.prototype.hasOwnProperty.call(next, "date")) setDate(next.date);
    debouncedSearch();
  }

  async function onLoadMore() {
    const nextPage = page + 1;
    const more = await fetchPage(nextPage);
    if (more.length) setJobs((prev) => [...prev, ...more]);
    syncUrl(nextPage, "push");
  }

  useEffect(() => {
    // Hydrate from URL on first load
    const sp = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : "",
    );
    const q = sp.get("q");
    const w = sp.get("where");
    const s = sp.get("sort");
    const r = sp.get("remote");
    const t = sp.get("type");
    const d = sp.get("date");
    const p = parseInt(sp.get("page") || "1", 10) || 1;
    if (q) setQuery(q);
    if (w) setLocation(w);
    if (s) setSort(s);
    if (r === "true") setRemoteOnly(true);
    if (t) setType(t);
    if (d) setDate(d);
    (async () => {
      const first = await fetchPage(p);
      setJobs(first);
      syncUrl(p, "replace");
    })();

    function onPopState() {
      const sp2 = new URLSearchParams(window.location.search);
      const q2 = sp2.get("q") || "";
      const w2 = sp2.get("where") || "";
      const s2 = sp2.get("sort") || "relevance";
      const r2 = sp2.get("remote") === "true";
      const t2 = sp2.get("type") || "";
      const d2 = sp2.get("date") || "";
      const p2 = parseInt(sp2.get("page") || "1", 10) || 1;
      setQuery(q2);
      setLocation(w2);
      setSort(s2);
      setRemoteOnly(r2);
      setType(t2);
      setDate(d2);
      (async () => {
        const list = await fetchPage(p2);
        setJobs(list);
      })();
    }
    if (typeof window !== "undefined") {
      window.addEventListener("popstate", onPopState);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("popstate", onPopState);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen relative">
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Find Jobs
          </h1>
          <p className="mt-3 text-[var(--foreground)]/70">
            Use filters and sorting to refine listings.
          </p>
        </div>

        <FiltersBar
          query={query}
          location={location}
          sort={sort}
          remoteOnly={remoteOnly}
          type={type}
          date={date}
          loading={loading}
          onChange={onChange}
          onSubmit={onSubmit}
        />

        <JobList
          jobs={jobs}
          loading={loading}
          error={error}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
        />
      </main>
    </div>
  );
}
