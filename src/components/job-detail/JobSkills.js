"use client";

export default function JobSkills({ skills }) {
  if (!skills || skills.length === 0) return null;

  return (
    <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-6 sm:p-8">
      <h2 className="text-2xl font-semibold mb-6">Required Skills</h2>

      <div className="flex flex-wrap gap-3">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="px-4 py-2 bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] rounded-full text-sm font-medium hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] transition-colors"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
