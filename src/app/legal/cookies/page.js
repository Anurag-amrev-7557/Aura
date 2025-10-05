export const metadata = {
  title: "Cookie Policy | Aura",
  description: "How Aura uses cookies and similar technologies.",
};

export default function CookiesPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="text-3xl font-semibold tracking-tight">Cookie Policy</h1>
      <p className="mt-3 text-[var(--foreground)]/70">Last updated: {new Date().getFullYear()}</p>

      <section className="mt-8 space-y-6 text-sm leading-6 text-[var(--foreground)]/85">
        <p>
          This Cookie Policy explains how Aura uses cookies and similar technologies to recognize you when you
          visit our Services, why we use them, and your rights to control their use.
        </p>

        <div>
          <h2 className="text-lg font-medium">What are cookies?</h2>
          <p className="mt-2">
            Cookies are small data files placed on your device that allow us to remember your preferences and
            understand how you interact with the Services.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-medium">Types of cookies we use</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Essential cookies for authentication and security.</li>
            <li>Performance cookies to analyze usage and improve our Services.</li>
            <li>Functional cookies to remember preferences.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-medium">Managing cookies</h2>
          <p className="mt-2">
            You can set or modify your browser controls to accept or refuse cookies. If you choose to reject
            cookies, you may still use our Services though some functionality may be limited.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-medium">Contact</h2>
          <p className="mt-2">Questions about this policy? Email privacy@aurajobs.app.</p>
        </div>
      </section>
    </main>
  );
}


