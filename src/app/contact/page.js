"use client";
import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function onSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const mailto = `mailto:hello@example.com?subject=${encodeURIComponent("Aura contact from " + name)}&body=${encodeURIComponent(message + "\n\nFrom: " + email)}`;
      window.location.href = mailto;
      setSent(true);
      setIsSubmitting(false);
    }, 300);
  }

  return (
    <div className="min-h-screen relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-[var(--accent)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-10 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-3xl" />
      </div>

      <main className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 mb-6">
            <svg
              className="w-4 h-4 text-[var(--accent)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs font-medium text-[var(--accent)]">
              Get in touch
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-[var(--foreground)] to-[var(--foreground)]/60 bg-clip-text text-transparent">
            Let's talk
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[var(--foreground)]/70 max-w-xl mx-auto">
            Questions, feedback, or partnership inquiries—we'd love to hear from
            you.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-4">
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--background)]/50 backdrop-blur-sm hover:border-[var(--accent)]/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center mb-3">
                <svg
                  className="w-5 h-5 text-[var(--accent)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">Email</h3>
              <a
                href="mailto:hello@example.com"
                className="text-sm text-[var(--foreground)]/70 hover:text-[var(--accent)] transition-colors"
              >
                hello@example.com
              </a>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--background)]/50 backdrop-blur-sm hover:border-[var(--accent)]/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center mb-3">
                <svg
                  className="w-5 h-5 text-[var(--accent)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">Response time</h3>
              <p className="text-sm text-[var(--foreground)]/70">
                Within 24 hours
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={onSubmit}
              className="p-8 rounded-2xl border border-[var(--border)] bg-[var(--background)]/50 backdrop-blur-sm space-y-5"
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  placeholder="Tell us how we can help you..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full h-40 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm resize-none transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]"
                  required
                />
              </div>

              {sent && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <svg
                    className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-sm text-green-500">
                    <strong className="font-semibold">Success!</strong> Your
                    email client should have opened a draft.
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <p className="text-xs text-[var(--foreground)]/60 order-2 sm:order-1">
                  We typically respond within 24 hours
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative inline-flex items-center justify-center rounded-full bg-[var(--accent)] text-white px-8 py-3 text-sm font-semibold shadow-lg shadow-[var(--accent)]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[var(--accent)]/40 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 order-1 sm:order-2 w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send message
                      <svg
                        className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
