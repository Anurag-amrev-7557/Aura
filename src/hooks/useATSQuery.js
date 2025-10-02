import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Custom hook for ATS analysis
export function useATSAnalysis() {
  const queryClient = useQueryClient();

  const analyzeResume = useMutation({
    mutationFn: async ({ resume, job, structured }) => {
      const response = await fetch('/api/ats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume, job, structured }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Analysis failed');
      }

      return response.json();
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const improveResume = useMutation({
    mutationFn: async ({ resume, job }) => {
      const response = await fetch('/api/ats', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume, job }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Resume improvement failed');
      }

      return response.json();
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    analyzeResume,
    improveResume,
  };
}

// Custom hook for template generation
export function useTemplateGeneration() {
  return useMutation({
    mutationFn: async (resumeContent) => {
      const response = await fetch('/api/ats/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeContent }),
      });

      if (!response.ok) {
        throw new Error('Template generation failed');
      }

      return response.json();
    },
    retry: 2,
    retryDelay: 1000,
  });
}

// Custom hook for job search
export function useJobSearch() {
  const searchJobs = useMutation({
    mutationFn: async ({ query, where = 'global', page = 1 }) => {
      const params = new URLSearchParams();
      params.set('q', query);
      params.set('where', where);
      params.set('page', page.toString());

      const response = await fetch(`/api/ats?${params.toString()}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Job search failed');
      }

      return response.json();
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return { searchJobs };
}

// Custom hook for resume parsing
export function useResumeParsing() {
  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/ats/gemini-parse', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Resume parsing failed');
      }

      return response.json();
    },
    retry: 2,
    retryDelay: 1000,
  });
}
