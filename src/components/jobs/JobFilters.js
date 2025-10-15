"use client";
import { useState, useEffect } from "react";
import JobToggle from "./JobToggle";

export default function JobFilters({
  filters,
  onFilterChange,
  activeTab,
  onTabChange,
}) {
  // Local state for range sliders to avoid losing focus while dragging
  const [localStipend, setLocalStipend] = useState({
    min: filters.stipendRange?.min ?? 0,
    max: filters.stipendRange?.max ?? 100000,
  });
  const [localDuration, setLocalDuration] = useState({
    min: filters.durationRange?.min ?? 0,
    max: filters.durationRange?.max ?? 12,
  });

  // Keep local state in sync when filters prop changes externally
  useEffect(() => {
    setLocalStipend({
      min: filters.stipendRange?.min ?? 0,
      max: filters.stipendRange?.max ?? 100000,
    });
    setLocalDuration({
      min: filters.durationRange?.min ?? 0,
      max: filters.durationRange?.max ?? 12,
    });
  }, [filters.stipendRange?.min, filters.stipendRange?.max, filters.durationRange?.min, filters.durationRange?.max]);

  const [expandedSections, setExpandedSections] = useState({
    jobType: true,
    location: true,
    stipend: true,
    duration: true,
    company: true,
    experience: false,
    industry: false,
    skills: false,
    workMode: false,
    datePosted: false,
    benefits: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCheckboxChange = (category, value) => {
    const currentValues = filters[category] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    onFilterChange({ ...filters, [category]: newValues });
  };

  const handleRangeChange = (category, min, max) => {
    onFilterChange({ ...filters, [category]: { min, max } });
  };

  const clearAllFilters = () => {
    onFilterChange({
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
  };

  const FilterSection = ({ title, isExpanded, onToggle, children }) => (
    <div className="border-b border-[var(--border)] pb-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="font-medium text-sm">{title}</h3>
        <svg
          className={`w-4 h-4 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isExpanded && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );

  const CheckboxItem = ({ label, checked, onChange }) => (
    <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--foreground)]/80 hover:text-[var(--foreground)]">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)]"
      />
      <span>{label}</span>
    </label>
  );

  return (
    <aside className="w-full lg:w-72 bg-[var(--background)] border border-[var(--border)] rounded-2xl p-6 h-fit sticky top-24">
      {/* Toggle Section */}
      <div className="mb-6 pb-6 border-b border-[var(--border)]">
        <JobToggle activeTab={activeTab} onToggle={onTabChange} />
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Filters</h2>
        <button
          onClick={clearAllFilters}
          className="text-sm text-[var(--accent)] hover:underline"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-4">
        {/* Job Type */}
        <FilterSection
          title="Job Type"
          isExpanded={expandedSections.jobType}
          onToggle={() => toggleSection("jobType")}
        >
          <CheckboxItem
            label="Full-time"
            checked={filters.jobType?.includes("fulltime")}
            onChange={() => handleCheckboxChange("jobType", "fulltime")}
          />
          <CheckboxItem
            label="Part-time"
            checked={filters.jobType?.includes("parttime")}
            onChange={() => handleCheckboxChange("jobType", "parttime")}
          />
          <CheckboxItem
            label="Internship"
            checked={filters.jobType?.includes("internship")}
            onChange={() => handleCheckboxChange("jobType", "internship")}
          />
          <CheckboxItem
            label="Contract"
            checked={filters.jobType?.includes("contract")}
            onChange={() => handleCheckboxChange("jobType", "contract")}
          />
        </FilterSection>

        {/* Location */}
        <FilterSection
          title="Location"
          isExpanded={expandedSections.location}
          onToggle={() => toggleSection("location")}
        >
          <CheckboxItem
            label="Remote"
            checked={filters.location?.includes("remote")}
            onChange={() => handleCheckboxChange("location", "remote")}
          />
          <CheckboxItem
            label="On-site"
            checked={filters.location?.includes("onsite")}
            onChange={() => handleCheckboxChange("location", "onsite")}
          />
          <CheckboxItem
            label="Hybrid"
            checked={filters.location?.includes("hybrid")}
            onChange={() => handleCheckboxChange("location", "hybrid")}
          />
        </FilterSection>

        {/* Stipend Range */}
        <FilterSection
          title="Stipend/Salary (Monthly)"
          isExpanded={expandedSections.stipend}
          onToggle={() => toggleSection("stipend")}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[var(--foreground)]/60">
                  Minimum
                </label>
                <span className="text-xs font-semibold text-[var(--accent)] px-2 py-0.5 bg-[var(--accent)]/10 rounded">
                  ₹{(filters.stipendRange?.min || 0).toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100000"
                value={localStipend.min}
                onChange={(e) =>
                  setLocalStipend((s) => ({ ...s, min: parseInt(e.target.value) }))
                }
                onPointerUp={() =>
                  handleRangeChange(
                    "stipendRange",
                    localStipend.min,
                    localStipend.max,
                  )
                }
                onBlur={() =>
                  handleRangeChange(
                    "stipendRange",
                    localStipend.min,
                    localStipend.max,
                  )
                }
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[var(--foreground)]/60">
                  Maximum
                </label>
                <span className="text-xs font-semibold text-[var(--accent)] px-2 py-0.5 bg-[var(--accent)]/10 rounded">
                  ₹{(filters.stipendRange?.max || 100000).toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100000"
                value={localStipend.max}
                onChange={(e) =>
                  setLocalStipend((s) => ({ ...s, max: parseInt(e.target.value) }))
                }
                onPointerUp={() =>
                  handleRangeChange(
                    "stipendRange",
                    localStipend.min,
                    localStipend.max,
                  )
                }
                onBlur={() =>
                  handleRangeChange(
                    "stipendRange",
                    localStipend.min,
                    localStipend.max,
                  )
                }
                className="w-full"
              />
            </div>
          </div>
        </FilterSection>

        {/* Duration */}
        <FilterSection
          title="Duration (Months)"
          isExpanded={expandedSections.duration}
          onToggle={() => toggleSection("duration")}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[var(--foreground)]/60">
                  Minimum
                </label>
                <span className="text-xs font-semibold text-[var(--accent)] px-2 py-0.5 bg-[var(--accent)]/10 rounded">
                  {filters.durationRange?.min || 0}{" "}
                  {(filters.durationRange?.min || 0) === 1 ? "month" : "months"}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="1"
                value={localDuration.min}
                onChange={(e) =>
                  setLocalDuration((d) => ({ ...d, min: parseInt(e.target.value) }))
                }
                onPointerUp={() =>
                  handleRangeChange(
                    "durationRange",
                    localDuration.min,
                    localDuration.max,
                  )
                }
                onBlur={() =>
                  handleRangeChange(
                    "durationRange",
                    localDuration.min,
                    localDuration.max,
                  )
                }
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[var(--foreground)]/60">
                  Maximum
                </label>
                <span className="text-xs font-semibold text-[var(--accent)] px-2 py-0.5 bg-[var(--accent)]/10 rounded">
                  {filters.durationRange?.max || 12}{" "}
                  {(filters.durationRange?.max || 12) === 1
                    ? "month"
                    : "months"}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="1"
                value={localDuration.max}
                onChange={(e) =>
                  setLocalDuration((d) => ({ ...d, max: parseInt(e.target.value) }))
                }
                onPointerUp={() =>
                  handleRangeChange(
                    "durationRange",
                    localDuration.min,
                    localDuration.max,
                  )
                }
                onBlur={() =>
                  handleRangeChange(
                    "durationRange",
                    localDuration.min,
                    localDuration.max,
                  )
                }
                className="w-full"
              />
            </div>
          </div>
        </FilterSection>

        {/* Company Size */}
        <FilterSection
          title="Company Size"
          isExpanded={expandedSections.company}
          onToggle={() => toggleSection("company")}
        >
          <CheckboxItem
            label="Startup (1-50)"
            checked={filters.companySize?.includes("startup")}
            onChange={() => handleCheckboxChange("companySize", "startup")}
          />
          <CheckboxItem
            label="Mid-size (51-500)"
            checked={filters.companySize?.includes("midsize")}
            onChange={() => handleCheckboxChange("companySize", "midsize")}
          />
          <CheckboxItem
            label="Enterprise (500+)"
            checked={filters.companySize?.includes("enterprise")}
            onChange={() => handleCheckboxChange("companySize", "enterprise")}
          />
        </FilterSection>

        {/* Experience Level */}
        <FilterSection
          title="Experience Level"
          isExpanded={expandedSections.experience}
          onToggle={() => toggleSection("experience")}
        >
          <CheckboxItem
            label="Entry Level (0-1 years)"
            checked={filters.experienceLevel?.includes("entry")}
            onChange={() => handleCheckboxChange("experienceLevel", "entry")}
          />
          <CheckboxItem
            label="Junior (1-3 years)"
            checked={filters.experienceLevel?.includes("junior")}
            onChange={() => handleCheckboxChange("experienceLevel", "junior")}
          />
          <CheckboxItem
            label="Mid-Level (3-5 years)"
            checked={filters.experienceLevel?.includes("mid")}
            onChange={() => handleCheckboxChange("experienceLevel", "mid")}
          />
          <CheckboxItem
            label="Senior (5+ years)"
            checked={filters.experienceLevel?.includes("senior")}
            onChange={() => handleCheckboxChange("experienceLevel", "senior")}
          />
          <CheckboxItem
            label="Lead/Manager (7+ years)"
            checked={filters.experienceLevel?.includes("lead")}
            onChange={() => handleCheckboxChange("experienceLevel", "lead")}
          />
        </FilterSection>

        {/* Industry */}
        <FilterSection
          title="Industry"
          isExpanded={expandedSections.industry}
          onToggle={() => toggleSection("industry")}
        >
          <CheckboxItem
            label="Technology"
            checked={filters.industry?.includes("technology")}
            onChange={() => handleCheckboxChange("industry", "technology")}
          />
          <CheckboxItem
            label="Finance"
            checked={filters.industry?.includes("finance")}
            onChange={() => handleCheckboxChange("industry", "finance")}
          />
          <CheckboxItem
            label="Healthcare"
            checked={filters.industry?.includes("healthcare")}
            onChange={() => handleCheckboxChange("industry", "healthcare")}
          />
          <CheckboxItem
            label="E-commerce"
            checked={filters.industry?.includes("ecommerce")}
            onChange={() => handleCheckboxChange("industry", "ecommerce")}
          />
          <CheckboxItem
            label="Education"
            checked={filters.industry?.includes("education")}
            onChange={() => handleCheckboxChange("industry", "education")}
          />
          <CheckboxItem
            label="Media & Entertainment"
            checked={filters.industry?.includes("media")}
            onChange={() => handleCheckboxChange("industry", "media")}
          />
          <CheckboxItem
            label="Consulting"
            checked={filters.industry?.includes("consulting")}
            onChange={() => handleCheckboxChange("industry", "consulting")}
          />
          <CheckboxItem
            label="Manufacturing"
            checked={filters.industry?.includes("manufacturing")}
            onChange={() => handleCheckboxChange("industry", "manufacturing")}
          />
        </FilterSection>

        {/* Skills */}
        <FilterSection
          title="Skills"
          isExpanded={expandedSections.skills}
          onToggle={() => toggleSection("skills")}
        >
          <CheckboxItem
            label="JavaScript"
            checked={filters.skills?.includes("javascript")}
            onChange={() => handleCheckboxChange("skills", "javascript")}
          />
          <CheckboxItem
            label="Python"
            checked={filters.skills?.includes("python")}
            onChange={() => handleCheckboxChange("skills", "python")}
          />
          <CheckboxItem
            label="React"
            checked={filters.skills?.includes("react")}
            onChange={() => handleCheckboxChange("skills", "react")}
          />
          <CheckboxItem
            label="Node.js"
            checked={filters.skills?.includes("nodejs")}
            onChange={() => handleCheckboxChange("skills", "nodejs")}
          />
          <CheckboxItem
            label="AWS"
            checked={filters.skills?.includes("aws")}
            onChange={() => handleCheckboxChange("skills", "aws")}
          />
          <CheckboxItem
            label="Machine Learning"
            checked={filters.skills?.includes("ml")}
            onChange={() => handleCheckboxChange("skills", "ml")}
          />
          <CheckboxItem
            label="UI/UX Design"
            checked={filters.skills?.includes("design")}
            onChange={() => handleCheckboxChange("skills", "design")}
          />
          <CheckboxItem
            label="Data Analysis"
            checked={filters.skills?.includes("data")}
            onChange={() => handleCheckboxChange("skills", "data")}
          />
        </FilterSection>

        {/* Work Mode */}
        <FilterSection
          title="Work Mode"
          isExpanded={expandedSections.workMode}
          onToggle={() => toggleSection("workMode")}
        >
          <CheckboxItem
            label="Work from Home"
            checked={filters.workMode?.includes("wfh")}
            onChange={() => handleCheckboxChange("workMode", "wfh")}
          />
          <CheckboxItem
            label="Work from Office"
            checked={filters.workMode?.includes("wfo")}
            onChange={() => handleCheckboxChange("workMode", "wfo")}
          />
          <CheckboxItem
            label="Flexible/Hybrid"
            checked={filters.workMode?.includes("flexible")}
            onChange={() => handleCheckboxChange("workMode", "flexible")}
          />
        </FilterSection>

        {/* Date Posted */}
        <FilterSection
          title="Date Posted"
          isExpanded={expandedSections.datePosted}
          onToggle={() => toggleSection("datePosted")}
        >
          <CheckboxItem
            label="Last 24 hours"
            checked={filters.datePosted?.includes("24h")}
            onChange={() => handleCheckboxChange("datePosted", "24h")}
          />
          <CheckboxItem
            label="Last 3 days"
            checked={filters.datePosted?.includes("3d")}
            onChange={() => handleCheckboxChange("datePosted", "3d")}
          />
          <CheckboxItem
            label="Last week"
            checked={filters.datePosted?.includes("1w")}
            onChange={() => handleCheckboxChange("datePosted", "1w")}
          />
          <CheckboxItem
            label="Last month"
            checked={filters.datePosted?.includes("1m")}
            onChange={() => handleCheckboxChange("datePosted", "1m")}
          />
        </FilterSection>

        {/* Benefits */}
        <FilterSection
          title="Benefits"
          isExpanded={expandedSections.benefits}
          onToggle={() => toggleSection("benefits")}
        >
          <CheckboxItem
            label="Health Insurance"
            checked={filters.benefits?.includes("health")}
            onChange={() => handleCheckboxChange("benefits", "health")}
          />
          <CheckboxItem
            label="Remote Work"
            checked={filters.benefits?.includes("remote")}
            onChange={() => handleCheckboxChange("benefits", "remote")}
          />
          <CheckboxItem
            label="Flexible Hours"
            checked={filters.benefits?.includes("flexible")}
            onChange={() => handleCheckboxChange("benefits", "flexible")}
          />
          <CheckboxItem
            label="Learning & Development"
            checked={filters.benefits?.includes("learning")}
            onChange={() => handleCheckboxChange("benefits", "learning")}
          />
          <CheckboxItem
            label="Stock Options"
            checked={filters.benefits?.includes("stocks")}
            onChange={() => handleCheckboxChange("benefits", "stocks")}
          />
          <CheckboxItem
            label="Paid Time Off"
            checked={filters.benefits?.includes("pto")}
            onChange={() => handleCheckboxChange("benefits", "pto")}
          />
          <CheckboxItem
            label="Performance Bonus"
            checked={filters.benefits?.includes("bonus")}
            onChange={() => handleCheckboxChange("benefits", "bonus")}
          />
          <CheckboxItem
            label="Gym Membership"
            checked={filters.benefits?.includes("gym")}
            onChange={() => handleCheckboxChange("benefits", "gym")}
          />
        </FilterSection>
      </div>
    </aside>
  );
}
