export default function Features() {
  const items = [
    {
      title: "AI Job Matching",
      desc: "Embeddings + filters deliver relevant roles with clear rationale.",
    },
    {
      title: "ATS Resume Checker",
      desc: "Parse, score, and suggest targeted improvements for each JD.",
    },
    {
      title: "Referral Assistant",
      desc: "Personalized outreach drafts for your network in one click.",
    },
    {
      title: "Recruiter Pipelines",
      desc: "Collaborate, score, and move candidates with confidence.",
    },
    {
      title: "Search & Alerts",
      desc: "Save segments, get notified, and track changes over time.",
    },
    {
      title: "Privacy & Security",
      desc: "RBAC, audit logs, and encryption by default.",
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Everything you need, fully customizable
          </h2>
          <p className="mt-4 text-[var(--foreground)]/70">
            A modular system where every component can be tailored to your workflow.
          </p>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((f) => (
            <div key={f.title} className="rounded-2xl border border-[var(--border)] p-6 bg-[var(--background)]">
              <div className="text-base font-medium">{f.title}</div>
              <div className="mt-2 text-sm text-[var(--foreground)]/70">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


