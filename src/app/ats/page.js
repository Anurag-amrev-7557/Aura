"use client";
import {
  useState,
  useRef,
  useCallback,
  useMemo,
  memo,
  Suspense,
  useEffect,
} from "react";
import { ErrorBoundary } from "react-error-boundary";

// Utility function for debouncing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Loading skeleton component
const LoadingSkeleton = memo(() => (
  <div className="animate-pulse space-y-4">
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
  </div>
));
LoadingSkeleton.displayName = "LoadingSkeleton";

// Error fallback component
const ErrorFallback = memo(({ error, resetErrorBoundary }) => (
  <div className="text-center py-8 px-4">
    <div className="text-red-600 mb-4">
      <svg
        className="w-16 h-16 mx-auto mb-4"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Something went wrong
    </h3>
    <p className="text-gray-600 mb-4">{error.message}</p>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Try again
    </button>
  </div>
));
ErrorFallback.displayName = "ErrorFallback";

// Main ATS Page component with performance optimizations
function ATSPage() {
  const [resumeText, setResumeText] = useState("");
  const [resumeStructured, setResumeStructured] = useState(null);
  const [jobText, setJobText] = useState("");
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [rewrite, setRewrite] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const fileInputRef = useRef(null);
  const typingRef = useRef({ timer: null, active: false });

  // Resizable columns state
  const [leftColumnWidth, setLeftColumnWidth] = useState(33.33);
  const [isResizing, setIsResizing] = useState(false);
  const [isClient, setIsClient] = useState(false); // Track client-side hydration
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);
  const containerRef = useRef(null);

  // Helper function to format structured resume data as text
  const formatResumeDataAsText = (data) => {
    let text = "";

    if (data.name) {
      text += `Name: ${data.name}\n\n`;
    }

    if (data.email) {
      text += `Email: ${data.email}\n\n`;
    }

    if (data.skills && Array.isArray(data.skills)) {
      text += `Skills: ${data.skills.join(", ")}\n\n`;
    }

    if (data.education && Array.isArray(data.education)) {
      text += "Education:\n";
      data.education.forEach((edu) => {
        text += `- ${edu.name}`;
        if (edu.dates) text += ` (${edu.dates})`;
        text += "\n";
      });
      text += "\n";
    }

    if (data.experience && Array.isArray(data.experience)) {
      text += "Experience:\n";
      data.experience.forEach((exp) => {
        text += `- ${exp.title}`;
        if (exp.organization) text += ` at ${exp.organization}`;
        if (exp.location) text += ` (${exp.location})`;
        if (exp.dates) text += ` (${exp.dates})`;
        text += "\n";
      });
      text += "\n";
    }

    return text.trim();
  };

  // Simple hash for caching (djb2) - memoized for performance
  const hashString = useCallback((s) => {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = (h << 5) + h + s.charCodeAt(i);
    return String(h >>> 0);
  }, []);

  // Generate dynamic templates with local cache + optimistic display
  const generateTemplates = useCallback(
    async (resumeContent) => {
      if (!resumeContent || !resumeContent.trim()) return;

      const cacheKey = `ats_templates_${hashString(resumeContent.slice(0, 1200))}`;

      try {
        // Show cached templates immediately if available
        const cached =
          typeof window !== "undefined"
            ? window.localStorage.getItem(cacheKey)
            : null;
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length) {
              setTemplates(parsed);
            }
          } catch {} // Ignore parsing errors
        } else {
          setTemplatesLoading(true);
        }

        // Always refresh from API in background
        const response = await fetch("/api/ats/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeContent }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate templates");
        }

        const data = await response.json();
        const nextTemplates = data.templates || [];
        setTemplates(nextTemplates);
        // Update cache
        try {
          typeof window !== "undefined" &&
            window.localStorage.setItem(
              cacheKey,
              JSON.stringify(nextTemplates),
            );
        } catch {} // Ignore localStorage errors
      } catch (error) {
        console.error("Template generation error:", error);
        // Fallback to static templates if generation fails
        setTemplates([
          {
            name: "Software Engineer",
            text: "We are seeking a Software Engineer with strong programming skills and experience in modern development practices. The ideal candidate will have experience with version control, testing, and agile methodologies. Strong problem-solving abilities and communication skills are essential.",
            matchReason: "Based on your software development experience",
            keySkills: ["Programming", "Problem Solving", "Communication"],
            experienceLevel: "Mid",
            industry: "Technology",
          },
          {
            name: "Full Stack Developer",
            text: "Looking for a Full Stack Developer with experience in both frontend and backend technologies. The role involves building scalable web applications, working with databases, and implementing user interfaces. Experience with modern frameworks and cloud platforms is preferred.",
            matchReason: "Based on your full-stack development skills",
            keySkills: ["Full Stack", "Web Development", "Database"],
            experienceLevel: "Mid",
            industry: "Technology",
          },
          {
            name: "Technical Specialist",
            text: "We need a Technical Specialist who can work on complex technical challenges and contribute to our development team. The role requires strong analytical skills, attention to detail, and the ability to work independently. Experience with multiple programming languages and frameworks is a plus.",
            matchReason: "Based on your technical background",
            keySkills: [
              "Technical Analysis",
              "Problem Solving",
              "Independence",
            ],
            experienceLevel: "Mid",
            industry: "Technology",
          },
        ]);
      } finally {
        setTemplatesLoading(false);
      }
    },
    [hashString],
  );

  // Debounced template generation to prevent excessive API calls
  const debouncedGenerateTemplates = useCallback(
    debounce(generateTemplates, 500),
    [generateTemplates],
  );

  // Memoize expensive computations
  const memoizedResumeScore = useMemo(() => {
    if (!result?.overallScore) return 0;
    return Math.round(result.overallScore * 100);
  }, [result?.overallScore]);

  const memoizedFormattedResume = useMemo(() => {
    if (!resumeStructured) return null;
    return formatResumeDataAsText(resumeStructured);
  }, [resumeStructured]);

  // Track if we're on a large screen
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // Handle screen size detection
  useEffect(() => {
    if (!isClient) return;

    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    checkScreenSize(); // Check initial size
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, [isClient]);

  // Memoize column styles to prevent unnecessary re-renders
  const leftColumnStyle = useMemo(
    () => ({
      width: isClient && isLargeScreen ? `${leftColumnWidth}%` : "100%",
    }),
    [isClient, isLargeScreen, leftColumnWidth],
  );

  const rightColumnStyle = useMemo(
    () => ({
      width: isClient && isLargeScreen ? `${100 - leftColumnWidth}%` : "100%",
    }),
    [isClient, isLargeScreen, leftColumnWidth],
  );

  // Smoothly type template content into the textarea
  const onPickTemplate = useCallback((t) => {
    const text = String(t?.text || "");
    if (!text) return;

    // cancel any ongoing typing
    if (typingRef.current.timer) {
      clearTimeout(typingRef.current.timer);
      typingRef.current.timer = null;
    }
    typingRef.current.active = true;

    setJobText("");

    let index = 0;
    // adaptive chunk size to keep it smooth and fast for long texts
    const total = text.length;
    const stepSize = Math.max(2, Math.floor(total / 120)); // ~120 steps max
    const stepDelayMs = 8; // ultra-smooth

    const step = () => {
      if (!typingRef.current.active) return;
      index = Math.min(total, index + stepSize);
      setJobText(text.slice(0, index));
      if (index < total) {
        typingRef.current.timer = setTimeout(step, stepDelayMs);
      } else {
        typingRef.current.timer = null;
        typingRef.current.active = false;
      }
    };

    step();
  }, []);

  // Cancel typing animation when user edits manually
  const onJobTextChange = useCallback((e) => {
    if (typingRef.current.timer) {
      clearTimeout(typingRef.current.timer);
      typingRef.current.timer = null;
    }
    typingRef.current.active = false;
    setJobText(e.target.value);
  }, []);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const readFileAsText = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadstart = () => setUploadProgress(5);
      reader.onprogress = (evt) => {
        if (evt.lengthComputable) {
          const pct = Math.min(95, Math.round((evt.loaded / evt.total) * 100));
          setUploadProgress(pct);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.onload = () => resolve(String(reader.result || ""));
      reader.readAsText(file);
    });

  // Memoized file validation
  const validateFile = useCallback((file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
      "text/markdown",
      "application/json",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];

    if (file.size > maxSize) {
      throw new Error("File size must be less than 10MB");
    }

    if (
      !allowedTypes.includes(file.type) &&
      !file.name.match(/\.(pdf|docx?|txt|md|json|png|jpe?g)$/i)
    ) {
      throw new Error("File type not supported");
    }

    return true;
  }, []);

  const handleFiles = useCallback(
    async (files) => {
      if (!files || !files.length) return;
      const file = files[0];
      setError("");
      setUploadProgress(0);
      setIsUploading(true);
      setUploadedFile(file);
      setUploadStatus("Preparing file...");

      try {
        // Validate file before processing
        validateFile(file);

        const ext = (file.name.split(".").pop() || "").toLowerCase();

        // For text files, read directly
        if (["txt", "md", "json"].includes(ext)) {
          setUploadStatus("Reading text file...");
          setUploadProgress(20);

          const text = await readFileAsText(file);
          setResumeText(text);
          // trigger template generation early for plain text for faster UX
          try {
            await debouncedGenerateTemplates(text);
          } catch {} // Ignore errors here, will fallback later
          setUploadProgress(100);
          setUploadStatus("Text file processed successfully");
          setIsUploading(false);
          return;
        }

        // For other files, use the Gemini PDF processing API
        setUploadStatus("Uploading to Gemini AI...");
        setUploadProgress(10);

        const formData = new FormData();
        formData.append("file", file);

        setUploadStatus("Processing resume with Gemini AI...");
        setUploadProgress(30);

        const response = await fetch("/api/ats/gemini-parse", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Resume parsing failed");
        }

        setUploadStatus("Extracting resume data with Gemini...");
        setUploadProgress(60);

        const result = await response.json();

        if (result.success && result.data) {
          // Use the structured data to create formatted text
          const formattedText = formatResumeDataAsText(result.data);
          setResumeText(formattedText);
          setResumeStructured(result.data);
          setUploadProgress(80);

          setUploadStatus("Generating job templates...");
          // Generate dynamic templates based on the resume content
          await debouncedGenerateTemplates(formattedText);

          setUploadProgress(90);
          setUploadStatus("Analyzing resume quality...");

          // Auto-analyze the extracted resume
          try {
            const analysisRes = await fetch("/api/ats", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                resume: formattedText,
                structured: result.data,
              }),
            });

            if (analysisRes.ok) {
              const analysisData = await analysisRes.json();
              setResult(analysisData);
            }
          } catch (analysisError) {
            console.error("Auto-analysis failed:", analysisError);
            // Don't block the upload flow if analysis fails
          }

          setUploadProgress(100);
          setUploadStatus("Resume processed successfully with Gemini AI!");
        } else {
          throw new Error("Failed to parse resume with Gemini");
        }
      } catch (e) {
        setError(e.message || "Could not process file");
        setUploadedFile(null);
        setUploadStatus("Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    [validateFile, debouncedGenerateTemplates],
  );

  const onDrop = useCallback(
    async (e) => {
      e.preventDefault();
      setIsDragging(false);
      await handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  // Retry mechanism for API calls
  const retryRequest = useCallback(
    async (requestFn, maxRetries = 3, delay = 1000) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await requestFn();
        } catch (error) {
          if (attempt === maxRetries) throw error;
          await new Promise((resolve) => setTimeout(resolve, delay * attempt));
        }
      }
    },
    [],
  );

  const onSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      console.log("onSubmit called", {
        resumeText: resumeText.length,
        jobText: jobText.length,
      });
      setError("");
      setResult(null);

      if (!resumeText.trim()) {
        setError("Please upload a resume file or paste resume text.");
        return;
      }

      setLoading(true);

      try {
        console.log("Making API call to /api/ats");

        const makeRequest = async () => {
          const res = await fetch("/api/ats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              resume: resumeText,
              job: jobText || undefined,
              structured: resumeStructured || undefined,
            }),
          });

          if (!res.ok) {
            const t = await res.text();
            throw new Error(t || "Request failed");
          }

          return res.json();
        };

        const data = await retryRequest(makeRequest);
        console.log("API response:", data);
        setResult(data);
      } catch (err) {
        console.error("API error:", err);
        setError(err.message || "Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [resumeText, jobText, resumeStructured, retryRequest],
  );

  // Resizable columns functionality
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (!isResizing || !containerRef.current) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const mouseX = e.clientX - containerRect.left;
      const containerWidth = containerRect.width;

      // Calculate new left column width as percentage
      let newLeftWidth = (mouseX / containerWidth) * 100;

      // Apply constraints (minimum 20%, maximum 80%)
      newLeftWidth = Math.max(20, Math.min(80, newLeftWidth));

      setLeftColumnWidth(newLeftWidth);

      // Save to localStorage
      if (hasLoadedFromStorage) {
        try {
          localStorage.setItem(
            "ats-left-column-width",
            newLeftWidth.toString(),
          );
        } catch (e) {
          // Ignore localStorage errors
        }
      }
    },
    [isResizing, hasLoadedFromStorage],
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add mouse event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Handle client-side hydration and immediate localStorage loading
  useEffect(() => {
    setIsClient(true);

    // Load saved width immediately after hydration
    try {
      const saved = localStorage.getItem("ats-left-column-width");
      if (saved) {
        const savedWidth = parseFloat(saved);
        if (!isNaN(savedWidth) && savedWidth >= 20 && savedWidth <= 80) {
          setLeftColumnWidth(savedWidth);
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }

    // Use a small timeout to ensure this happens after the initial render
    setTimeout(() => {
      setHasLoadedFromStorage(true);
    }, 0);
  }, []);

  // Handle responsive behavior - reset width on smaller screens
  useEffect(() => {
    if (!isLargeScreen && leftColumnWidth !== 33.33) {
      setLeftColumnWidth(33.33);
    }
  }, [isLargeScreen, leftColumnWidth]);

  // Add offline detection
  useEffect(() => {
    const handleOnline = () => setError("");
    const handleOffline = () =>
      setError("You are currently offline. Some features may not work.");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div
        ref={containerRef}
        className="min-h-[calc(100vh-200px)] flex flex-col lg:flex-row mx-2 sm:mx-4 my-4 sm:my-8 gap-4 lg:gap-0 relative"
        style={{ cursor: isResizing ? "col-resize" : "default" }}
      >
        {/* Left Column */}
        <div
          className={`w-full flex flex-col max-h-[50vh] lg:max-h-none overflow-y-auto scrollbar-hide border border-[var(--border)] lg:border-r-0 rounded-xl lg:rounded-r-none lg:rounded-l-xl ${
            !isResizing ? "transition-all duration-200 ease-out" : ""
          }`}
          style={leftColumnStyle}
        >
          {/* Heading Section */}
          <div className="p-4 sm:p-6 lg:p-8 border-b border-[var(--border)]/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/80 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
                  ATS Analyzer
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div>
                  <span className="text-sm font-medium text-[var(--accent)]">
                    AI-Powered
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[var(--foreground)]/60 leading-relaxed text-sm">
              Upload your resume and job description to receive comprehensive
              ATS analysis with actionable insights and optimization
              recommendations.
            </p>
          </div>

          {/* Resume Upload Section */}
          <div className="p-4 sm:p-6 border-b border-[var(--border)]">
            <form onSubmit={onSubmit}>
              <div
                className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 bg-gradient-to-br from-[var(--background)] to-[var(--muted)]/20 p-6 ${
                  isDragging
                    ? "border-[var(--accent)] bg-[var(--accent)]/5 scale-[1.02] shadow-lg shadow-[var(--accent)]/20"
                    : "border-[var(--border)] hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/5"
                }`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                role="button"
                tabIndex={0}
                aria-label="Drop zone for resume upload"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[var(--accent)]/10">
                      <svg
                        className="w-5 h-5 text-[var(--accent)]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--foreground)]">
                        Resume Upload
                      </h3>
                      <p className="text-sm text-[var(--foreground)]/60">
                        Upload your resume for AI analysis
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs text-[var(--foreground)]/50">
                    <span className="px-2 py-1 rounded-full bg-[var(--muted)]">
                      PDF
                    </span>
                    <span className="px-2 py-1 rounded-full bg-[var(--muted)]">
                      DOCX
                    </span>
                    <span className="px-2 py-1 rounded-full bg-[var(--muted)]">
                      DOC
                    </span>
                    <span className="px-2 py-1 rounded-full bg-[var(--muted)]">
                      +
                    </span>
                  </div>
                </div>

                {/* Upload Area */}
                <div className="relative">
                  {!uploadedFile ? (
                    <div className="text-center py-8 pb-0">
                      {/* Upload Icon with Animation */}
                      <div className="relative mb-6">
                        <div
                          className={`mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-[var(--accent)]/10 to-[var(--accent)]/20 flex items-center justify-center transition-all duration-300 ${
                            isDragging
                              ? "scale-110 rotate-3"
                              : "hover:scale-105"
                          }`}
                        >
                          <svg
                            className={`w-8 h-8 text-[var(--accent)] transition-transform duration-300 ${
                              isUploading ? "animate-pulse" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            {isUploading ? (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                              />
                            ) : (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            )}
                          </svg>
                        </div>
                        {isDragging && (
                          <div className="absolute inset-0 rounded-full border-2 border-[var(--accent)]"></div>
                        )}
                      </div>

                      {/* Upload Text */}
                      <div className="space-y-3">
                        <h4 className="text-lg font-medium text-[var(--foreground)]">
                          {isUploading
                            ? "Processing your resume..."
                            : "Drop your resume here"}
                        </h4>
                        <p className="text-sm text-[var(--foreground)]/70 max-w-sm mx-auto">
                          {isUploading
                            ? uploadStatus ||
                              "Our AI is extracting and analyzing your resume content"
                            : "Drag and drop your resume file, or click to browse"}
                        </p>

                        {!isUploading && (
                          <button
                            type="button"
                            className="inline-flex items-center cursor-pointer gap-2 px-6 py-3 rounded-full bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent)]/90 transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none"
                            onClick={() => fileInputRef.current?.click()}
                            aria-label="Choose file to upload resume"
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
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                            Choose File
                          </button>
                        )}
                      </div>

                      {/* Supported Formats */}
                      {!isUploading && (
                        <div className="mt-6 pt-4 border-t border-[var(--border)]">
                          <p className="text-xs text-[var(--foreground)]/50 mb-2">
                            Supported formats:
                          </p>
                          <div className="flex flex-wrap justify-center gap-2">
                            {[
                              "PDF",
                              "DOCX",
                              "DOC",
                              "TXT",
                              "MD",
                              "PNG",
                              "JPG",
                            ].map((format) => (
                              <span
                                key={format}
                                className="px-2 py-1 text-xs rounded-md bg-[var(--muted)]/50 text-[var(--foreground)]/70"
                              >
                                {format}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Success State - Minimalist Design */}
                      <div className="group relative p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)]/30 transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-[var(--accent)]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-medium text-[var(--foreground)]">
                                Resume Ready
                              </h4>
                              <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></div>
                            </div>
                            <p className="text-sm text-[var(--foreground)]/70 truncate">
                              {uploadedFile.name}
                            </p>
                            <p className="text-xs text-[var(--foreground)]/50">
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                              • Ready for analysis
                            </p>
                          </div>
                          <button
                            type="button"
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-xl hover:bg-[var(--muted)] transition-all duration-200 cursor-pointer"
                            onClick={() => {
                              setUploadedFile(null);
                              setResumeText("");
                              setResumeStructured(null);
                              setUploadProgress(0);
                            }}
                            title="Upload different file"
                          >
                            <svg
                              className="w-5 h-5 text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Progress Bar */}
                  {isUploading && (
                    <div className="mt-4 p-4 rounded-xl bg-[var(--muted)]/20 border border-[var(--border)]">
                      <div className="flex items-center justify-between text-sm mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></div>
                          <span className="text-[var(--foreground)]/70 font-medium">
                            {uploadStatus}
                          </span>
                        </div>
                        <span className="text-[var(--accent)] font-semibold">
                          {uploadProgress}%
                        </span>
                      </div>

                      <div className="relative h-1 bg-[var(--muted)] rounded-full overflow-hidden mb-2">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/80 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                      </div>

                      {/* Progress Steps */}
                      <div className="flex items-center justify-between text-xs text-[var(--foreground)]/50">
                        <span
                          className={
                            uploadProgress >= 10 ? "text-[var(--accent)]" : ""
                          }
                        >
                          Upload
                        </span>
                        <span
                          className={
                            uploadProgress >= 30 ? "text-[var(--accent)]" : ""
                          }
                        >
                          Gemini AI
                        </span>
                        <span
                          className={
                            uploadProgress >= 60 ? "text-[var(--accent)]" : ""
                          }
                        >
                          Extract
                        </span>
                        <span
                          className={
                            uploadProgress >= 80 ? "text-[var(--accent)]" : ""
                          }
                        >
                          Templates
                        </span>
                        <span
                          className={
                            uploadProgress >= 100 ? "text-[var(--accent)]" : ""
                          }
                        >
                          Complete
                        </span>
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.txt,.md,.json,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                    aria-label="File input for resume upload"
                    aria-describedby="file-upload-help"
                  />
                  <div id="file-upload-help" className="sr-only">
                    Choose a resume file to upload. Supported formats: PDF,
                    DOCX, DOC, TXT, MD, JSON, PNG, JPG
                  </div>
                </div>

                {/* Resume Content Preview - Minimalist */}
                {resumeText && (
                  <div className="mt-4 p-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></div>
                        <span className="text-xs font-medium text-[var(--foreground)]/70">
                          Extracted Content
                        </span>
                      </div>
                      <span className="text-xs text-[var(--foreground)]/50">
                        {resumeText.length} chars
                      </span>
                    </div>
                    <div
                      className={`text-sm text-[var(--foreground)]/80 leading-relaxed scrollbar-hide ${
                        isContentExpanded ? "max-h-none" : "max-h-24"
                      } overflow-y-auto`}
                    >
                      {isContentExpanded
                        ? resumeText
                        : resumeText.substring(0, 400)}
                      {!isContentExpanded && resumeText.length > 400 && (
                        <span className="text-[var(--foreground)]/50">...</span>
                      )}
                    </div>
                    {resumeText.length > 400 && (
                      <button
                        type="button"
                        onClick={() => setIsContentExpanded(!isContentExpanded)}
                        className="mt-2 text-xs text-[var(--accent)] hover:text-[var(--accent)]/80 font-medium transition-colors cursor-pointer"
                      >
                        {isContentExpanded ? "See Less" : "See More"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Job Description Section */}
          <div className="p-4 sm:p-6 flex-1">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 sm:p-5 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[var(--accent)]/10">
                    {/* Briefcase icon for Job Description */}
                    <svg
                      className="w-5 h-5 text-[var(--accent)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 7V5a3 3 0 013-3h6a3 3 0 013 3v2M3 7h18a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2zm6 4h6"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--foreground)]">
                      Job Description
                    </h3>
                    <p className="text-sm text-[var(--foreground)]/60">
                      {templatesLoading
                        ? "Generating personalized templates..."
                        : "AI-generated templates based on your resume"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Template Tags */}
              {templatesLoading ? (
                <div className="mt-2 mb-4 p-3 rounded-xl bg-[var(--muted)]/20 animate-pulse flex gap-2 items-center">
                  <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    Generating AI templates...
                  </span>
                </div>
              ) : templates.length > 0 ? (
                <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-500">
                  <div className="flex items-center gap-2 animate-in fade-in duration-300 delay-100">
                    <svg
                      className="w-4 h-4 text-[var(--accent)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      Quick Templates
                    </span>
                    <span className="text-xs text-[var(--foreground)]/60">
                      Click to fill
                    </span>
                  </div>

                  {/* Template Carousel */}
                  <div className="relative mb-4 scrollbar-hide px-6">
                    {/* Controls */}
                    <button
                      type="button"
                      aria-label="Previous templates"
                      onClick={() => {
                        const scroller =
                          document.getElementById("template-carousel");
                        if (scroller)
                          scroller.scrollBy({ left: -320, behavior: "smooth" });
                      }}
                      className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-[var(--background)]/80 backdrop-blur px-2 py-2 rounded-full border border-[var(--border)] shadow hover:bg-[var(--muted)] hidden sm:flex"
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
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-label="Next templates"
                      onClick={() => {
                        const scroller =
                          document.getElementById("template-carousel");
                        if (scroller)
                          scroller.scrollBy({ left: 320, behavior: "smooth" });
                      }}
                      className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-[var(--background)]/80 backdrop-blur px-2 py-2 rounded-full border border-[var(--border)] shadow hover:bg-[var(--muted)] hidden sm:flex"
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>

                    <div
                      id="template-carousel"
                      className="no-scrollbar scrollbar-hide overflow-x-auto snap-x snap-mandatory scroll-pl-4 pr-1"
                    >
                      <div className="flex gap-3 min-w-full">
                        {templates.map((template, index) => (
                          <button
                            key={index}
                            onClick={() => onPickTemplate(template)}
                            className="group relative px-3 py-2 rounded-full border border-[var(--border)] bg-gradient-to-r from-[var(--background)] to-[var(--muted)]/20 hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/5 transition-all duration-300 cursor-pointer text-left animate-in slide-in-from-left-2 fade-in duration-500 hover:shadow-md snap-start flex-shrink-0 focus:outline-none"
                            aria-label={`Apply ${template.name} template`}
                            title={`Click to apply ${template.name} job template`}
                            style={{
                              animationDelay: `${index * 80}ms`,
                              animationFillMode: "both",
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors duration-200">
                                {template.name}
                              </span>
                              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]/60 group-hover:bg-[var(--accent)] transition-colors duration-200"></div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="-mt-2 -mb-2 text-center py-4 animate-in fade-in duration-500 flex items-center justify-start gap-1">
                  <div className="w-8 h-8 rounded-full bg-[var(--muted)]/50 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-[var(--foreground)]/50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs text-[var(--foreground)]/60">
                    Upload your resume to get personalized job templates
                  </span>
                </div>
              )}

              {/* Job Description Textarea */}
              <textarea
                className="w-full scrollbar-hide mt-0 flex-1 min-h-[160px] rounded-xl border border-[var(--border)] bg-transparent p-3 focus:outline-none resize-none"
                placeholder="Paste target job description here..."
                value={jobText}
                onChange={onJobTextChange}
                rows={8}
                aria-label="Job description textarea"
                aria-describedby="job-description-help"
              />
              <div id="job-description-help" className="sr-only">
                Enter the job description you want to analyze your resume
                against
              </div>

              {/* Action Buttons */}
              <div className="mt-4 space-y-3">
                <div className="flex gap-2 overflow-x-auto">
                  {/* Analyze Button with Icon */}
                  <button
                    type="submit"
                    disabled={loading}
                    onClick={onSubmit}
                    className="inline-flex items-center cursor-pointer rounded-full bg-[var(--accent)] text-white px-6 py-3 text-sm sm:text-base shadow-[0_6px_24px_rgba(0,0,0,0.20)] hover:opacity-90 transition-opacity disabled:opacity-60 whitespace-nowrap flex-shrink-0 focus:outline-none"
                    aria-label={
                      loading
                        ? "Analyzing resume..."
                        : "Analyze resume against job description"
                    }
                  >
                    {loading ? (
                      <>
                        <svg
                          className="w-4 h-4 mr-2 animate-spin"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          ></path>
                        </svg>
                        Analyzing…
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Analyze
                      </>
                    )}
                  </button>
                  {/* AI Improve Resume Button with Icon */}
                  <button
                    type="button"
                    disabled={
                      editLoading || !resumeText.trim() || !uploadedFile
                    }
                    onClick={async () => {
                      setError("");
                      setRewrite(null);
                      setEditLoading(true);
                      try {
                        const res = await fetch("/api/ats", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            resume: resumeText,
                            job: jobText || undefined,
                          }),
                        });
                        if (!res.ok) {
                          const t = await res.text();
                          throw new Error(t || "Rewrite failed");
                        }
                        const data = await res.json();
                        setRewrite(data);
                      } catch (e) {
                        setError(e.message || "Rewrite failed");
                      } finally {
                        setEditLoading(false);
                      }
                    }}
                    className="inline-flex items-center cursor-pointer rounded-full border border-[var(--border)] px-4 py-3 text-sm sm:text-base hover:bg-[var(--muted)] disabled:opacity-60 whitespace-nowrap flex-shrink-0 focus:outline-none"
                    aria-label={
                      editLoading
                        ? "Improving resume..."
                        : "Use AI to improve your resume"
                    }
                  >
                    {editLoading ? (
                      <>
                        <svg
                          className="w-4 h-4 mr-2 animate-spin"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          ></path>
                        </svg>
                        Improving…
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 20h9"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16.5 3.5a2.121 2.121 0 013 3L7 19.5l-4 1 1-4L16.5 3.5z"
                          />
                        </svg>
                        AI Improve Resume
                      </>
                    )}
                  </button>
                  {/* Find Related Jobs Button with Icon */}
                  <button
                    type="button"
                    disabled={jobsLoading}
                    style={{ pointerEvents: jobsLoading ? "none" : "auto" }}
                    onClick={async () => {
                      console.log("Find Related Jobs clicked");
                      setError("");
                      setJobs([]);
                      setJobsLoading(true);
                      try {
                        const qBase =
                          jobText.trim() || resumeText.slice(0, 200).trim();
                        console.log("Search query base:", qBase);
                        if (!qBase)
                          throw new Error(
                            "Provide resume or job description for job search",
                          );

                        // Build params like the jobs page does
                        const params = new URLSearchParams();
                        params.set(
                          "q",
                          qBase.replace(/\n+/g, " ").slice(0, 300),
                        );
                        params.set("where", "global");
                        params.set("page", "1");

                        console.log(
                          "API URL:",
                          `/api/ats?${params.toString()}`,
                        );
                        const res = await fetch(
                          `/api/ats?${params.toString()}`,
                        );
                        console.log("API response status:", res.status);
                        if (!res.ok) {
                          const t = await res.text();
                          throw new Error(t || "Jobs search failed");
                        }
                        const data = await res.json();
                        console.log("Jobs API response:", data);
                        const jobsArray = Array.isArray(data?.jobs)
                          ? data.jobs
                          : [];
                        console.log("Setting jobs:", jobsArray);
                        setJobs(jobsArray);
                      } catch (e) {
                        console.error("Jobs search error:", e);
                        setError(e.message || "Jobs search failed");
                      } finally {
                        setJobsLoading(false);
                      }
                    }}
                    className="inline-flex items-center cursor-pointer rounded-full border border-[var(--border)] px-4 py-3 text-sm sm:text-base hover:bg-[var(--muted)] disabled:opacity-60 whitespace-nowrap flex-shrink-0 focus:outline-none"
                    aria-label={
                      jobsLoading
                        ? "Searching for jobs..."
                        : "Find related job opportunities"
                    }
                  >
                    {jobsLoading ? (
                      <>
                        <svg
                          className="w-4 h-4 mr-2 animate-spin"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          ></path>
                        </svg>
                        Searching…
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                          />
                        </svg>
                        Find Related Jobs
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resizable Divider - Only visible on lg+ screens */}
        <div
          className={`hidden lg:block w-1 cursor-col-resize relative group transition-all duration-200 ${
            isResizing
              ? "bg-[var(--accent)] shadow-lg scale-x-150"
              : "bg-[var(--border)] hover:bg-[var(--accent)]/50"
          }`}
          onMouseDown={handleMouseDown}
          style={{
            cursor: "col-resize",
            userSelect: "none",
          }}
          title="Drag to resize columns"
        >
          {/* Visual drag handle */}
          <div
            className={`absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-12 flex items-center justify-center transition-opacity duration-200 ${
              isResizing || "group-hover:opacity-100 opacity-0"
            }`}
          >
            <div
              className={`w-1 h-8 rounded-full shadow-sm transition-all duration-200 ${
                isResizing
                  ? "bg-[var(--accent)] h-12 w-1.5"
                  : "bg-[var(--accent)]"
              }`}
            >
              <div className="w-full h-full bg-gradient-to-b from-[var(--accent)]/60 to-[var(--accent)] rounded-full"></div>
            </div>
          </div>
          {/* Hover area expansion */}
          <div className="absolute inset-y-0 -left-2 -right-2"></div>
        </div>

        {/* Right Column - Results */}
        <div
          className={`w-full flex flex-col overflow-y-auto scrollbar-hide border border-[var(--border)] rounded-xl lg:rounded-l-none lg:rounded-r-xl ${
            !isResizing ? "transition-all duration-200 ease-out" : ""
          }`}
          style={rightColumnStyle}
        >
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 px-8">
                {/* Custom Animated Resume Analysis SVG */}
                <div
                  className="relative mb-8"
                  role="img"
                  aria-label="Resume analysis in progress"
                >
                  <svg
                    width="120"
                    height="120"
                    viewBox="0 0 120 120"
                    className="animate-pulse"
                    aria-hidden="true"
                  >
                    {/* Background Circle */}
                    <circle
                      cx="60"
                      cy="60"
                      r="55"
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="2"
                      opacity="0.2"
                    />

                    {/* Animated Progress Circle */}
                    <circle
                      cx="60"
                      cy="60"
                      r="55"
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray="70 283"
                      strokeDashoffset="0"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 60 60;360 60 60"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>

                    {/* Resume Document */}
                    <rect
                      x="45"
                      y="35"
                      width="30"
                      height="40"
                      rx="2"
                      fill="var(--accent)"
                      opacity="0.1"
                      stroke="var(--accent)"
                      strokeWidth="1.5"
                    />
                    <rect
                      x="50"
                      y="42"
                      width="20"
                      height="2"
                      fill="var(--accent)"
                      opacity="0.6"
                    />
                    <rect
                      x="50"
                      y="48"
                      width="15"
                      height="1.5"
                      fill="var(--accent)"
                      opacity="0.4"
                    />
                    <rect
                      x="50"
                      y="54"
                      width="18"
                      height="1.5"
                      fill="var(--accent)"
                      opacity="0.4"
                    />
                    <rect
                      x="50"
                      y="60"
                      width="12"
                      height="1.5"
                      fill="var(--accent)"
                      opacity="0.4"
                    />

                    {/* AI Brain Icon */}
                    <circle
                      cx="60"
                      cy="25"
                      r="8"
                      fill="var(--accent)"
                      opacity="0.8"
                    >
                      <animate
                        attributeName="opacity"
                        values="0.8;0.4;0.8"
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <path
                      d="M55 25 Q60 20 65 25 Q60 30 55 25"
                      fill="white"
                      opacity="0.9"
                    />

                    {/* Floating Analysis Elements */}
                    <circle
                      cx="25"
                      cy="45"
                      r="3"
                      fill="var(--accent)"
                      opacity="0.6"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="translate"
                        values="0,0; 0,-5; 0,0"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle
                      cx="95"
                      cy="65"
                      r="2.5"
                      fill="var(--accent)"
                      opacity="0.5"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="translate"
                        values="0,0; 0,-3; 0,0"
                        dur="1.8s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle
                      cx="30"
                      cy="80"
                      r="2"
                      fill="var(--accent)"
                      opacity="0.4"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="translate"
                        values="0,0; 0,-4; 0,0"
                        dur="2.2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </svg>
                </div>

                <h3
                  className="text-xl font-semibold text-[var(--foreground)] mb-3"
                  role="status"
                  aria-live="polite"
                >
                  AI Resume Analysis in Progress
                </h3>
                <p className="text-sm text-[var(--foreground)]/70 text-center max-w-md leading-relaxed">
                  Our advanced AI is analyzing your resume structure, keywords,
                  and ATS compatibility to provide comprehensive insights and
                  optimization recommendations.
                </p>

                {/* Progress Steps */}
                <div className="mt-6 flex items-center gap-4 text-xs text-[var(--foreground)]/60">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></div>
                    <span>Parsing Content</span>
                  </div>
                  <div className="w-8 h-px bg-[var(--border)]"></div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--muted)]"></div>
                    <span>ATS Analysis</span>
                  </div>
                  <div className="w-8 h-px bg-[var(--border)]"></div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--muted)]"></div>
                    <span>Generating Insights</span>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 px-8">
                {/* Error State SVG */}
                <div className="relative mb-6">
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2"
                      opacity="0.2"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      fill="#fef2f2"
                      stroke="#ef4444"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M35 35 L65 65 M65 35 L35 65"
                      stroke="#ef4444"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <circle cx="50" cy="25" r="3" fill="#ef4444" opacity="0.6">
                      <animate
                        attributeName="opacity"
                        values="0.6;0.2;0.6"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-red-600 mb-2">
                  Analysis Failed
                </h3>
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 max-w-md text-center">
                  {error}
                </div>
              </div>
            ) : jobsLoading ? (
              <div className="flex flex-col items-center justify-center py-16 px-8">
                {/* Custom Job Search Animation */}
                <div className="relative mb-8">
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    {/* Background */}
                    <circle
                      cx="60"
                      cy="60"
                      r="55"
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="2"
                      opacity="0.1"
                    />

                    {/* Search Magnifying Glass */}
                    <circle
                      cx="50"
                      cy="50"
                      r="20"
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    >
                      <animate
                        attributeName="r"
                        values="20;25;20"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <path
                      d="M65 65 L80 80"
                      stroke="var(--accent)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />

                    {/* Floating Job Icons */}
                    <rect
                      x="25"
                      y="30"
                      width="12"
                      height="8"
                      rx="1"
                      fill="var(--accent)"
                      opacity="0.6"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="translate"
                        values="0,0; 0,-8; 0,0"
                        dur="2.5s"
                        repeatCount="indefinite"
                      />
                    </rect>
                    <rect
                      x="85"
                      y="45"
                      width="12"
                      height="8"
                      rx="1"
                      fill="var(--accent)"
                      opacity="0.5"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="translate"
                        values="0,0; 0,-6; 0,0"
                        dur="2.2s"
                        repeatCount="indefinite"
                      />
                    </rect>
                    <rect
                      x="20"
                      y="70"
                      width="12"
                      height="8"
                      rx="1"
                      fill="var(--accent)"
                      opacity="0.4"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="translate"
                        values="0,0; 0,-5; 0,0"
                        dur="2.8s"
                        repeatCount="indefinite"
                      />
                    </rect>

                    {/* Search Waves */}
                    <circle
                      cx="50"
                      cy="50"
                      r="30"
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="1"
                      opacity="0.3"
                    >
                      <animate
                        attributeName="r"
                        values="30;40;30"
                        dur="3s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.3;0;0.3"
                        dur="3s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="1"
                      opacity="0.2"
                    >
                      <animate
                        attributeName="r"
                        values="40;50;40"
                        dur="3s"
                        repeatCount="indefinite"
                        begin="0.5s"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.2;0;0.2"
                        dur="3s"
                        repeatCount="indefinite"
                        begin="0.5s"
                      />
                    </circle>
                  </svg>
                </div>

                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-3">
                  Searching Job Market
                </h3>
                <p className="text-sm text-[var(--foreground)]/70 text-center max-w-md leading-relaxed">
                  Scanning thousands of job listings to find the perfect matches
                  based on your skills, experience, and career goals.
                </p>

                {/* Search Progress */}
                <div className="mt-6 flex items-center gap-4 text-xs text-[var(--foreground)]/60">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></div>
                    <span>Querying Databases</span>
                  </div>
                  <div className="w-8 h-px bg-[var(--border)]"></div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--muted)]"></div>
                    <span>Matching Skills</span>
                  </div>
                  <div className="w-8 h-px bg-[var(--border)]"></div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--muted)]"></div>
                    <span>Ranking Results</span>
                  </div>
                </div>
              </div>
            ) : !result && !rewrite && (!jobs || jobs.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-16 px-8 mt-32">
                {/* Custom Empty State Animation */}
                <div className="relative mb-8">
                  <svg width="140" height="140" viewBox="0 0 140 140">
                    {/* Background Elements */}
                    <circle
                      cx="70"
                      cy="70"
                      r="65"
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="1"
                      opacity="0.1"
                    />
                    <circle
                      cx="70"
                      cy="70"
                      r="55"
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="1"
                      opacity="0.05"
                    />

                    {/* Main Document */}
                    <rect
                      x="50"
                      y="40"
                      width="40"
                      height="50"
                      rx="3"
                      fill="var(--background)"
                      stroke="var(--accent)"
                      strokeWidth="2"
                      opacity="0.8"
                    />

                    {/* Document Content Lines */}
                    <rect
                      x="55"
                      y="50"
                      width="30"
                      height="2"
                      rx="1"
                      fill="var(--accent)"
                      opacity="0.3"
                    />
                    <rect
                      x="55"
                      y="58"
                      width="25"
                      height="1.5"
                      rx="0.5"
                      fill="var(--accent)"
                      opacity="0.2"
                    />
                    <rect
                      x="55"
                      y="66"
                      width="28"
                      height="1.5"
                      rx="0.5"
                      fill="var(--accent)"
                      opacity="0.2"
                    />
                    <rect
                      x="55"
                      y="74"
                      width="20"
                      height="1.5"
                      rx="0.5"
                      fill="var(--accent)"
                      opacity="0.2"
                    />

                    {/* Floating Icons */}
                    <g>
                      <path
                        d="M100 50 L105 55 L100 60"
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <animateTransform
                          attributeName="transform"
                          type="translate"
                          values="0,0; 5,0; 0,0"
                          dur="3s"
                          repeatCount="indefinite"
                        />
                      </path>
                      <path
                        d="M40 80 L35 85 L40 90"
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <animateTransform
                          attributeName="transform"
                          type="translate"
                          values="0,0; -5,0; 0,0"
                          dur="3s"
                          repeatCount="indefinite"
                          begin="0.5s"
                        />
                      </path>
                    </g>

                    {/* Sparkles */}
                    <g>
                      <path
                        d="M110 80 L112 82 L110 84 L108 82 Z"
                        fill="var(--accent)"
                        opacity="0.5"
                      >
                        <animate
                          attributeName="opacity"
                          values="0.5;0;0.5"
                          dur="2.5s"
                          repeatCount="indefinite"
                        />
                      </path>
                      <path
                        d="M30 40 L32 42 L30 44 L28 42 Z"
                        fill="var(--accent)"
                        opacity="0.4"
                      >
                        <animate
                          attributeName="opacity"
                          values="0.4;0;0.4"
                          dur="2.5s"
                          repeatCount="indefinite"
                          begin="0.3s"
                        />
                      </path>
                    </g>
                  </svg>
                </div>

                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                  Ready for Analysis
                </h3>
                <p className="text-sm text-[var(--foreground)]/70 text-center max-w-md leading-relaxed">
                  Upload your resume and a job description, then click
                  &apos;Analyze&apos; to see your results.
                </p>
              </div>
            ) : null}

            {/* Display Results */}
            <Suspense fallback={<LoadingSkeleton />}>
              {result && <ATSResult result={result} />}
              {rewrite && <ResumeRewrite rewrite={rewrite} />}
              {jobs && jobs.length > 0 && <JobListings jobs={jobs} />}
            </Suspense>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

// Memoized Result Component
const ATSResult = memo(({ result }) => {
  const overallScore = Math.round((result.overallScore || 0) * 100);

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* Header with Score */}
      <div className="flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-[var(--background)] to-[var(--muted)]/20 border border-[var(--border)]">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">
            Analysis Complete
          </h2>
          <p className="text-sm text-[var(--foreground)]/60">
            Here is your resume&apos;s ATS compatibility score.
          </p>
          {result.summary && (
            <p className="text-sm text-[var(--foreground)]/80 mt-2">
              {result.summary}
            </p>
          )}
        </div>
        <div className="relative w-24 h-24">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="var(--muted)"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeDasharray={`${overallScore}, 100`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-[var(--accent)]">
              {overallScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Strengths */}
      {result.strengths && result.strengths.length > 0 && (
        <div className="p-5 rounded-xl border border-green-500/20 bg-green-500/5">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
            <span className="text-green-500">✓</span> Strengths
          </h3>
          <ul className="space-y-2">
            {result.strengths.map((item, i) => (
              <li
                key={i}
                className="text-sm text-[var(--foreground)]/80 flex items-start gap-2"
              >
                <span className="text-green-500 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Matched Keywords */}
      {result.matchedKeywords && result.matchedKeywords.length > 0 && (
        <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--background)]">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3">
            Matched Keywords
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.matchedKeywords.map((kw, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-sm"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing Keywords */}
      {result.missingKeywords && result.missingKeywords.length > 0 && (
        <div className="p-5 rounded-xl border border-orange-500/20 bg-orange-500/5">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
            <span className="text-orange-500">!</span> Missing Keywords
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.missingKeywords.map((kw, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 text-sm"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Skill Gaps */}
      {result.skillGaps && result.skillGaps.length > 0 && (
        <div className="p-5 rounded-xl border border-red-500/20 bg-red-500/5">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
            <span className="text-red-500">×</span> Skill Gaps
          </h3>
          <ul className="space-y-2">
            {result.skillGaps.map((item, i) => (
              <li
                key={i}
                className="text-sm text-[var(--foreground)]/80 flex items-start gap-2"
              >
                <span className="text-red-500 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {result.improvements && result.improvements.length > 0 && (
        <div className="p-5 rounded-xl border border-blue-500/20 bg-blue-500/5">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
            <span className="text-blue-500">↑</span> Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {result.improvements.map((item, i) => (
              <li
                key={i}
                className="text-sm text-[var(--foreground)]/80 flex items-start gap-2"
              >
                <span className="text-blue-500 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div className="p-5 rounded-xl border border-purple-500/20 bg-purple-500/5">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
            <span className="text-purple-500">💡</span> Recommendations
          </h3>
          <ul className="space-y-2">
            {result.recommendations.map((item, i) => (
              <li
                key={i}
                className="text-sm text-[var(--foreground)]/80 flex items-start gap-2"
              >
                <span className="text-purple-500 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ATS Optimization */}
      {result.atsOptimization && (
        <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--background)]">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            ATS Optimization Analysis
          </h3>
          <div className="space-y-3">
            {result.atsOptimization.formatting && (
              <div>
                <span className="text-sm font-medium text-[var(--foreground)]">
                  Formatting:
                </span>
                <p className="text-sm text-[var(--foreground)]/70 mt-1">
                  {result.atsOptimization.formatting}
                </p>
              </div>
            )}
            {result.atsOptimization.keywords && (
              <div>
                <span className="text-sm font-medium text-[var(--foreground)]">
                  Keywords:
                </span>
                <p className="text-sm text-[var(--foreground)]/70 mt-1">
                  {result.atsOptimization.keywords}
                </p>
              </div>
            )}
            {result.atsOptimization.structure && (
              <div>
                <span className="text-sm font-medium text-[var(--foreground)]">
                  Structure:
                </span>
                <p className="text-sm text-[var(--foreground)]/70 mt-1">
                  {result.atsOptimization.structure}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
ATSResult.displayName = "ATSResult";

// Memoized Rewrite Component
const ResumeRewrite = memo(({ rewrite }) => (
  <div className="animate-in fade-in duration-500">
    <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">
      AI-Improved Resume
    </h2>
    <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]">
      <pre className="whitespace-pre-wrap text-sm text-[var(--foreground)]/80">
        {rewrite.improvedResume}
      </pre>
    </div>
  </div>
));
ResumeRewrite.displayName = "ResumeRewrite";

// Memoized Job Listings Component
const JobListings = memo(({ jobs }) => (
  <div className="animate-in fade-in duration-500">
    <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">
      Related Job Opportunities
    </h2>
    <div className="space-y-4">
      {jobs.map((job, index) => (
        <div
          key={job.id || index}
          className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)]/50 transition-colors"
        >
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            {job.title}
          </h3>
          <p className="text-sm text-[var(--foreground)]/70">{job.company}</p>
          <p className="text-xs text-[var(--foreground)]/50 mt-1">
            {job.location}
          </p>
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--accent)] hover:underline mt-2 inline-block"
          >
            View Job
          </a>
        </div>
      ))}
    </div>
  </div>
));
JobListings.displayName = "JobListings";

export default ATSPage;
