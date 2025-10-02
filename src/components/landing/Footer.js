"use client";
import Link from "next/link";
import { useState, useCallback, useMemo } from "react";
import { Mail, ArrowRight, Twitter, Linkedin, Github, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

// Memoized social links and nav links for performance
const SOCIAL_LINKS = [
  {
    href: "https://twitter.com/", // Replace with actual
    label: "Twitter",
    icon: Twitter,
  },
  {
    href: "https://linkedin.com/", // Replace with actual
    label: "LinkedIn",
    icon: Linkedin,
  },
  {
    href: "https://github.com/", // Replace with actual
    label: "GitHub",
    icon: Github,
  },
];

const PRODUCT_LINKS = [
  { href: "/jobs", label: "Job Search" },
  { href: "/ats", label: "ATS Assistant" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

const RESOURCE_LINKS = [
  { href: "#features", label: "Features", isAnchor: true },
  { href: "/contact", label: "Contact" },
  { href: "#faq", label: "FAQ", isAnchor: true },
  { href: "#how-it-works", label: "How it works", isAnchor: true },
];

const LEGAL_LINKS = [
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/cookies", label: "Cookies" },
];

// Memoized year to avoid recalculation
const CURRENT_YEAR = new Date().getFullYear();

function isValidEmail(value) {
  // Simple RFC5322-inspired check; good enough for UX
  return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(value);
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // "success" | "error" | null
  const [message, setMessage] = useState("");

  // Memoize email validation for performance
  const emailIsValid = useMemo(() => isValidEmail(email), [email]);

  // Stable handler references for React
  const handleEmailChange = useCallback((e) => {
    setEmail(e.target.value);
    if (status) {
      setStatus(null);
      setMessage("");
    }
  }, [status]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setStatus(null);
    setMessage("");

    const form = e.currentTarget;
    const spamCheck = form.querySelector("input[name=company]");
    if (spamCheck && spamCheck.value) {
      // Honeypot triggered; pretend success
      setStatus("success");
      setMessage("Thanks! You're on the list.");
      setEmail("");
      return;
    }

    if (!isValidEmail(email)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Subscription failed. Please try again.");
      }
      setStatus("success");
      setMessage("Thanks! Please check your inbox to confirm.");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [email]);

  // Memoized render for social links
  const socialLinks = useMemo(() =>
    SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
      <a
        key={label}
        href={href}
        aria-label={label}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full p-2 border border-[var(--border)] hover:bg-[var(--muted)] transition-all duration-200 hover:-translate-y-0.5"
      >
        <Icon size={18} />
      </a>
    )), []
  );

  // Memoized render for product links
  const productLinks = useMemo(() =>
    PRODUCT_LINKS.map(({ href, label }) => (
      <li key={href}>
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 transition-all duration-200 hover:translate-x-0.5 hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)]/20"
        >
          {label}
        </Link>
      </li>
    )), []
  );

  // Memoized render for resource links
  const resourceLinks = useMemo(() =>
    RESOURCE_LINKS.map(({ href, label, isAnchor }) => {
      if (isAnchor) {
        return (
          <li key={href}>
            <a
              href={href}
              className="inline-flex items-center gap-1.5 transition-all duration-200 hover:translate-x-0.5 hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)]/20"
            >
              {label}
            </a>
          </li>
        );
      }
      return (
        <li key={href}>
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 transition-all duration-200 hover:translate-x-0.5 hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)]/20"
          >
            {label}
          </Link>
        </li>
      );
    }), []
  );

  // Memoized render for legal links
  const legalLinks = useMemo(() =>
    LEGAL_LINKS.map(({ href, label }) => (
      <Link
        key={href}
        href={href}
        className="transition-colors hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)]/20"
      >
        {label}
      </Link>
    )), []
  );

  return (
    <footer className="border-t border-[var(--border)] pt-14 pb-8">
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 flex-shrink-0">
                <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="footerLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{stopColor: "#3B82F6", stopOpacity: 1}} />
                      <stop offset="100%" style={{stopColor: "#1E40AF", stopOpacity: 1}} />
                    </linearGradient>
                    <filter id="footerGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Main circle background */}
                  <circle cx="20" cy="20" r="18" fill="url(#footerLogoGradient)" filter="url(#footerGlow)"/>
                  
                  {/* Inner elements representing connection/networking */}
                  <g fill="white" opacity="0.95">
                    {/* Central hub */}
                    <circle cx="20" cy="20" r="3" />
                    
                    {/* Connection nodes */}
                    <circle cx="12" cy="14" r="2" />
                    <circle cx="28" cy="14" r="2" />
                    <circle cx="14" cy="26" r="2" />
                    <circle cx="26" cy="26" r="2" />
                    
                    {/* Connection lines */}
                    <line x1="20" y1="20" x2="12" y2="14" stroke="white" strokeWidth="1.5" opacity="0.8"/>
                    <line x1="20" y1="20" x2="28" y2="14" stroke="white" strokeWidth="1.5" opacity="0.8"/>
                    <line x1="20" y1="20" x2="14" y2="26" stroke="white" strokeWidth="1.5" opacity="0.8"/>
                    <line x1="20" y1="20" x2="26" y2="26" stroke="white" strokeWidth="1.5" opacity="0.8"/>
                    
                    {/* Subtle AI/tech accent */}
                    <path d="M20 8 L22 12 L18 12 Z" fill="white" opacity="0.7"/>
                  </g>
                </svg>
              </div>
              <span className="text-lg font-semibold tracking-tight">Aura</span>
            </div>
            <p className="mt-4 text-sm text-[var(--foreground)]/70 max-w-md">
              The AI-native job platform for candidates and teams. Match faster, apply smarter,
              and hire confidently with modern workflows.
            </p>
            <div className="mt-6 flex items-center gap-4">
              {socialLinks}
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <div className="text-sm font-semibold tracking-tight">Product</div>
              <ul className="mt-4 space-y-2 text-sm text-[var(--foreground)]/70">
                {productLinks}
              </ul>
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">Resources</div>
              <ul className="mt-4 space-y-2 text-sm text-[var(--foreground)]/70">
                {resourceLinks}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="text-sm font-semibold tracking-tight">Stay in the loop</div>
              <p className="mt-4 text-sm text-[var(--foreground)]/70">
                Get product updates and tips. No spam.
              </p>
              <form className="mt-4" action="#" method="post" onSubmit={handleSubmit} noValidate>
                <label htmlFor="newsletter" className="sr-only">Email</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      id="newsletter"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={handleEmailChange}
                      autoComplete="email"
                      placeholder="you@company.com"
                      aria-invalid={status === "error" && !emailIsValid ? "true" : "false"}
                      className="w-full rounded-full border border-[var(--border)] bg-[var(--background)] px-4 py-2 pr-10 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--foreground)]/20 hover:border-[var(--foreground)]/30"
                    />
                    <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 transition-opacity duration-200" />
                    {/* Honeypot field */}
                    <input type="text" tabIndex="-1" autoComplete="off" name="company" className="hidden" aria-hidden="true" />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group inline-flex items-center gap-2 rounded-full bg-black text-white px-4 py-2 text-sm transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-white dark:text-black shadow-sm hover:shadow-md"
                    aria-busy={isSubmitting ? "true" : "false"}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Subscribing
                      </>
                    ) : (
                      <>
                        Subscribe <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </div>
                <div className="mt-2 min-h-[22px] text-xs" aria-live="polite" aria-atomic="true">
                  {status === "success" && (
                    <div className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 size={14} /> {message}
                    </div>
                  )}
                  {status === "error" && (
                    <div className="inline-flex items-center gap-2 text-red-600 dark:text-red-400">
                      <AlertCircle size={14} /> {message}
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--foreground)]/70">
          <div>© {CURRENT_YEAR} Aura. All rights reserved.</div>
          <div className="flex items-center gap-5">
            {legalLinks}
          </div>
        </div>
      </div>
    </footer>
  );
}
