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

export default function JobListings({ activeTab, filters }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      const jobList = mockJobs[activeTab] || [];
      const filteredJobs = applyFilters(jobList, filters);
      const sortedJobs = sortJobs(filteredJobs, sortBy);
      setJobs(sortedJobs);
      setLoading(false);
    }, 300);
  }, [activeTab, filters, sortBy]);

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
      {/* Sort and Count Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-[var(--foreground)]/70">
          <span className="font-semibold text-[var(--foreground)]">
            {jobs.length}
          </span>{" "}
          jobs found
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm text-[var(--foreground)]/70">
            Sort by:
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
          >
            <option value="recent">Most Recent</option>
            <option value="stipend-high">Highest Stipend</option>
            <option value="stipend-low">Lowest Stipend</option>
          </select>
        </div>
      </div>

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
