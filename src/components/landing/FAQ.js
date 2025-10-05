"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "Can I use AI features on the free plan?",
      a: "Yes! You can try our basic AI matching and resume analysis features with usage limits. Upgrade to Pro for unlimited access.",
    },
    {
      q: "What file formats do you support?",
      a: "We support PDF, DOCX, DOC, and plain text formats. Simply upload your resume or paste the content directly.",
    },
    {
      q: "How accurate is the ATS compatibility score?",
      a: "Our ATS analysis achieves 95%+ accuracy based on industry-standard parsing algorithms tested against major Applicant Tracking Systems.",
    },
    {
      q: "Do you integrate with LinkedIn?",
      a: "We generate personalized drafts for manual sending to comply with LinkedIn's Terms of Service.",
    },
    {
      q: "How do you handle data privacy?",
      a: "We use end-to-end encryption, RBAC, audit logs, and provide complete data deletion workflows. We never sell your data.",
    },
    {
      q: "Is my resume data stored on your servers?",
      a: "By default, we process resumes in real-time without permanent storage. You can delete all data anytime from account settings.",
    },
  ];

  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-[var(--foreground)]/70">
            Everything you need to know about Aura
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-4 items-start"
        >
          {faqs.map((faq, index) => (
            <div
              key={faq.q}
              className="rounded-2xl border border-[var(--border)] bg-[var(--background)] overflow-hidden h-fit"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-5 text-left flex items-start justify-between gap-4 hover:bg-[var(--muted)] transition-colors"
              >
                <span className="font-medium text-sm">{faq.q}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0 mt-0.5"
                >
                  <ChevronDown className="w-4 h-4 text-[var(--foreground)]/50" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-5 pb-5 pt-0">
                      <p className="text-sm text-[var(--foreground)]/70 leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-[var(--foreground)]/70">
            Still have questions?{" "}
            <a
              href="/contact"
              className="font-medium text-[var(--foreground)] hover:opacity-70 transition-opacity"
            >
              Contact us
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
