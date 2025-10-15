"use client";
import { useState, useEffect, useMemo } from "react";
import JobCard from "./JobCard";

// Mock data - Replace with actual API calls
const mockJobs = {
  current: [
    {
      id: 1,
      title: "Senior Frontend Developer",
      companyName: "TechCorp Inc.",
      companyLogo: null,
      jobType: "fulltime",
      location: "Remote",
      stipend: 120000,
      duration: null,
      skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
      description:
        "We're looking for an experienced frontend developer to join our growing team. You'll work on cutting-edge web applications using modern technologies.",
      postedDate: "2 days ago",
      isBookmarked: false,
    },
    {
      id: 2,
      title: "UX/UI Design Intern",
      companyName: "DesignStudio",
      companyLogo: null,
      jobType: "internship",
      location: "Bangalore, Hybrid",
      stipend: 25000,
      duration: 6,
      skills: ["Figma", "Adobe XD", "User Research", "Prototyping"],
      description:
        "Join our design team and work on exciting projects for leading brands. Perfect opportunity for design students.",
      postedDate: "1 week ago",
      isBookmarked: true,
    },
    {
      id: 3,
      title: "Backend Engineer",
      companyName: "CloudSystems",
      companyLogo: null,
      jobType: "fulltime",
      location: "Mumbai, On-site",
      stipend: 150000,
      duration: null,
      skills: ["Node.js", "Python", "AWS", "Docker", "PostgreSQL"],
      description:
        "Build scalable backend systems for our cloud infrastructure platform. Experience with microservices architecture required.",
      postedDate: "3 days ago",
      isBookmarked: false,
    },
    {
      id: 4,
      title: "Data Science Intern",
      companyName: "AI Analytics",
      companyLogo: null,
      jobType: "internship",
      location: "Remote",
      stipend: 30000,
      duration: 3,
      skills: ["Python", "Machine Learning", "TensorFlow", "Data Analysis"],
      description:
        "Work on real-world machine learning projects and gain hands-on experience with AI technologies.",
      postedDate: "5 days ago",
      isBookmarked: false,
    },
    {
      id: 5,
      title: "Product Manager",
      companyName: "StartupHub",
      companyLogo: null,
      jobType: "fulltime",
      location: "Delhi, Hybrid",
      stipend: 180000,
      duration: null,
      skills: ["Product Strategy", "Agile", "User Stories", "Analytics"],
      description:
        "Lead product development for our SaaS platform. Experience in B2B products preferred.",
      postedDate: "1 day ago",
      isBookmarked: true,
    },
    {
      id: 6,
      title: "Marketing Coordinator",
      companyName: "GrowthAgency",
      companyLogo: null,
      jobType: "parttime",
      location: "Pune, Remote",
      stipend: 40000,
      duration: null,
      skills: ["Digital Marketing", "SEO", "Content Marketing", "Analytics"],
      description:
        "Help us execute marketing campaigns for our clients. Perfect for students or part-time professionals.",
      postedDate: "4 days ago",
      isBookmarked: false,
    },
  ],
  upcoming: [
    {
      id: 7,
      title: "Mobile App Developer",
      companyName: "AppWorks",
      companyLogo: null,
      jobType: "fulltime",
      location: "Bangalore, On-site",
      stipend: 140000,
      duration: null,
      skills: ["React Native", "iOS", "Android", "Firebase"],
      description:
        "Build cross-platform mobile applications for our enterprise clients.",
      expectedStartDate: "2025-11-15",
      postedDate: "1 week ago",
      isBookmarked: false,
    },
    {
      id: 8,
      title: "Content Writing Intern",
      companyName: "MediaCo",
      companyLogo: null,
      jobType: "internship",
      location: "Remote",
      stipend: 15000,
      duration: 4,
      skills: ["Content Writing", "SEO", "Research", "Editing"],
      description:
        "Create engaging content for our blog and social media channels.",
      expectedStartDate: "2025-11-01",
      postedDate: "3 days ago",
      isBookmarked: false,
    },
    {
      id: 9,
      title: "DevOps Engineer",
      companyName: "InfraTech",
      companyLogo: null,
      jobType: "contract",
      location: "Hyderabad, Hybrid",
      stipend: 160000,
      duration: 12,
      skills: ["Kubernetes", "CI/CD", "Terraform", "AWS"],
      description:
        "Manage and optimize our cloud infrastructure and deployment pipelines.",
      expectedStartDate: "2025-12-01",
      postedDate: "2 days ago",
      isBookmarked: true,
    },
  ],
};

export default function JobListings({ activeTab, filters, searchQuery = "", sortSelection = "relevance" }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [total, setTotal] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  // sortSelection is passed from parent and maps to local sortBy
  const mapSelectionToSortBy = (sel) => {
    switch (sel) {
      case "highest":
        return "stipend-high";
      case "lowest":
        return "stipend-low";
      case "newest":
        return "recent";
      case "relevance":
      default:
        return "recent";
    }
  };
  const sortBy = mapSelectionToSortBy(sortSelection);

  function normalizeJobType(v) {
    if (!v) return '';
    const s = String(v).trim().toLowerCase();
    // remove non-word characters
    const cleaned = s.replace(/[^a-z0-9]+/g, '');
    if (cleaned.startsWith('full')) return 'fulltime';
    if (cleaned.startsWith('part')) return 'parttime';
    if (cleaned.includes('intern')) return 'internship';
    if (cleaned.includes('contract')) return 'contract';
    return cleaned; // fallback, JobCard will attempt to render label
  }

  // Debounce searchQuery to avoid too many requests
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Reset pagination when search, filters or tab change
  useEffect(() => {
    setPage(1);
    setTotal(null);
  }, [debouncedQuery, JSON.stringify(filters), activeTab]);

  useEffect(() => {
    let aborted = false;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const qParam = debouncedQuery ? `q=${encodeURIComponent(debouncedQuery)}` : "";
        const src = "remotive"; // default source; could be exposed via props
        const url = `/api/external-jobs?${qParam}${qParam ? "&" : ""}page=${page}&perPage=${perPage}&source=${src}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Search proxy error: ${res.status}`);
        const json = await res.json();
        const hits = Array.isArray(json.hits) ? json.hits : [];

        // Map external hits to UI job shape expected by JobCard
        const mapped = hits.map((h) => {
          const description = (h.description || "")
            .replace(/<[^>]*>/g, "")
            .trim();
          const companyName = (h.company && h.company.name) || (h.raw && (h.raw.company_name || h.raw.company?.name)) || "";
          // prefer proxy URL provided by the API (companyLogoProxy) so client can directly request the proxied image
          const companyLogo = h.companyLogoProxy || (h.company && h.company.logo) || (h.raw && (h.raw.company_logo || null)) || null;
          const locationStr = (h.location && (h.location.city || h.location.region || h.location.country)) || (h.raw && (h.raw.candidate_required_location || "")) || "";

          const postedDate = h.posted_at ? timeAgo(h.posted_at) : (h.raw && h.raw.publication_date) || "";

          return {
            id: h.id,
            title: h.title || "",
            companyName,
            companyLogo,
            jobType: normalizeJobType(h.employment_type || (h.raw && h.raw.job_type) || (h.remote ? "fulltime" : "fulltime") || ""),
            location: locationStr,
            // robust stipend extraction: try multiple possible fields, fallback to null if unknown
            stipend: (function() {
              if (h.stipend) return h.stipend;
              if (h.raw) {
                const r = h.raw;
                return r.salary || r.salary_min || r.salary_max || r.remuneration || r.compensation || r.stipend || null;
              }
              return null;
            })(),
            duration: null,
            skills: Array.isArray(h.skills) ? h.skills : (h.raw && h.raw.tags) || [],
            description,
            postedDate,
            expectedStartDate: null,
            isBookmarked: false,
            raw: h
          };
        });

        if (!aborted) {
          // append or replace depending on page
          const searched = applySearch(mapped, debouncedQuery);
          const filteredJobs = applyFilters(searched, filters);
          const sortedJobs = sortJobs(filteredJobs, sortBy);

          setTotal(typeof json.total === 'number' ? json.total : (json.total ? Number(json.total) : null));

          setJobs((prev) => {
            if (page > 1) {
              // append and dedupe by id
              const combined = [...prev, ...sortedJobs];
              const seen = new Set();
              return combined.filter((j) => {
                if (seen.has(j.id)) return false;
                seen.add(j.id);
                return true;
              });
            }
            return sortedJobs;
          });
        }
      } catch (err) {
        if (!aborted) {
          console.error('JobListings fetch error', err);
          setError(err.message || 'Failed to load jobs');
          // fallback to existing mock data to keep UI functional
          const jobList = mockJobs[activeTab] || [];
          const searched = applySearch(jobList, debouncedQuery);
          const filteredJobs = applyFilters(searched, filters);
          const sortedJobs = sortJobs(filteredJobs, sortBy);
          setJobs(sortedJobs);
        }
      } finally {
        if (!aborted) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    }

    load();
    return () => {
      aborted = true;
      controller.abort();
    };
  }, [activeTab, filters, sortBy, debouncedQuery, page]);

  const applySearch = (jobList, query) => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return jobList;
    return jobList.filter((job) => {
      if (job.title?.toLowerCase().includes(q)) return true;
      if (job.companyName?.toLowerCase().includes(q)) return true;
      if (
        Array.isArray(job.skills) &&
        job.skills.some((s) => s.toLowerCase().includes(q))
      )
        return true;
      return false;
    });
  };

  function timeAgo(iso) {
    try {
      const d = new Date(iso);
      const diff = Date.now() - d.getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      if (days > 1) return `${days} days ago`;
      if (days === 1) return `1 day ago`;
      if (hours >= 1) return `${hours}h ago`;
      if (minutes >= 1) return `${minutes}m ago`;
      return `just now`;
    } catch (e) {
      return iso;
    }
  }

  const applyFilters = (jobList, filters) => {
    return jobList.filter((job) => {
      // Job Type filter
      if (
        filters.jobType?.length > 0 &&
        !filters.jobType.includes(job.jobType)
      ) {
        return false;
      }

      // Location filter
      if (filters.location?.length > 0) {
        const locationMatch = filters.location.some((loc) =>
          job.location.toLowerCase().includes(loc),
        );
        if (!locationMatch) return false;
      }

      // Stipend filter
      if (filters.stipendRange) {
        if (
          job.stipend < filters.stipendRange.min ||
          job.stipend > filters.stipendRange.max
        ) {
          return false;
        }
      }

      // Duration filter
      if (filters.durationRange && job.duration) {
        if (
          job.duration < filters.durationRange.min ||
          job.duration > filters.durationRange.max
        ) {
          return false;
        }
      }

      return true;
    });
  };

  const sortJobs = (jobList, sortBy) => {
    const sorted = [...jobList];
    switch (sortBy) {
      case "stipend-high":
        return sorted.sort((a, b) => b.stipend - a.stipend);
      case "stipend-low":
        return sorted.sort((a, b) => a.stipend - b.stipend);
      case "recent":
      default:
        return sorted;
    }
  };

  return (
    <div className="flex-1">

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-6 animate-pulse"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 bg-[var(--muted)] rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-[var(--muted)] rounded w-3/4"></div>
                  <div className="h-4 bg-[var(--muted)] rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-[var(--muted)] rounded w-full"></div>
                <div className="h-4 bg-[var(--muted)] rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Job Cards */}
      {!loading && jobs.length > 0 && (
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isUpcoming={activeTab === "upcoming"}
            />
          ))}
        </div>
      )}

      {/* Load more */}
      {!loading && total !== null && jobs.length < total && (
        <div className="pt-6 text-center">
          <button
            onClick={() => {
              setLoadingMore(true);
              setPage((p) => p + 1);
            }}
            className="px-4 py-2 bg-[var(--accent)] text-white rounded-md"
            aria-label="Load more jobs"
          >
            {loadingMore ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && jobs.length === 0 && (
        <div className="text-center py-16">
          <svg
            className="w-16 h-16 mx-auto text-[var(--foreground)]/30 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
            No jobs found
          </h3>
          <p className="text-sm text-[var(--foreground)]/70">
            Try adjusting your filters to see more results
          </p>
        </div>
      )}
    </div>
  );
}
