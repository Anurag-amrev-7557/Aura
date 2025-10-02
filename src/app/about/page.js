export const metadata = { title: "About | Aura" };

export default function AboutPage() {
  return (
    <div className="min-h-screen relative">
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">About Aura</h1>
          <p className="mt-4 text-[var(--foreground)]/80">
            Aura helps candidates tailor resumes to job descriptions with AI-powered ATS insights. Our mission is to make hiring more meritocratic by
            highlighting relevant skills and achievements clearly and fairly.
          </p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-6">
          {[{
            title: "AI ATS analysis",
            body: "Compare resumes against roles to surface gaps, keywords, and actionable edits.",
          },{
            title: "Resume rewriting",
            body: "Transform bullets into quantified, impact-driven statements tailored to the role.",
          },{
            title: "Job discovery",
            body: "Search relevant roles quickly. Filter by location and apply with one click.",
          },{
            title: "Privacy-first",
            body: "Your content is processed securely. We don’t store uploaded files by default.",
          }].map((f) => (
            <div key={f.title} className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6">
              <div className="text-lg font-medium">{f.title}</div>
              <p className="mt-2 text-sm text-[var(--foreground)]/80">{f.body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}


