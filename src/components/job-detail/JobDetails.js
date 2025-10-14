"use client";

export default function JobDetails({ job }) {
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

  const details = [
    {
      label: "Job Type",
      value: getJobTypeLabel(job.jobType),
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      ),
    },
    {
      label: "Salary/Stipend",
      value: `${formatStipend(job.stipend)}/month`,
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
    },
    {
      label: "Location",
      value: job.location,
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
      ),
    },
    ...(job.duration
      ? [
          {
            label: "Duration",
            value: `${job.duration} months`,
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            ),
          },
        ]
      : []),
    ...(job.experienceRequired
      ? [
          {
            label: "Experience",
            value: job.experienceRequired,
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            ),
          },
        ]
      : []),
    ...(job.openings
      ? [
          {
            label: "Openings",
            value: `${job.openings} positions`,
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            ),
          },
        ]
      : []),
    {
      label: "Posted",
      value: job.postedDate,
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      ),
    },
    ...(job.applicationDeadline
      ? [
          {
            label: "Apply By",
            value: new Date(job.applicationDeadline).toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              },
            ),
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-8">
      {/* Job Details Grid */}
      <div>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
          <span className="w-1 h-6 bg-[var(--accent)] rounded-full"></span>
          Job Information
        </h2>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 pl-7">
          {details.map((detail, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-2 h-2 bg-[var(--accent)]/40 rounded-full"></div>
              <div className="flex-1">
                <div className="text-xs text-[var(--foreground)]/50 mb-0.5">
                  {detail.label}
                </div>
                <div className="text-sm font-medium text-[var(--foreground)]">
                  {detail.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      {job.benefits && job.benefits.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <span className="w-1 h-6 bg-[var(--accent)] rounded-full"></span>
            Perks & Benefits
          </h3>
          <div className="flex flex-wrap gap-2 pl-7">
            {job.benefits.map((benefit, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm font-medium"
              >
                {benefit}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
