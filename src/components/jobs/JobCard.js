"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

function isValidHttpUrl(string) {
  try {
    const u = new URL(string);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

const PROXY_ALLOWED = new Set([
  'remotive.com',
  'www.remotive.com',
  'themuse.com',
  'www.themuse.com',
]);

function proxyImageUrl(url, name) {
  try {
    // If the url is already a relative proxied path (starts with /api/), return as-is
    if (typeof url === 'string' && url.startsWith('/api/')) return url;
    const u = new URL(url);
    if (!PROXY_ALLOWED.has(u.hostname)) return null;
    const q = `url=${encodeURIComponent(url)}${name ? `&name=${encodeURIComponent(name)}` : ''}`;
    return `/api/image-proxy?${q}`;
  } catch (e) {
    return null;
  }
}

export default function JobCard({ job, isUpcoming = false }) {
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(job.isBookmarked || false);

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    // Here you would typically make an API call to save the bookmark
  };

  const handleCardClick = () => {
    router.push(`/jobs/${job.id}`);
  };

  const formatStipend = (amount) => {
    if (amount === null || amount === undefined || amount === 0) return '—';
    if (typeof amount === 'string') {
      const n = Number(amount.replace(/[^0-9.-]+/g, ''));
      if (Number.isFinite(n)) amount = n; else return '—';
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  const getJobTypeStyle = (type) => {
    const styles = {
      fulltime: "bg-green-100 text-green-700 border-green-200",
      parttime: "bg-blue-100 text-blue-700 border-blue-200",
      internship: "bg-purple-100 text-purple-700 border-purple-200",
      contract: "bg-orange-100 text-orange-700 border-orange-200",
    };
    return styles[type] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getJobTypeLabel = (type) => {
    const labels = {
      fulltime: "Full-time",
      parttime: "Part-time",
      internship: "Internship",
      contract: "Contract",
    };
    return labels[type] || type;
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-6 pb-2 hover:shadow-lg hover:border-[var(--accent)]/30 transition-all relative cursor-pointer"
    >
      <div className="flex">
        <div className="absolute top-8.5 right-46 flex items-center gap-2 text-xs text-[var(--foreground)]/60">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Posted {job.postedDate}</span>
        </div>
        {/* Job Type */}
        <div className="flex items-center gap-2 absolute top-7.5 right-16">
          <svg
            className="w-4 h-4 text-[var(--foreground)]/60 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span
            className={`text-xs px-2 py-1 rounded-full border ${getJobTypeStyle(job.jobType)}`}
          >
            {getJobTypeLabel(job.jobType)}
          </span>
        </div>

        {/* Bookmark Button */}
        <button
          onClick={handleBookmark}
          className="absolute top-6 right-6 p-2 hover:bg-[var(--muted)] rounded-full transition-colors"
          aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
        >
          <svg
            className={`w-5 h-5 ${
              isBookmarked
                ? "fill-[var(--accent)] stroke-[var(--accent)]"
                : "fill-none stroke-[var(--foreground)]/60"
            }`}
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
            />
          </svg>
        </button>
      </div>

      {/* Company Logo and Header */}
      <div className="flex items-start gap-4 mb-4 pr-10">
        <div className="w-14 h-14 rounded-xl border border-[var(--border)] flex items-center justify-center bg-[var(--muted)] flex-shrink-0 overflow-hidden">
          {job.companyLogo && isValidHttpUrl(job.companyLogo) ? (
            (() => {
              const prox = proxyImageUrl(job.companyLogo, job.companyName || '');
              if (prox) {
                  // Use native <img> for proxied images (proxy may return SVG placeholders)
                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={prox}
                      alt={`${job.companyName} logo`}
                      width={56}
                      height={56}
                      className="object-cover"
                      loading="lazy"
                    />
                  );
                }
                // if proxy not allowed for this host, still attempt original URL with next/image
                return (
                  <Image
                    src={job.companyLogo}
                    alt={`${job.companyName} logo`}
                    width={56}
                    height={56}
                    className="object-cover"
                  />
                );
            })()
          ) : (
            <span className="text-xl font-semibold text-[var(--foreground)]/60">
              {job.companyName ? job.companyName.charAt(0) : ""}
            </span>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1 line-clamp-2">
            {job.title}
          </h3>
          <p className="text-sm text-[var(--foreground)]/70">
            {job.companyName}
          </p>
        </div>
      </div>

      {/* Job Details Grid */}
      <div className="flex gap-6 mb-4">
        {/* Location */}
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-[var(--foreground)]/60 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-sm text-[var(--foreground)]/80">
            {job.location}
          </span>
        </div>

        {/* Stipend */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--foreground)]">
            {formatStipend(job.stipend)}/mo
          </span>
        </div>

        {/* Duration */}
        {job.duration && (
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-[var(--foreground)]/60 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm text-[var(--foreground)]/80">
              {job.duration} months
            </span>
          </div>
        )}
      </div>

      {/* Skills/Tags */}
      {job.skills && job.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {job.skills.slice(0, 4).map((skill, index) => (
            <span
              key={index}
              className="text-xs px-3 py-1 bg-[var(--muted)] text-[var(--foreground)]/80 rounded-full"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="text-xs px-3 py-1 text-[var(--foreground)]/60">
              +{job.skills.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Expected Start Date for Upcoming Jobs */}
      {isUpcoming && job.expectedStartDate && (
        <div className="mb-4 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <svg
            className="w-4 h-4 text-blue-600 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm text-blue-700 font-medium">
            Expected to open:{" "}
            {new Date(job.expectedStartDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      )}

      {/* Description Preview */}
      {job.description && (
        <p className="text-sm text-[var(--foreground)]/70 font-semibold line-clamp-2 mb-4">
          {job.description}
        </p>
      )}
    </div>
  );
}
