"use client";
import { useState } from "react";

export default function JobActions({ job }) {
  const [isBookmarked, setIsBookmarked] = useState(job.isBookmarked || false);
  const [isApplied, setIsApplied] = useState(false);

  const handleApply = () => {
    setIsApplied(true);
    // Here you would typically open an application modal or redirect
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Here you would typically make an API call
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this job: ${job.title} at ${job.companyName}`,
        url: window.location.href,
      });
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Apply Button */}
      <button
        onClick={handleApply}
        disabled={isApplied}
        className={`py-2.5 px-6 rounded-full font-semibold text-sm transition-all ${
          isApplied
            ? "bg-green-100 text-green-700 border border-green-300 cursor-not-allowed"
            : "bg-[var(--accent)] text-white hover:opacity-90 shadow-md"
        }`}
      >
        {isApplied ? (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Applied
          </span>
        ) : (
          "Apply Now"
        )}
      </button>

      {/* Save Button */}
      <button
        onClick={handleBookmark}
        className={`py-2.5 px-4 rounded-full font-medium text-sm border transition-all ${
          isBookmarked
            ? "bg-[var(--accent)] text-white border-[var(--accent)]"
            : "border-[var(--border)] hover:bg-[var(--muted)]"
        }`}
      >
        <span className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill={isBookmarked ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          Save
        </span>
      </button>

      {/* Share Button */}
      <button
        onClick={handleShare}
        className="py-2.5 px-4 rounded-full font-medium text-sm border border-[var(--border)] hover:bg-[var(--muted)] transition-all"
      >
        <span className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          Share
        </span>
      </button>

      {/* Report Button */}
      <button className="py-2.5 px-4 rounded-full font-medium text-sm border border-[var(--border)] hover:bg-[var(--muted)] transition-all text-[var(--foreground)]/60 hover:text-[var(--foreground)]">
        Report
      </button>
    </div>
  );
}
