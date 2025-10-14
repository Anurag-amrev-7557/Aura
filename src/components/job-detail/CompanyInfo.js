"use client";
import Image from "next/image";

export default function CompanyInfo({ company }) {
  return (
    <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-6">
      {/* Company Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-16 h-16 rounded-xl border border-[var(--border)] flex items-center justify-center bg-[var(--muted)] flex-shrink-0 overflow-hidden">
          {company.logo ? (
            <Image
              src={company.logo}
              alt={`${company.name} logo`}
              width={64}
              height={64}
              className="object-cover"
            />
          ) : (
            <span className="text-2xl font-semibold text-[var(--foreground)]/60">
              {company.name.charAt(0)}
            </span>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-1">{company.name}</h2>
          <p className="text-sm text-[var(--foreground)]/70">{company.industry}</p>
        </div>
      </div>

      {/* Company Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-[var(--border)]">
        <div className="text-center">
          <div className="text-xl font-semibold text-[var(--accent)]">
            {company.size || "50-200"}
          </div>
          <div className="text-xs text-[var(--foreground)]/60 mt-1">Employees</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-semibold text-[var(--accent)]">
            {company.founded || "2015"}
          </div>
          <div className="text-xs text-[var(--foreground)]/60 mt-1">Founded</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-semibold text-[var(--accent)]">
            {company.openJobs || "12"}
          </div>
          <div className="text-xs text-[var(--foreground)]/60 mt-1">Open Jobs</div>
        </div>
      </div>

      {/* About Company */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-3">About</h3>
        <p className="text-sm text-[var(--foreground)]/80 leading-relaxed">
          {company.about}
        </p>
      </div>

      {/* Company Details */}
      <div className="space-y-3 mb-6">
        {company.location && (
          <div className="flex items-center gap-3">
            <svg
              className="w-4 h-4 text-[var(--foreground)]/60"
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
            </svg>
            <span className="text-sm text-[var(--foreground)]/80">{company.location}</span>
          </div>
        )}
        {company.website && (
          <div className="flex items-center gap-3">
            <svg
              className="w-4 h-4 text-[var(--foreground)]/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--accent)] hover:underline"
            >
              {company.website.replace(/^https?:\/\//, "")}
            </a>
          </div>
        )}
      </div>

      {/* Visit Company Page Button */}
      <a
        href={`/company/${company.id}`}
        className="block w-full text-center py-2.5 px-4 border border-[var(--border)] rounded-full text-sm font-medium hover:bg-[var(--muted)] transition-colors"
      >
        View Company Page
      </a>
    </div>
  );
}
