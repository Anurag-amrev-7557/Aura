import Link from "next/link";
export const metadata = { title: "Pricing | Aura" };

export default function PricingPage() {
  return (
    <div className="min-h-screen relative">
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Simple pricing</h1>
          <p className="mt-3 text-[var(--foreground)]/70">Start free, upgrade when you need more power.</p>
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {[
            { name: "Free", price: "$0", features: ["Basic ATS check", "3 rewrites/mo", "Community support"], cta: "Get started" },
            { name: "Pro", price: "$12/mo", features: ["Unlimited ATS checks", "Unlimited rewrites", "Job search filters"], cta: "Upgrade" },
            { name: "Team", price: "Contact", features: ["Seats & SSO", "Usage analytics", "Priority support"], cta: "Contact sales" },
          ].map((t) => (
            <div key={t.name} className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6">
              <div className="flex items-baseline justify-between">
                <div className="text-lg font-medium">{t.name}</div>
                <div className="text-2xl font-semibold">{t.price}</div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-[var(--foreground)]/80">
                {t.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <a href="#contact" className="inline-flex items-center rounded-full border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--muted)]">{t.cta}</a>
              </div>
            </div>
          ))}
        </div>

        <div id="faq" className="mt-16 text-center">
          <Link href="/#faq" className="text-sm underline underline-offset-4">Read FAQs</Link>
        </div>
      </main>
    </div>
  );
}


