export const metadata = {
  title: "Terms of Service | Aura",
  description: "The terms governing use of Aura's services.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
      <p className="mt-3 text-[var(--foreground)]/70">Last updated: {new Date().getFullYear()}</p>

      <section className="mt-8 space-y-6 text-sm leading-6 text-[var(--foreground)]/85">
        <p>
          These Terms of Service ("Terms") govern your access to and use of the website and services
          provided by Aura ("we", "us"). By using the Services, you agree to be bound by these Terms.
        </p>

        <div>
          <h2 className="text-lg font-medium">Use of services</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>You must be at least the age of majority in your jurisdiction.</li>
            <li>Do not misuse the Services or attempt to access them using a method other than provided.</li>
            <li>Comply with all applicable laws and regulations.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-medium">Accounts and security</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>You are responsible for activities under your account and safeguarding credentials.</li>
            <li>Notify us immediately if you suspect unauthorized use of your account.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-medium">Content</h2>
          <p className="mt-2">
            You retain ownership of content you submit. You grant us a limited license to host and process
            content as necessary to provide the Services. You are responsible for ensuring you have the rights
            to submit content.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-medium">Subscriptions and fees</h2>
          <p className="mt-2">
            Some features may require payment. Fees are non-refundable except where required by law.
            We may change prices on notice; continued use after changes constitutes acceptance.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-medium">Disclaimers</h2>
          <p className="mt-2">
            The Services are provided "as is" without warranties of any kind. We do not warrant the accuracy
            of recommendations or job matches.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-medium">Limitation of liability</h2>
          <p className="mt-2">
            To the maximum extent permitted by law, we will not be liable for any indirect, incidental,
            special, consequential, or punitive damages, or any loss of profits or revenues.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-medium">Termination</h2>
          <p className="mt-2">
            We may suspend or terminate access if you violate these Terms. You may stop using the Services at
            any time.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-medium">Changes to Terms</h2>
          <p className="mt-2">
            We may update these Terms from time to time. If changes are material, we will provide notice.
            Continued use after changes constitutes acceptance.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-medium">Contact</h2>
          <p className="mt-2">Questions? Contact legal@aurajobs.app.</p>
        </div>
      </section>
    </main>
  );
}


