"use client";
import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function onSubmit(e) {
    e.preventDefault();
    const mailto = `mailto:hello@example.com?subject=${encodeURIComponent("Aura contact from " + name)}&body=${encodeURIComponent(message + "\n\nFrom: " + email)}`;
    window.location.href = mailto;
    setSent(true);
  }

  return (
    <div className="min-h-screen relative">
      <main className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Contact
        </h1>
        <p className="mt-3 text-[var(--foreground)]/70">
          Questions, feedback, or partnership inquiries—drop us a note.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
            required
          />
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
            required
          />
          <textarea
            placeholder="How can we help?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-40 rounded-xl border border-[var(--border)] bg-transparent p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
            required
          />
          <div className="flex items-center justify-between">
            <div className="text-xs text-[var(--foreground)]/60">
              Or email us directly at{" "}
              <a className="underline" href="mailto:hello@example.com">
                hello@example.com
              </a>
            </div>
            <button
              type="submit"
              className="rounded-full bg-[var(--accent)] text-white px-6 py-3 text-sm shadow-[0_6px_24px_rgba(0,0,0,0.20)]"
            >
              Send
            </button>
          </div>
          {sent ? (
            <div className="text-sm text-[var(--foreground)]/70">
              Thanks! Your email client should have opened a draft.
            </div>
          ) : null}
        </form>
      </main>
    </div>
  );
}
