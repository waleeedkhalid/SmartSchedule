import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { FeedbackForm } from '@/components/student/FeedbackForm';

// Mock the fetch
global.fetch = vi.fn();

describe('FeedbackForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    vi.mocked(fetch).mockImplementation(() => 
      new Promise(() => {}) // Never resolves to keep loading
    );

    render(<FeedbackForm />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display message when feedback is closed', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        feedback: null,
        is_feedback_open: false,
      }),
    } as Response);

    render(<FeedbackForm />);

    await waitFor(() => {
      expect(screen.getByText(/feedback.*closed|not.*open/i)).toBeInTheDocument();
    });
  });

  it('should render empty form when no previous feedback exists', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        feedback: null,
        is_feedback_open: true,
      }),
    } as Response);

    render(<FeedbackForm />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submit feedback/i })).toBeInTheDocument();
    });

    // Check for rating stars (5 stars)
    const stars = screen.getAllByRole('button', { name: /rate/i });
    expect(stars).toHaveLength(5);
  });

  it('should load existing feedback into form', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        feedback: {
          id: 'feedback-123',
          rating: 4,
          comments: 'Great schedule!',
        },
        is_feedback_open: true,
      }),
    } as Response);

    render(<FeedbackForm />);

    await waitFor(() => {
      const commentsInput = screen.getByPlaceholderText(/optional.*comments|share.*thoughts/i) as HTMLTextAreaElement;
      expect(commentsInput.value).toBe('Great schedule!');
    });
  });

  it('should submit new feedback successfully', async () => {
    const user = userEvent.setup();

    // Mock GET request (no existing feedback)
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        feedback: null,
        is_feedback_open: true,
      }),
    } as Response);

    render(<FeedbackForm />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submit feedback/i })).toBeInTheDocument();
    });

    // Click 5th star (5-star rating)
    const stars = screen.getAllByRole('button', { name: /rate/i });
    await user.click(stars[4]);

    // Type comments
    const commentsInput = screen.getByPlaceholderText(/optional.*comments|share.*thoughts/i);
    await user.type(commentsInput, 'Excellent schedule!');

    // Mock POST request (successful submission)
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        feedback: {
          id: 'new-feedback',
          rating: 5,
          comments: 'Excellent schedule!',
        },
      }),
    } as Response);

    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit feedback/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/feedback submitted|thank you/i)).toBeInTheDocument();
    });
  });

  it('should update existing feedback', async () => {
    const user = userEvent.setup();

    // Mock GET request (existing feedback)
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        feedback: {
          id: 'existing-feedback',
          rating: 3,
          comments: 'Good',
        },
        is_feedback_open: true,
      }),
    } as Response);

    render(<FeedbackForm />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /update feedback/i })).toBeInTheDocument();
    });

    // Change rating to 4
    const stars = screen.getAllByRole('button', { name: /rate/i });
    await user.click(stars[3]);

    // Update comments
    const commentsInput = screen.getByPlaceholderText(/optional.*comments|share.*thoughts/i) as HTMLTextAreaElement;
    await user.clear(commentsInput);
    await user.type(commentsInput, 'Very good schedule!');

    // Mock POST request (successful update)
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        feedback: {
          id: 'existing-feedback',
          rating: 4,
          comments: 'Very good schedule!',
        },
      }),
    } as Response);

    // Submit form
    const updateButton = screen.getByRole('button', { name: /update feedback/i });
    await user.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText(/feedback updated|thank you/i)).toBeInTheDocument();
    });
  });

  it('should show error message when submission fails', async () => {
    const user = userEvent.setup();

    // Mock GET request (no existing feedback)
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        feedback: null,
        is_feedback_open: true,
      }),
    } as Response);

    render(<FeedbackForm />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submit feedback/i })).toBeInTheDocument();
    });

    // Click 3rd star
    const stars = screen.getAllByRole('button', { name: /rate/i });
    await user.click(stars[2]);

    // Mock POST request (failure)
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        error: 'Failed to submit feedback',
      }),
    } as Response);

    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit feedback/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed.*submit|error/i)).toBeInTheDocument();
    });
  });

  it('should require rating before submission', async () => {
    const user = userEvent.setup();

    // Mock GET request (no existing feedback)
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        feedback: null,
        is_feedback_open: true,
      }),
    } as Response);

    render(<FeedbackForm />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submit feedback/i })).toBeInTheDocument();
    });

    // Try to submit without rating
    const submitButton = screen.getByRole('button', { name: /submit feedback/i });
    expect(submitButton).toBeDisabled();
  });
});

