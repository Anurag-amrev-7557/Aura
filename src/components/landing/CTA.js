export default function CTA() {
  return (
    <section id="get-started" className="relative py-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 via-transparent to-[var(--accent)]/10 pointer-events-none" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]"></span>
            </span>
            <span className="text-sm font-medium text-[var(--accent)]">
              Limited time offer
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-[var(--foreground)] to-[var(--foreground)]/60 bg-clip-text text-transparent">
              Ready to build your job platform?
            </h2>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-[var(--foreground)]/70 leading-relaxed">
              Start free. Upgrade anytime. Keep full control over the
              experience.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href="#"
              className="group relative inline-flex items-center justify-center rounded-full bg-[var(--accent)] text-white px-8 py-4 text-base font-semibold shadow-lg shadow-[var(--accent)]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[var(--accent)]/40 hover:scale-105 active:scale-95 w-full sm:w-auto"
            >
              <span className="relative z-10">Get started free</span>
              <svg
                className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </a>

            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-full border-2 border-[var(--border)] px-8 py-4 text-base font-semibold transition-all duration-200 hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 hover:scale-105 active:scale-95 w-full sm:w-auto"
            >
              Talk to us
            </a>
          </div>

          {/* Trust indicators */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--foreground)]/60">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Setup in 5 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
