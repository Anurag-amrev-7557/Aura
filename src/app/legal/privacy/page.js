export const metadata = {
  title: "Privacy Policy | Aura",
  description: "How Aura collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-3 text-[var(--foreground)]/70">Last updated: {new Date().getFullYear()}</p>

      <section className="mt-8 space-y-6 text-sm leading-6 text-[var(--foreground)]/85">
        <p>
          This Privacy Policy explains how Aura ("we", "us") collects, uses, and shares
          information about you when you use our website, products, and services (collectively, the "Services").
        </p>

        <div>
          <h2 className="text-lg font-medium">Information we collect</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Account data: name, email, password hash, authentication identifiers.</li>
            <li>Usage data: device information, pages visited, actions taken, and log data.</li>
            <li>Content you provide: resumes, documents, messages, and feedback.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-medium">How we use information</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Provide, maintain, and improve the Services and user experience.</li>
            <li>Personalize features, recommendations, and job-related insights.</li>
            <li>Communicate with you about updates, security notices, and support.</li>
            <li>Comply with legal obligations and enforce our Terms.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-medium">Sharing of information</h2>
          <p className="mt-2">
            We do not sell your personal information. We may share information with:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Service providers under contract who process data on our behalf.</li>
            <li>Law enforcement or regulators when required by law.</li>
            <li>Other parties with your consent or at your direction.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-medium">Data retention</h2>
          <p className="mt-2">
            We retain information as long as necessary to provide the Services, comply with legal
            obligations, resolve disputes, and enforce agreements. You can request deletion subject to
            applicable law and legitimate interests.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-medium">Your rights</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Access, correct, or delete your personal information.</li>
            <li>Object to or restrict certain processing.</li>
            <li>Portability of certain data where technically feasible.</li>
          </ul>
          <p className="mt-2">To exercise rights, contact us at privacy@aurajobs.app.</p>
        </div>

        <div>
          <h2 className="text-lg font-medium">Security</h2>
          <p className="mt-2">
            We use technical and organizational measures appropriate to the risk to protect your data.
            No system is completely secure. You are responsible for maintaining the secrecy of your credentials.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-medium">International transfers</h2>
          <p className="mt-2">
            Your information may be transferred to and processed in countries other than your own. We implement
            safeguards consistent with applicable law for such transfers.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-medium">Changes</h2>
          <p className="mt-2">
            We may update this Policy from time to time. If we make material changes, we will notify you by
            updating the date and providing reasonable notice.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-medium">Contact</h2>
          <p className="mt-2">
            Questions about this Policy? Contact us at privacy@aurajobs.app.
          </p>
        </div>
      </section>
    </main>
  );
}


