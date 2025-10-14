"use client";
import { useState } from "react";
import JobFilters from "@/components/jobs/JobFilters";
import JobToggle from "@/components/jobs/JobToggle";
import JobListings from "@/components/jobs/JobListings";

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

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen relative bg-[var(--background)]">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
            Discover Your Next Opportunity
          </h1>
          <p className="text-[var(--foreground)]/70 text-base sm:text-lg">
            Browse through hundreds of job openings and find the perfect match
            for your skills
          </p>
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

          {/* Job Listings */}
          <JobListings activeTab={activeTab} filters={filters} />
        </div>
      </main>
    </div>
  );
}
