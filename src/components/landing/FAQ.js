export default function FAQ() {
  const faqs = [
    {
      q: "Can I use AI features on the free plan?",
      a: "You can try basic AI matching and resume checks with limits.",
    },
    {
      q: "Do you integrate with LinkedIn?",
      a: "We generate personalized drafts for manual sending to comply with TOS.",
    },
    {
      q: "How do you handle data privacy?",
      a: "PII encryption, RBAC, audit logs, and data deletion workflows.",
    },
  ];
  return (
    <section id="faq" className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-semibold tracking-tight text-center">FAQ</h2>
        <div className="mt-8 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--background)]">
          {faqs.map((f, i) => (
            <details key={f.q} className="group p-5">
              <summary className="cursor-pointer list-none font-medium flex items-center justify-between">
                <span>{f.q}</span>
                <span className="text-[var(--foreground)]/50 group-open:rotate-45 transition">+</span>
              </summary>
              <p className="mt-2 text-sm text-[var(--foreground)]/70">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}


