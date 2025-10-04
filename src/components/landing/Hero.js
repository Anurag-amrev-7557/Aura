"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative overflow-visible pt-0">
      {/* Backdrop is now inside the hero, but stretches up behind the navbar with a gap */}
      <div className="relative h-full">
        <BackdropLayers />
        <div className="relative z-10 text-center px-4 sm:px-12 py-16 sm:py-45 text-black/90 rounded-[40px]">
          <h1 className="leading-[1.05] text-[4vw] font-semibold tracking-tight">
            The ultra‑modern platform
            <br />
            for jobs, hiring, and referrals
          </h1>
          <p className="mt-6 text-base sm:text-lg text-black/80 max-w-2xl mx-auto">
            Post openings, discover talent, track applications, and use AI for semantic
            job matching and ATS resume checks — fully customizable at every layer.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 sm:gap-4">
            <a
              href="#jobs"
              className="inline-flex items-center rounded-full bg-[var(--accent)] text-white px-6 py-3 text-sm sm:text-base shadow-[0_6px_24px_rgba(0,0,0,0.20)] hover:opacity-90 transition-opacity"
            >
              Find jobs
            </a>
            <a
              href="#post-job"
              className="inline-flex items-center rounded-full border border-[var(--border)] px-6 py-3 text-sm sm:text-base transition-colors duration-300 bg-transparent hover:bg-[var(--muted)]"
            >
              Post a job
            </a>
            <Link href="/ats" className="text-sm sm:text-base underline underline-offset-4 text-black/70 hover:text-black/90">
              Try AI resume check
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function BackdropLayers() {
  // Absolutely position the backdrop so it starts behind the navbar, but only within the hero section, with a gap from the very top
  // Use negative top margin to reach behind the navbar, but not full viewport
  // Animate the backdrop as if it's expanding out of the screen infinitely
  // Uses framer-motion for smooth infinite scale animation

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-0 right-0 -top-16 sm:-top-24 w-full z-0 flex items-start justify-center"
    >
      <div className="hidden lg:block w-full aspect-[2.2/1] relative bg-gradient-to-t from-blue-100 to-blue-200 h-[850px]">
        <div className="absolute inset-0 overflow-hidden contain-paint">
          <motion.div
            className="absolute inset-[0.5rem] rounded-[12rem] bg-white/2 shadow-[0_0_40px_rgba(173,216,255,0.5)] blur-[4px]"
          />
          <motion.div
            className="absolute inset-[3rem] rounded-[12rem] bg-white/2 shadow-[0_0_30px_rgba(173,216,255,0.4)] blur-[3px]"
          />
          <motion.div
            className="absolute inset-[6rem] rounded-[12rem] bg-white/2 shadow-[0_0_20px_rgba(173,216,255,0.3)] blur-[2px]"
          />
          <motion.div
            className="absolute inset-[10rem] rounded-[8rem] bg-white/2 shadow-[inset_0_0_30px_rgba(255,255,255,0.4)] blur-[1px]"
          />
        </div>
      </div>
    </div>
  );
}
