"use client";

export default function RelatedJobs({ jobs }) {
  const formatStipend = (amount) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${(amount / 1000).toFixed(0)}K`;
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

  if (!jobs || jobs.length === 0) return null;

  return (
    <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-4">Similar Jobs</h2>

      <div className="space-y-4">
        {jobs.map((job) => (
          <a
            key={job.id}
            href={`/jobs/${job.id}`}
            className="block p-4 border border-[var(--border)] rounded-xl hover:bg-[var(--muted)] transition-colors"
          >
            <h3 className="font-semibold text-sm mb-1 line-clamp-1">{job.title}</h3>
            <p className="text-xs text-[var(--foreground)]/70 mb-2">{job.companyName}</p>

            <div className="flex items-center gap-3 text-xs text-[var(--foreground)]/60">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {formatStipend(job.stipend)}/mo
              </span>
            </div>

            <div className="mt-2">
              <span className="text-xs px-2 py-1 bg-[var(--muted)] rounded-full">
                {getJobTypeLabel(job.jobType)}
              </span>
            </div>
          </a>
        ))}
      </div>

      <button className="w-full mt-4 text-sm text-[var(--accent)] hover:underline font-medium">
        View More Jobs
      </button>
    </div>
  );
}
