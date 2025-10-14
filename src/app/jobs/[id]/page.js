"use client";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import JobDescription from "@/components/job-detail/JobDescription";
import JobSkills from "@/components/job-detail/JobSkills";
import JobActions from "@/components/job-detail/JobActions";
import JobDetails from "@/components/job-detail/JobDetails";
import CompanyInfo from "@/components/job-detail/CompanyInfo";
import CompanyReviews from "@/components/job-detail/CompanyReviews";
import RelatedJobs from "@/components/job-detail/RelatedJobs";

// Mock data - Replace with actual API call
const mockJobData = {
  1: {
    id: 1,
    title: "Senior Frontend Developer",
    companyName: "TechCorp Inc.",
    companyLogo: null,
    jobType: "fulltime",
    location: "Remote",
    stipend: 120000,
    duration: null,
    experienceRequired: "3-5 years",
    openings: 2,
    postedDate: "2 days ago",
    applicationDeadline: "2025-11-30",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Redux", "Jest"],
    description:
      "We're looking for an experienced frontend developer to join our growing team. You'll work on cutting-edge web applications using modern technologies.",
    fullDescription: `We are seeking a talented and experienced Senior Frontend Developer to join our dynamic team at TechCorp Inc. In this role, you will be responsible for building and maintaining high-quality, scalable web applications that serve millions of users worldwide.

As a Senior Frontend Developer, you will collaborate closely with designers, backend engineers, and product managers to create exceptional user experiences. You will have the opportunity to work on challenging projects, mentor junior developers, and contribute to architectural decisions.

This is a fully remote position, offering you the flexibility to work from anywhere while being part of a collaborative and innovative team.`,
    responsibilities: [
      "Develop and maintain responsive web applications using React and Next.js",
      "Collaborate with designers to implement pixel-perfect UI components",
      "Write clean, maintainable, and well-documented code",
      "Participate in code reviews and provide constructive feedback",
      "Optimize application performance and ensure cross-browser compatibility",
      "Mentor junior developers and contribute to team knowledge sharing",
      "Stay updated with the latest frontend technologies and best practices",
    ],
    requirements: [
      "3-5 years of professional experience in frontend development",
      "Strong proficiency in React, JavaScript/TypeScript",
      "Experience with Next.js and server-side rendering",
      "Solid understanding of HTML5, CSS3, and responsive design",
      "Experience with state management libraries (Redux, Zustand, etc.)",
      "Familiarity with modern build tools and version control (Git)",
      "Strong problem-solving skills and attention to detail",
      "Excellent communication and teamwork abilities",
    ],
    qualifications: [
      "Bachelor's degree in Computer Science or related field (or equivalent experience)",
      "Portfolio demonstrating previous work and projects",
      "Experience with Agile/Scrum methodologies",
    ],
    niceToHave: [
      "Experience with TypeScript",
      "Knowledge of backend technologies (Node.js, Express)",
      "Familiarity with CI/CD pipelines",
      "Experience with testing frameworks (Jest, React Testing Library)",
      "Contributions to open-source projects",
      "Experience with design systems",
    ],
    benefits: [
      "Health Insurance",
      "Remote Work",
      "Flexible Hours",
      "Learning Budget",
      "Stock Options",
      "Paid Time Off",
      "Performance Bonus",
    ],
    isBookmarked: false,
    company: {
      id: 1,
      name: "TechCorp Inc.",
      logo: null,
      industry: "Technology • Software",
      size: "150-200",
      founded: "2015",
      openJobs: 12,
      location: "San Francisco, CA (Remote)",
      website: "https://techcorp.example.com",
      about:
        "TechCorp Inc. is a leading software company specializing in innovative web solutions. We build products that empower businesses to succeed in the digital age. Our team is passionate about technology and committed to delivering exceptional results.",
    },
    reviews: [
      {
        role: "Software Engineer",
        date: "3 months ago",
        rating: 5,
        comment:
          "Great company culture with excellent work-life balance. Management is supportive and the team is very collaborative.",
        pros: "Remote work, flexible hours, great benefits",
        cons: "Fast-paced environment can be challenging at times",
      },
      {
        role: "Product Manager",
        date: "6 months ago",
        rating: 4,
        comment:
          "Innovative projects and opportunity to work with cutting-edge technologies. The team is talented and motivated.",
        pros: "Learning opportunities, modern tech stack",
        cons: "Could improve onboarding process",
      },
      {
        role: "UX Designer",
        date: "1 year ago",
        rating: 4,
        comment:
          "A great place to grow your career. The company invests in employee development and values creative input.",
        pros: "Career growth, supportive team",
        cons: "Sometimes meetings can be lengthy",
      },
    ],
    relatedJobs: [
      {
        id: 2,
        title: "Frontend Developer",
        companyName: "StartupHub",
        location: "Bangalore, Hybrid",
        stipend: 80000,
        jobType: "fulltime",
      },
      {
        id: 3,
        title: "React Developer",
        companyName: "WebTech Solutions",
        location: "Remote",
        stipend: 100000,
        jobType: "fulltime",
      },
      {
        id: 4,
        title: "Full Stack Developer",
        companyName: "InnovateLabs",
        location: "Mumbai, On-site",
        stipend: 130000,
        jobType: "fulltime",
      },
    ],
  },
  // Add more mock jobs as needed
};

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id;

  // In production, fetch job data from API
  const job = mockJobData[jobId] || mockJobData[1];

  const formatStipend = (amount) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  const getJobTypeLabel = (type) => {
    const labels = {
      fulltime: "Full-time",
      parttime: "Part-time",
      internship: "Internship",
      contract: "Contract",
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Breadcrumb & Back Button */}
      <div className="bg-[var(--background)] border-b border-[var(--border)]">
        <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-12 py-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-[var(--foreground)]/70 hover:text-[var(--foreground)] mb-3"
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
            Back to Jobs
          </button>

          <nav className="flex items-center gap-2 text-sm text-[var(--foreground)]/60">
            <a href="/jobs" className="hover:text-[var(--foreground)]">
              Jobs
            </a>
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
            <span className="text-[var(--foreground)]">{job.title}</span>
          </nav>
        </div>
      </div>

      {/* Job Header */}
      <div className="bg-gradient-to-b from-[var(--muted)]/30 to-[var(--background)] border-b border-[var(--border)]">
        <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-12 py-6">
          <div className="flex items-start justify-between gap-8">
            <div className="flex items-start gap-6 flex-1 min-w-0">
              {/* Company Logo */}
              <div className="w-24 h-24 rounded-2xl border-2 border-[var(--border)] flex items-center justify-center bg-[var(--background)] flex-shrink-0 overflow-hidden shadow-sm">
                {job.companyLogo ? (
                  <Image
                    src={job.companyLogo}
                    alt={`${job.companyName} logo`}
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-[var(--foreground)]/60">
                    {job.companyName.charAt(0)}
                  </span>
                )}
              </div>

              {/* Job Title & Meta */}
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl sm:text-4xl font-bold mb-2 leading-tight">
                  {job.title}
                </h1>
                <a
                  href={`/company/${job.company.id}`}
                  className="text-lg font-medium text-[var(--foreground)]/80 hover:text-[var(--accent)] transition-colors inline-flex items-center gap-2 mb-4"
                >
                  {job.companyName}
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
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>

                {/* Quick Info Pills */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-full shadow-sm">
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
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="font-medium text-sm">
                      {getJobTypeLabel(job.jobType)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-full shadow-sm">
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
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                    </svg>
                    <span className="font-medium text-sm">{job.location}</span>
                  </div>

                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--accent)]/10 to-[var(--accent)]/5 border border-[var(--accent)]/30 rounded-full shadow-sm">
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
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-semibold text-sm text-[var(--accent)]">
                      {formatStipend(job.stipend)}/month
                    </span>
                  </div>

                  {job.experienceRequired && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-full shadow-sm">
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
                          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                        />
                      </svg>
                      <span className="font-medium text-sm">
                        {job.experienceRequired}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-full shadow-sm">
                    <svg
                      className="w-5 h-5 text-[var(--foreground)]/60"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm text-[var(--foreground)]/70">
                      Posted {job.postedDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex-shrink-0">
              <JobActions job={job} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-full px-4 sm:px-6 lg:px-12 py-8">
        <div className="grid lg:grid-cols-[1fr_440px] gap-8">
          {/* Left Column - Job Details */}
          <div className="space-y-6">
            <JobDescription job={job} />
            <JobSkills skills={job.skills} />
            <JobDetails job={job} />
          </div>

          {/* Right Column - Company Info */}
          <div className="space-y-6">
            <CompanyInfo company={job.company} />
            <CompanyReviews reviews={job.reviews} rating={4.3} />
            <RelatedJobs jobs={job.relatedJobs} />
          </div>
        </div>
      </main>
    </div>
  );
}
