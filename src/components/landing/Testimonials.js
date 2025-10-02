export default function Testimonials() {
  const items = [
    {
      quote:
        "We reduced time-to-hire by half while improving candidate experience.",
      name: "Ava Patel",
      role: "Head of Talent, Nimbus AI",
    },
    {
      quote: "The AI-matching is the closest to how our recruiters think.",
      name: "Jonah Kim",
      role: "Recruiting Lead, Leaf Labs",
    },
    {
      quote: "Referral workflows became frictionless for our whole team.",
      name: "Sara Martinez",
      role: "People Ops, Corebright",
    },
  ];
  return (
    <section className="py-20 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.04))] dark:bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.04))]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Loved by teams</h2>
          <p className="mt-3 text-[var(--foreground)]/70">What customers are saying</p>
        </div>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {items.map((t) => (
            <div key={t.name} className="rounded-2xl border border-[var(--border)] p-6 bg-[var(--background)]">
              <p className="text-sm leading-6">“{t.quote}”</p>
              <div className="mt-4 text-sm text-[var(--foreground)]/70">
                <div className="font-medium text-[var(--foreground)]">{t.name}</div>
                <div>{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


