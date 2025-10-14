"use client";

export default function JobDescription({ job }) {
  return (
    <div className="space-y-10">
      {/* Main Description */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
          <span className="w-1 h-6 bg-[var(--accent)] rounded-full"></span>
          About the Role
        </h2>
        <p className="text-[var(--foreground)]/70 leading-relaxed whitespace-pre-line pl-7">
          {job.fullDescription || job.description}
        </p>
      </div>

      {job.responsibilities && job.responsibilities.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
            <span className="w-1 h-6 bg-[var(--accent)] rounded-full"></span>
            Key Responsibilities
          </h3>
          <div className="pl-7 space-y-2.5">
            {job.responsibilities.map((item, index) => (
              <div key={index} className="flex items-start gap-3 group">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0"></div>
                <span className="text-[var(--foreground)]/70 leading-relaxed">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {job.requirements && job.requirements.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
            <span className="w-1 h-6 bg-[var(--accent)] rounded-full"></span>
            Requirements
          </h3>
          <div className="pl-7 space-y-2.5">
            {job.requirements.map((item, index) => (
              <div key={index} className="flex items-start gap-3 group">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0"></div>
                <span className="text-[var(--foreground)]/70 leading-relaxed">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {job.qualifications && job.qualifications.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
            <span className="w-1 h-6 bg-[var(--accent)] rounded-full"></span>
            Qualifications
          </h3>
          <div className="pl-7 space-y-2.5">
            {job.qualifications.map((item, index) => (
              <div key={index} className="flex items-start gap-3 group">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0"></div>
                <span className="text-[var(--foreground)]/70 leading-relaxed">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {job.niceToHave && job.niceToHave.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
            <span className="w-1 h-6 bg-[var(--foreground)]/20 rounded-full"></span>
            Nice to Have
          </h3>
          <div className="pl-7 space-y-2.5">
            {job.niceToHave.map((item, index) => (
              <div key={index} className="flex items-start gap-3 group">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--foreground)]/30 mt-2 flex-shrink-0"></div>
                <span className="text-[var(--foreground)]/60 leading-relaxed">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
