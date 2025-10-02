"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight, Github, Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

function GoogleIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M21.35 11.1h-9.18v2.96h5.27c-.23 1.5-1.78 4.4-5.27 4.4-3.18 0-5.77-2.63-5.77-5.88s2.59-5.88 5.77-5.88c1.81 0 3.02.77 3.72 1.44l2.53-2.45C17.02 3.58 15.05 2.7 12.17 2.7 7.12 2.7 3 6.8 3 11.9s4.12 9.2 9.17 9.2c5.31 0 8.83-3.73 8.83-9 0-.6-.06-1.06-.15-1.98z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isCapsLock, setIsCapsLock] = useState(false);

  function isValidEmail(value) {
    return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(value);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid email or password.");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-[85vh] py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[var(--foreground)]/5 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[var(--foreground)]/5 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 20, mass: 0.28 }}
          className="order-2 lg:order-1"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--foreground)]/70">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Secure & privacy-first
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-3 text-[var(--foreground)]/70 max-w-md">
            Sign in to continue your search, manage applications, and get tailored insights.
          </p>
          <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--background)]/60 backdrop-blur-md min-h-[420px] h-full">
            <div className="relative p-6">
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5 dark:ring-white/10" />
              <div className="grid sm:grid-cols-2 gap-3">
                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--muted)] transition-all" aria-disabled>
                  <Github size={16} /> Continue with GitHub
                </button>
                <button type="button" onClick={() => signIn("google", { callbackUrl: "/" })} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--muted)] transition-all">
                  <GoogleIcon /> Continue with Google
                </button>
              </div>
              <div className="my-6 flex items-center gap-3 text-xs text-[var(--foreground)]/60">
                <div className="h-px flex-1 bg-[var(--border)]" /> Or continue with <div className="h-px flex-1 bg-[var(--border)]" />
              </div>
              <form onSubmit={handleSubmit} noValidate>
                <div className="space-y-4">
                  <div className="relative">
                    <label htmlFor="email" className="sr-only">Email</label>
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
                    <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60" />
                  </div>
                  <div className="relative">
                    <label htmlFor="password" className="sr-only">Password</label>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyUp={(e)=> setIsCapsLock(e.getModifierState && e.getModifierState('CapsLock'))}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 pr-16 text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--foreground)]/20"
                      aria-describedby="password-hint"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-[var(--muted)] transition"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div id="password-hint" className="text-[10px] text-[var(--foreground)]/70">
                    {isCapsLock ? "Caps Lock is ON" : "Use at least 6 characters."}
                  </div>
                </div>
                <div className="mt-2 min-h-[20px] text-xs text-red-600 dark:text-red-400" aria-live="polite" aria-atomic="true">{error}</div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <input id="remember" type="checkbox" className="h-4 w-4 rounded border-[var(--border)]" />
                    <label htmlFor="remember">Remember me</label>
                  </div>
                  <Link href="#" className="hover:opacity-80">Forgot password?</Link>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-6 inline-flex items-center justify-center gap-2 w-full rounded-xl bg-black text-white px-4 py-3 text-sm hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed dark:bg-white dark:text-black shadow-sm hover:shadow-md"
                >
                  {isSubmitting ? (<><Loader2 size={16} className="animate-spin" /> Signing in</>) : (<>Sign in <ArrowRight size={16} /></>)}
                </button>
              </form>
              <div className="mt-6 text-sm text-[var(--foreground)]/70">
                New here? <Link href="/signup" className="underline underline-offset-4 hover:opacity-80">Create an account</Link>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 22, mass: 0.28, delay: 0.05 }}
          className="order-1 lg:order-2"
        >
          <div className="relative mt-44 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--background)] p-6 min-h-[425px] h-full">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(127,127,127,0.12),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(127,127,127,0.12),transparent_40%)]" />
            <div className="relative">
              <h3 className="text-xl font-semibold tracking-tight">Sign in to a faster workflow</h3>
              <p className="mt-3 text-sm text-[var(--foreground)]/70 max-w-sm">
                Your dashboard brings saved jobs, personalized matches, and ATS feedback in one place.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-[var(--foreground)]/80">
                <li>• Resume insights tailored to each job</li>
                <li>• One-click apply kit with cover letter draft</li>
                <li>• Track referrals and follow-ups</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}


