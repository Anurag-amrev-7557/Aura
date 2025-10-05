"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Target,
  Shield,
  Zap,
  FileCheck,
  Search,
  Users,
  Lock,
} from "lucide-react";

export default function AboutPage() {
  const features = [
    {
      icon: Sparkles,
      title: "AI ATS analysis",
      body: "Compare resumes against roles to surface gaps, keywords, and actionable edits.",
    },
    {
      icon: FileCheck,
      title: "Resume rewriting",
      body: "Transform bullets into quantified, impact-driven statements tailored to the role.",
    },
    {
      icon: Search,
      title: "Job discovery",
      body: "Search relevant roles quickly. Filter by location and apply with one click.",
    },
    {
      icon: Lock,
      title: "Privacy-first",
      body: "Your content is processed securely. We don't store uploaded files by default.",
    },
  ];

  const values = [
    {
      icon: Target,
      title: "Mission-Driven",
      description:
        "Making hiring more meritocratic by highlighting relevant skills and achievements clearly and fairly.",
    },
    {
      icon: Shield,
      title: "Trustworthy",
      description:
        "Built with privacy and security at the core. Your data is yours, always.",
    },
    {
      icon: Zap,
      title: "Fast & Efficient",
      description:
        "Get instant insights and recommendations. No waiting, no hassle.",
    },
    {
      icon: Users,
      title: "User-Centric",
      description:
        "Designed with job seekers in mind. Simple, intuitive, and powerful.",
    },
  ];

  const stats = [
    { number: "95%", label: "ATS Success Rate" },
    { number: "10K+", label: "Resumes Analyzed" },
    { number: "2.5x", label: "More Interviews" },
    { number: "100%", label: "Secure & Private" },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Background - matching landing page style */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-100px,rgba(99,102,241,0.25),transparent_70%),radial-gradient(800px_400px_at_10%_10%,rgba(34,197,94,0.18),transparent_60%),radial-gradient(700px_400px_at_90%_20%,rgba(14,165,233,0.18),transparent_60%)]" />
        <div className="absolute inset-0 backdrop-blur-[1px]" />
        <motion.div
          className="absolute left-[10%] top-[20%]"
          initial={{ opacity: 0.3, y: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3], y: [0, -12, 0] }}
          transition={{ duration: 8, repeat: Infinity, delay: 0 }}
          style={{
            width: 220,
            height: 220,
            background: "rgba(99,102,241,0.35)",
            filter: "blur(30px)",
            borderRadius: 9999,
          }}
        />
        <motion.div
          className="absolute right-[12%] top-[30%]"
          initial={{ opacity: 0.3, y: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3], y: [0, -12, 0] }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
          style={{
            width: 180,
            height: 180,
            background: "rgba(14,165,233,0.35)",
            filter: "blur(30px)",
            borderRadius: 9999,
          }}
        />
        <div className="absolute inset-0 opacity-[0.12]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="dots"
                width="26"
                height="26"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="1.5" cy="1.5" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" opacity="0.55" />
          </svg>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-20"
        >
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            About Aura
          </h1>
          <p className="mt-4 text-[var(--foreground)]/70">
            Aura helps candidates tailor resumes to job descriptions with
            AI-powered ATS insights. Our mission is to make hiring more
            meritocratic by highlighting relevant skills and achievements
            clearly and fairly.
          </p>
        </motion.div>

        {/* Stats Section */}
        <section className="mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                whileInView={{ y: [8, 0], opacity: [0, 1] }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="rounded-2xl border border-[var(--border)] p-6 bg-[var(--background)] text-center"
              >
                <div className="text-3xl font-semibold tracking-tight">
                  {stat.number}
                </div>
                <div className="text-sm text-[var(--foreground)]/70 mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-20 sm:mb-28">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Everything you need
            </h2>
            <p className="mt-4 text-[var(--foreground)]/70">
              Powerful tools to help you land your dream job with confidence.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                whileInView={{ y: [8, 0], opacity: [0, 1] }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="rounded-2xl border border-[var(--border)] p-6 bg-[var(--background)]"
              >
                <feature.icon className="w-5 h-5 text-[var(--foreground)]/70 mb-3" />
                <div className="text-base font-medium">{feature.title}</div>
                <div className="mt-2 text-sm text-[var(--foreground)]/70">
                  {feature.body}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-20 sm:mb-28">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Our values
            </h2>
            <p className="mt-4 text-[var(--foreground)]/70">
              The principles that guide everything we build.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <motion.div
                key={value.title}
                whileInView={{ y: [8, 0], opacity: [0, 1] }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="rounded-2xl border border-[var(--border)] p-6 bg-[var(--background)]"
              >
                <value.icon className="w-5 h-5 text-[var(--foreground)]/70 mb-3" />
                <div className="text-base font-medium mb-2">{value.title}</div>
                <div className="text-sm text-[var(--foreground)]/70">
                  {value.description}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-20 sm:mb-28">
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                How it works
              </h2>
              <p className="mt-4 text-[var(--foreground)]/70">
                A streamlined process designed to maximize your chances of
                success.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  {
                    title: "Upload your resume",
                    desc: "Paste your resume or upload a PDF. We support all common formats.",
                  },
                  {
                    title: "Add job description",
                    desc: "Copy and paste the job description you're targeting.",
                  },
                  {
                    title: "Get AI analysis",
                    desc: "Our AI analyzes keyword match, ATS compatibility, and suggests improvements.",
                  },
                  {
                    title: "Optimize & apply",
                    desc: "Download your tailored resume and apply with confidence.",
                  },
                ].map((s, i) => (
                  <motion.div
                    key={s.title}
                    whileInView={{ y: [8, 0], opacity: [0, 1] }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="rounded-2xl border border-[var(--border)] p-5 bg-[var(--background)]"
                  >
                    <div className="text-sm text-[var(--foreground)]/60">
                      Step {i + 1}
                    </div>
                    <div className="mt-1 font-medium">{s.title}</div>
                    <div className="text-sm text-[var(--foreground)]/70 mt-1">
                      {s.desc}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <motion.div
              whileInView={{ y: [8, 0], opacity: [0, 1] }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl border border-[var(--border)] bg-[var(--muted)] flex items-center justify-center">
                <Sparkles className="w-16 h-16 text-[var(--foreground)]/20" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <motion.div
          whileInView={{ y: [8, 0], opacity: [0, 1] }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-[var(--border)] p-12 bg-[var(--background)] text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Ready to land your dream job?
          </h2>
          <p className="mt-4 text-[var(--foreground)]/70 max-w-2xl mx-auto">
            Join thousands of job seekers who have successfully optimized their
            resumes with Aura.
          </p>
          <a
            href="/"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Get Started Free
          </a>
        </motion.div>
      </main>
    </div>
  );
}
