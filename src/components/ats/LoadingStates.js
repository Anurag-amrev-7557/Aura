import { memo } from "react";

// Enhanced loading skeleton with shimmer effect
export const SkeletonLoader = memo(({ className = "", children }) => (
  <div className={`animate-pulse ${className}`}>
    {children || (
      <div className="space-y-4">
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-3/4"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-1/2"></div>
      </div>
    )}
  </div>
));
SkeletonLoader.displayName = "SkeletonLoader";

// Analysis progress component
export const AnalysisProgress = memo(({ stage = "parsing", progress = 0 }) => {
  const stages = [
    { key: "parsing", label: "Parsing Content", icon: "📄" },
    { key: "analyzing", label: "ATS Analysis", icon: "🔍" },
    { key: "scoring", label: "Generating Score", icon: "📊" },
    { key: "insights", label: "Creating Insights", icon: "💡" },
  ];

  const currentStageIndex = stages.findIndex((s) => s.key === stage);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between mb-4">
        {stages.map((s, index) => (
          <div
            key={s.key}
            className={`flex flex-col items-center ${
              index <= currentStageIndex
                ? "text-[var(--accent)]"
                : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                index <= currentStageIndex
                  ? "bg-[var(--accent)] text-white"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              {index < currentStageIndex ? "✓" : s.icon}
            </div>
            <span className="text-xs mt-1 text-center">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/80 h-2 rounded-full transition-all duration-500"
          style={{ width: `${Math.max(10, progress)}%` }}
        />
      </div>

      <div className="text-center text-sm text-gray-600">
        {progress}% Complete
      </div>
    </div>
  );
});
AnalysisProgress.displayName = "AnalysisProgress";

// Floating action button for mobile
export const FloatingActionButton = memo(
  ({ onClick, disabled, children, className = "" }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-[var(--accent)] text-white rounded-full shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed lg:hidden ${className}`}
      aria-label="Quick action"
    >
      {children}
    </button>
  ),
);
FloatingActionButton.displayName = "FloatingActionButton";

// Progress indicator for file upload
export const FileUploadProgress = memo(
  ({ progress = 0, status = "", fileName = "", onCancel }) => (
    <div className="bg-white border border-[var(--border)] rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-[var(--accent)] animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                className="opacity-25"
              />
              <path
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
                className="opacity-75"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {fileName}
            </p>
            <p className="text-xs text-gray-500">{status}</p>
          </div>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Cancel upload"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/80 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{progress}%</span>
        <span>{progress === 100 ? "Complete" : "Uploading..."}</span>
      </div>
    </div>
  ),
);
FileUploadProgress.displayName = "FileUploadProgress";

// Notification toast component
export const Toast = memo(
  ({ message, type = "info", isVisible = false, onClose, duration = 5000 }) => {
    const icons = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️",
    };

    const colors = {
      success: "bg-green-50 border-green-200 text-green-800",
      error: "bg-red-50 border-red-200 text-red-800",
      warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
      info: "bg-blue-50 border-blue-200 text-blue-800",
    };

    if (!isVisible) return null;

    return (
      <div
        className={`fixed top-4 right-4 z-50 max-w-sm w-full border rounded-lg p-4 shadow-lg transform transition-all duration-300 ${colors[type]}`}
      >
        <div className="flex items-start gap-3">
          <span className="text-lg">{icons[type]}</span>
          <div className="flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Close notification"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  },
);
Toast.displayName = "Toast";
