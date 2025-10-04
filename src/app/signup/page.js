"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  Loader2,
  ArrowRight,
  Check,
  Github,
  Eye,
  EyeOff,
} from "lucide-react";
import { signIn } from "next-auth/react";

function GoogleIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M21.35 11.1h-9.18v2.96h5.27c-.23 1.5-1.78 4.4-5.27 4.4-3.18 0-5.77-2.63-5.77-5.88s2.59-5.88 5.77-5.88c1.81 0 3.02.77 3.72 1.44l2.53-2.45C17.02 3.58 15.05 2.7 12.17 2.7 7.12 2.7 3 6.8 3 11.9s4.12 9.2 9.17 9.2c5.31 0 8.83-3.73 8.83-9 0-.6-.06-1.06-.15-1.98z" />
    </svg>
  );
}

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);

  function isValidEmail(value) {
    return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(value);
  }

  function getPasswordStrength(value) {
    // Simple heuristic: 0-4
    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/[0-9]/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;
    return score; // 0..4
  }

  const passwordStrength = getPasswordStrength(password);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreed) {
      setError("Please accept the Terms and Privacy Policy.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Failed to create account.");
        return;
      }
      await signIn("credentials", {
        email,
        password,
        redirect: true,
        callbackUrl: "/",
      });
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-[85vh] py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[var(--foreground)]/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[var(--foreground)]/5 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 140,
            damping: 20,
            mass: 0.28,
          }}
          className="order-2 lg:order-1"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--foreground)]/70">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Start free
            — no credit card
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
            Create your account
          </h1>
          <p className="mt-3 text-[var(--foreground)]/70 max-w-md">
            Personalize your job search and accelerate your applications with
            AI.
          </p>
          <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--background)]/60 backdrop-blur-md min-h-[520px] h-full">
            <div className="relative p-6">
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5 dark:ring-white/10" />
              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--muted)] transition-all"
                  aria-disabled
                >
                  <Github size={16} /> Continue with GitHub
                </button>
                <button
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: "/" })}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--muted)] transition-all"
                >
                  <GoogleIcon /> Continue with Google
                </button>
              </div>
              <div className="my-6 flex items-center gap-3 text-xs text-[var(--foreground)]/60">
                <div className="h-px flex-1 bg-[var(--border)]" /> Or continue
                with <div className="h-px flex-1 bg-[var(--border)]" />
              </div>
              <form onSubmit={handleSubmit} noValidate>
                <div className="space-y-4">
                  <div className="relative">
                    <label htmlFor="name" className="sr-only">
                      Full name
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 pr-10 text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--foreground)]/20"
                      aria-invalid={!!error && !name.trim()}
                    />
                    <User
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60"
                    />
                  </div>
                  <div className="relative">
                    <label htmlFor="email" className="sr-only">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 pr-10 text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--foreground)]/20"
                      aria-invalid={!!email && !isValidEmail(email)}
                    />
                    <Mail
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60"
                    />
                  </div>
                  <div className="relative">
                    <label htmlFor="password" className="sr-only">
                      Password
                    </label>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 pr-16 text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--foreground)]/20"
                      aria-describedby="password-hint password-strength"
                      aria-invalid={password.length > 0 && password.length < 6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-[var(--muted)] transition"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div
                    className="text-[10px] text-[var(--foreground)]/70"
                    id="password-hint"
                  >
                    Use at least 8 characters, with a number, uppercase, and
                    symbol.
                  </div>
                  <div className="space-y-2" id="password-strength">
                    <div className="h-1 w-full rounded bg-[var(--border)]">
                      <div
                        className={`h-1 rounded transition-all ${passwordStrength === 0 ? "w-0" : passwordStrength === 1 ? "w-1/4 bg-red-500" : passwordStrength === 2 ? "w-1/2 bg-orange-500" : passwordStrength === 3 ? "w-3/4 bg-yellow-500" : "w-full bg-green-500"}`}
                      />
                    </div>
                    <div className="text-xs text-[var(--foreground)]/70">
                      {passwordStrength <= 1
                        ? "Weak"
                        : passwordStrength === 2
                          ? "Fair"
                          : passwordStrength === 3
                            ? "Good"
                            : "Strong"}
                    </div>
                  </div>
                  <div className="relative">
                    <label htmlFor="confirm" className="sr-only">
                      Confirm password
                    </label>
                    <input
                      id="confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 pr-16 text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--foreground)]/20"
                      aria-invalid={
                        confirmPassword.length > 0 &&
                        confirmPassword !== password
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-[var(--muted)] transition"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <div className="text-xs text-red-600 dark:text-red-400">
                      Passwords do not match.
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-[var(--foreground)]/80">
                    <input
                      id="terms"
                      type="checkbox"
                      className="h-4 w-4 rounded border-[var(--border)]"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                    />
                    <label htmlFor="terms">
                      I agree to the{" "}
                      <Link href="#" className="underline underline-offset-4">
                        Terms
                      </Link>{" "}
                      and{" "}
                      <Link href="#" className="underline underline-offset-4">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                </div>
                <div
                  className="mt-2 min-h-[20px] text-xs text-red-600 dark:text-red-400"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {error}
                </div>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !name.trim() ||
                    !isValidEmail(email) ||
                    password.length < 6 ||
                    confirmPassword !== password ||
                    !agreed
                  }
                  className="mt-6 inline-flex items-center justify-center gap-2 w-full rounded-xl bg-black text-white px-4 py-3 text-sm hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed dark:bg-white dark:text-black shadow-sm hover:shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Creating
                      account
                    </>
                  ) : (
                    <>
                      Create account <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
              <div className="mt-6 text-sm text-[var(--foreground)]/70">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="underline underline-offset-4 hover:opacity-80"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 22,
            mass: 0.28,
            delay: 0.05,
          }}
          className="order-1 lg:order-2"
        >
          <div className="relative mt-44 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--background)] p-6 min-h-[460px] h-full">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(127,127,127,0.12),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(127,127,127,0.12),transparent_40%)]" />
            <div className="relative">
              <h3 className="text-xl font-semibold tracking-tight">
                Why join Aura?
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-[var(--foreground)]/80">
                <li className="flex items-center gap-2">
                  <Check size={16} /> Smart job matches
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} /> ATS-ready resume feedback
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} /> Save and track applications
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} /> Email alerts and reminders
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
