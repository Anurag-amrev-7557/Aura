export default function CTA() {
  return (
    <section id="get-started" className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Ready to build your job platform?
        </h3>
        <p className="mt-3 text-[var(--foreground)]/70">
          Start free. Upgrade anytime. Keep full control over the experience.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <a href="#" className="rounded-full bg-[var(--accent)] text-white px-5 py-3 text-sm sm:text-base">
            Get started
          </a>
          <a href="#contact" className="rounded-full border border-[var(--border)] px-5 py-3 text-sm sm:text-base">
            Talk to us
          </a>
        </div>
      </div>
    </section>
  );
}


