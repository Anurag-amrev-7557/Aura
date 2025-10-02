import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ATSPage from '../../app/ats/page';

// Mock fetch
global.fetch = jest.fn();

// Mock file reader
global.FileReader = class {
  constructor() {
    this.result = '';
  }
  
  readAsText() {
    setTimeout(() => {
      this.onload && this.onload();
    }, 100);
  }
};

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithQueryClient = (ui) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('ATSPage', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders ATS analyzer interface', () => {
    renderWithQueryClient(<ATSPage />);
    
    expect(screen.getByText('ATS Analyzer')).toBeInTheDocument();
    expect(screen.getByText('Resume Upload')).toBeInTheDocument();
    expect(screen.getByText('Job Description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyze/i })).toBeInTheDocument();
  });

  test('shows file upload area', () => {
    renderWithQueryClient(<ATSPage />);
    
    expect(screen.getByText('Drop your resume here')).toBeInTheDocument();
    expect(screen.getByText('Choose File')).toBeInTheDocument();
    expect(screen.getByText(/PDF, DOCX, DOC/)).toBeInTheDocument();
  });

  test('handles file upload', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<ATSPage />);
    
    const file = new File(['test content'], 'resume.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/file input for resume upload/i);
    
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText('Resume Ready')).toBeInTheDocument();
    });
  });

  test('displays error for invalid file type', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<ATSPage />);
    
    const file = new File(['test'], 'test.exe', { type: 'application/x-executable' });
    const input = screen.getByLabelText(/file input for resume upload/i);
    
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText(/file type not supported/i)).toBeInTheDocument();
    });
  });

  test('handles job description input', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<ATSPage />);
    
    const textarea = screen.getByLabelText(/job description textarea/i);
    await user.type(textarea, 'Software Engineer position requiring React experience');
    
    expect(textarea.value).toBe('Software Engineer position requiring React experience');
  });

  test('submits analysis request', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        overallScore: 0.75,
        summary: 'Good match',
        keywordsMatched: ['React', 'JavaScript'],
        tips: ['Add more metrics'],
      }),
    });

    const user = userEvent.setup();
    renderWithQueryClient(<ATSPage />);
    
    // Add resume text
    const file = new File(['Resume content'], 'resume.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/file input for resume upload/i);
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText('Resume Ready')).toBeInTheDocument();
    });
    
    // Click analyze button
    const analyzeButton = screen.getByRole('button', { name: /analyze/i });
    await user.click(analyzeButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/ats', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }));
    });
  });

  test('displays analysis results', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        overallScore: 0.75,
        summary: 'Good match for the position',
        keywordsMatched: ['React', 'JavaScript', 'Frontend'],
        tips: ['Add more quantified achievements', 'Include relevant certifications'],
        gaps: ['Missing backend experience'],
        sectionScores: { Summary: 0.8, Experience: 0.7, Skills: 0.9 },
      }),
    });

    const user = userEvent.setup();
    renderWithQueryClient(<ATSPage />);
    
    // Upload resume and submit
    const file = new File(['Resume content'], 'resume.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/file input for resume upload/i);
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText('Resume Ready')).toBeInTheDocument();
    });
    
    const analyzeButton = screen.getByRole('button', { name: /analyze/i });
    await user.click(analyzeButton);
    
    await waitFor(() => {
      expect(screen.getByText('Resume Analysis Complete')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('Good match for the position')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    fetch.mockRejectedValueOnce(new Error('API Error'));

    const user = userEvent.setup();
    renderWithQueryClient(<ATSPage />);
    
    // Upload resume and submit
    const file = new File(['Resume content'], 'resume.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/file input for resume upload/i);
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText('Resume Ready')).toBeInTheDocument();
    });
    
    const analyzeButton = screen.getByRole('button', { name: /analyze/i });
    await user.click(analyzeButton);
    
    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  test('shows loading state during analysis', async () => {
    // Mock a delayed response
    fetch.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({ overallScore: 0.75 })
        }), 1000)
      )
    );

    const user = userEvent.setup();
    renderWithQueryClient(<ATSPage />);
    
    // Upload resume and submit
    const file = new File(['Resume content'], 'resume.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/file input for resume upload/i);
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText('Resume Ready')).toBeInTheDocument();
    });
    
    const analyzeButton = screen.getByRole('button', { name: /analyze/i });
    await user.click(analyzeButton);
    
    expect(screen.getByText('AI Resume Analysis in Progress')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyzing/i })).toBeInTheDocument();
  });

  test('keyboard navigation works', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<ATSPage />);
    
    // Tab to file upload area and press Enter
    const uploadArea = screen.getByRole('button', { name: /drop zone for resume upload/i });
    await user.tab();
    
    if (document.activeElement === uploadArea) {
      await user.keyboard('{Enter}');
      // File dialog should be triggered (mocked)
    }
  });

  test('handles template selection', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        templates: [
          { name: 'Software Engineer', text: 'Looking for a software engineer...' },
          { name: 'Frontend Developer', text: 'Seeking frontend developer...' }
        ]
      }),
    });

    const user = userEvent.setup();
    renderWithQueryClient(<ATSPage />);
    
    // Upload resume to trigger template generation
    const file = new File(['Resume content'], 'resume.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/file input for resume upload/i);
    await user.upload(input, file);
    
    await waitFor(() => {
      const templateButton = screen.getByRole('button', { name: /apply software engineer template/i });
      expect(templateButton).toBeInTheDocument();
    });
  });
});
