export default function PricingTeaser() {
  const plans = [
    { name: "Free", price: "$0", features: ["Basic search", "Profile"] },
    { name: "Pro", price: "$29", features: ["AI matching", "ATS checker", "Referrals"] },
    { name: "Team", price: "$99", features: ["Pipelines", "Collaboration", "Alerts"] },
  ];
  return (
    <section id="pricing" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Simple pricing</h2>
          <p className="mt-3 text-[var(--foreground)]/70">Start free, grow as you need</p>
        </div>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div key={p.name} className="rounded-2xl border border-[var(--border)] p-6 bg-[var(--background)]">
              <div className="font-medium">{p.name}</div>
              <div className="text-3xl font-semibold mt-1">{p.price}</div>
              <ul className="mt-4 space-y-2 text-sm text-[var(--foreground)]/70">
                {p.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
              <a href="#" className="mt-6 inline-block rounded-full bg-[var(--accent)] text-white px-5 py-3 text-sm">
                Choose {p.name}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


