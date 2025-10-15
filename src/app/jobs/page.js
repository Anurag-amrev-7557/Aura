"use client";
import { useState } from "react";
import JobFilters from "@/components/jobs/JobFilters";
import JobListings from "@/components/jobs/JobListings";
import SortDropdown from "@/components/jobs/SortDropdown";

export default function JobsPage() {
  const [activeTab, setActiveTab] = useState("current");
  const [filters, setFilters] = useState({
    jobType: [],
    location: [],
    stipendRange: { min: 0, max: 100000 },
    durationRange: { min: 0, max: 12 },
    companySize: [],
    experienceLevel: [],
    industry: [],
    skills: [],
    workMode: [],
    datePosted: [],
    benefits: [],
  });
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortSelection, setSortSelection] = useState("relevance");

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen relative bg-[var(--background)]">
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header - Minimalist, modern, detailed */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
                Find your next role
              </h1>
              <p className="mt-1 text-[var(--foreground)]/60 text-sm sm:text-base">
                Curated listings updated daily — filter by role, location, company or skills.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Job count (placeholder number) and sort control */}
              <div className="hidden sm:flex items-center gap-4 text-sm text-[var(--foreground)]/70">
                <span className="font-medium">1,254</span>
                <span className="text-[var(--foreground)]/40">results</span>
              </div>

              <label className="sr-only" htmlFor="job-search">Search jobs</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
                </svg>
                  <input
                    id="job-search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search job titles, companies, or skills"
                    className="pl-10 pr-3 py-2 rounded-full border border-[var(--border)] bg-[var(--background)] text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[var(--muted)]"
                  />
              </div>

              <div className="hidden sm:block">
                <SortDropdown
                  options={[
                    { value: "relevance", label: "Sort: Relevance" },
                    { value: "newest", label: "Newest" },
                    { value: "remote", label: "Remote" },
                    { value: "highest", label: "Highest stipend" },
                  ]}
                  value={sortSelection}
                  onChange={(v) => setSortSelection(v)}
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex items-center justify-between">
            <div />
                <div className="flex items-center gap-4">
              {/* Tabs removed, defaulting to current listings */}
            </div>
          </div>
        </div>

        {/* Mobile Filter Button */}
        <div className="flex items-center justify-end mb-6 lg:hidden">
          <button
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-full hover:bg-[var(--muted)] transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span className="text-sm font-medium">Filters</span>
          </button>
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6 relative">
          {/* Desktop Filters - Hidden on Mobile */}
          <div className="hidden lg:block">
            <JobFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </div>

          {/* Mobile Filters - Shown as Modal/Drawer */}
          {isMobileFiltersOpen && (
            <div
              className="lg:hidden fixed inset-0 z-50 bg-black/50"
              onClick={() => setIsMobileFiltersOpen(false)}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-80 bg-[var(--background)] overflow-y-auto p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <button
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="p-2 hover:bg-[var(--muted)] rounded-full"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <JobFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                />
              </div>
            </div>
          )}

          {/* Job Listings (controlled by filters toggler) */}
          <JobListings activeTab={activeTab} filters={filters} searchQuery={searchQuery} sortSelection={sortSelection} />
        </div>
      </main>
    </div>
  );
}
