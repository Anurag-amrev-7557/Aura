export default function HowItWorks() {
  const steps = [
    {
      title: "Create a profile",
      desc: "Import resume, enrich with AI, and set your preferences.",
    },
    {
      title: "Post or find jobs",
      desc: "Employers post roles, candidates discover tailored matches.",
    },
    {
      title: "AI-powered matching",
      desc: "Hybrid search ranks roles and candidates with clear rationale.",
    },
    {
      title: "Referrals & outreach",
      desc: "Personalized messages and tracking to accelerate hiring.",
    },
  ];
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">How it works</h2>
            <p className="mt-4 text-[var(--foreground)]/70">
              A streamlined flow that adapts to teams and individuals alike.
            </p>
            <div className="mt-8 space-y-4">
              {steps.map((s, i) => (
                <div key={s.title} className="rounded-2xl border border-[var(--border)] p-5 bg-[var(--background)]">
                  <div className="text-sm text-[var(--foreground)]/60">Step {i + 1}</div>
                  <div className="mt-1 font-medium">{s.title}</div>
                  <div className="text-sm text-[var(--foreground)]/70 mt-1">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl border border-[var(--border)] bg-[var(--muted)]" />
          </div>
        </div>
      </div>
    </section>
  );
}


