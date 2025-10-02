"use client";
import { motion } from "framer-motion";

export default function Highlights() {
  const items = [
    { kpi: "10x", label: "Faster sourcing" },
    { kpi: "35%", label: "Higher response rates" },
    { kpi: "-50%", label: "Time-to-hire" },
    { kpi: "95%", label: "Candidate satisfaction" },
  ];
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((it) => (
            <motion.div
              key={it.label}
              whileInView={{ y: [8, 0], opacity: [0, 1] }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl border border-[var(--border)] p-6 bg-[var(--background)] text-center"
            >
              <div className="text-3xl font-semibold tracking-tight">{it.kpi}</div>
              <div className="text-sm text-[var(--foreground)]/70 mt-1">{it.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


