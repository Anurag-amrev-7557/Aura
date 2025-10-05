// Example monochrome SVG logos (replace with real company logos as needed)
const LOGOS = [
  {
    name: "Google",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="h-6 mx-auto" aria-label="Google">
        <rect width="48" height="48" rx="8" fill="currentColor" className="text-gray-200 dark:text-gray-700" />
        <g>
          <path d="M24 14c2.21 0 4.21.77 5.79 2.04l4.32-4.32C31.47 9.98 27.97 8 24 8 17.48 8 11.88 12.42 9.69 18.09l5.08 3.95C16.18 17.13 19.77 14 24 14Z" fill="currentColor" className="text-gray-400 dark:text-gray-500" />
          <path d="M43.61 20.08H24v7.84h11.16c-1.01 2.7-3.18 4.8-5.97 5.92l5.08 3.95C38.98 34.02 44 29.52 44 24c0-.68-.07-1.34-.19-1.92Z" fill="currentColor" className="text-gray-400 dark:text-gray-500" />
          <path d="M14.77 28.04A9.98 9.98 0 0 1 14 24c0-1.4.25-2.75.69-4.04l-5.08-3.95A15.98 15.98 0 0 0 8 24c0 2.53.61 4.93 1.69 7.09l5.08-3.95Z" fill="currentColor" className="text-gray-400 dark:text-gray-500" />
          <path d="M24 40c4.32 0 7.95-1.43 10.6-3.89l-5.08-3.95C27.97 33.23 26.09 34 24 34c-4.23 0-7.82-3.13-9.23-7.41l-5.08 3.95C11.88 35.58 17.48 40 24 40Z" fill="currentColor" className="text-gray-400 dark:text-gray-500" />
        </g>
      </svg>
    ),
  },
  {
    name: "Netflix",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="h-6 mx-auto" aria-label="Netflix">
        <rect width="48" height="48" rx="8" fill="currentColor" className="text-gray-200 dark:text-gray-700" />
        <path d="M16 12h4l8 24h-4l-8-24zm12 0h4v24h-4V12z" fill="currentColor" className="text-gray-400 dark:text-gray-500" />
      </svg>
    ),
  },
  {
    name: "Stripe",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="h-6 mx-auto" aria-label="Stripe">
        <rect width="48" height="48" rx="8" fill="currentColor" className="text-gray-200 dark:text-gray-700" />
        <text x="24" y="30" textAnchor="middle" fontSize="16" fill="currentColor" className="text-gray-400 dark:text-gray-500 font-bold">S</text>
      </svg>
    ),
  },
  {
    name: "Shopify",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="h-6 mx-auto" aria-label="Shopify">
        <rect width="48" height="48" rx="8" fill="currentColor" className="text-gray-200 dark:text-gray-700" />
        <path d="M18 36V12h12v24" stroke="currentColor" strokeWidth="2" className="text-gray-400 dark:text-gray-500" />
      </svg>
    ),
  },
  {
    name: "Slack",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="h-6 mx-auto" aria-label="Slack">
        <rect width="48" height="48" rx="8" fill="currentColor" className="text-gray-200 dark:text-gray-700" />
        <g>
          <rect x="13" y="22" width="8" height="4" rx="2" fill="currentColor" className="text-gray-400 dark:text-gray-500" />
          <rect x="27" y="22" width="8" height="4" rx="2" fill="currentColor" className="text-gray-400 dark:text-gray-500" />
          <rect x="22" y="13" width="4" height="8" rx="2" fill="currentColor" className="text-gray-400 dark:text-gray-500" />
          <rect x="22" y="27" width="4" height="8" rx="2" fill="currentColor" className="text-gray-400 dark:text-gray-500" />
        </g>
      </svg>
    ),
  },
  {
    name: "Amazon",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="h-6 mx-auto" aria-label="Amazon">
        <rect width="48" height="48" rx="8" fill="currentColor" className="text-gray-200 dark:text-gray-700" />
        <path d="M16 32c4 2 12 2 16 0" stroke="currentColor" strokeWidth="2" className="text-gray-400 dark:text-gray-500" />
        <circle cx="20" cy="20" r="2" fill="currentColor" className="text-gray-400 dark:text-gray-500" />
        <circle cx="28" cy="20" r="2" fill="currentColor" className="text-gray-400 dark:text-gray-500" />
      </svg>
    ),
  },
  {
    name: "Spotify",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="h-6 mx-auto" aria-label="Spotify">
        <rect width="48" height="48" rx="8" fill="currentColor" className="text-gray-200 dark:text-gray-700" />
        <path d="M16 28c4-2 12-2 16 0M18 32c3-1.5 9-1.5 12 0" stroke="currentColor" strokeWidth="2" className="text-gray-400 dark:text-gray-500" />
      </svg>
    ),
  },
  {
    name: "Uber",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="h-6 mx-auto" aria-label="Uber">
        <rect width="48" height="48" rx="8" fill="currentColor" className="text-gray-200 dark:text-gray-700" />
        <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="2" className="text-gray-400 dark:text-gray-500" />
        <circle cx="24" cy="24" r="2" fill="currentColor" className="text-gray-400 dark:text-gray-500" />
      </svg>
    ),
  },
  {
    name: "Dropbox",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="h-6 mx-auto" aria-label="Dropbox">
        <rect width="48" height="48" rx="8" fill="currentColor" className="text-gray-200 dark:text-gray-700" />
        <polygon points="24,12 30,16 24,20 18,16" fill="currentColor" className="text-gray-400 dark:text-gray-500" />
        <polygon points="24,28 30,32 24,36 18,32" fill="currentColor" className="text-gray-400 dark:text-gray-500" />
      </svg>
    ),
  },
  {
    name: "Meta",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="h-6 mx-auto" aria-label="Meta">
        <rect width="48" height="48" rx="8" fill="currentColor" className="text-gray-200 dark:text-gray-700" />
        <ellipse cx="24" cy="28" rx="10" ry="6" stroke="currentColor" strokeWidth="2" className="text-gray-400 dark:text-gray-500" />
        <ellipse cx="24" cy="20" rx="6" ry="10" stroke="currentColor" strokeWidth="2" className="text-gray-400 dark:text-gray-500" />
      </svg>
    ),
  },
];

export default function Logos() {
  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
        <div className="text-center text-sm text-[var(--foreground)]/60">Trusted by teams and talent</div>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 items-center opacity-80">
          {LOGOS.map((logo) => (
            <div
              key={logo.name}
              className="h-14 flex items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)]"
              title={logo.name}
              aria-label={logo.name}
            >
              {logo.svg}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
