import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from '@/app/api/student/feedback/route';
import { NextRequest } from 'next/server';

// Mock Supabase
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(() => mockSupabaseClient),
}));

describe('GET /api/student/feedback', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    mockRequest = new NextRequest('http://localhost:3000/api/student/feedback');
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Not authenticated'),
    });

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return existing feedback if found', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'student-123' } },
      error: null,
    });

    const mockFeedback = {
      id: 'feedback-123',
      student_id: 'student-123',
      term_code: 'FALL2025',
      rating: 4,
      comments: 'Good schedule',
      submitted_at: '2025-10-20T00:00:00Z',
    };

    // Mock active term query
    const mockFromTerm = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { code: 'FALL2025', is_feedback_open: true },
            error: null,
          }),
        }),
      }),
    };

    // Mock feedback query
    const mockFromFeedback = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: mockFeedback,
              error: null,
            }),
          }),
        }),
      }),
    };

    mockSupabaseClient.from
      .mockReturnValueOnce(mockFromTerm)
      .mockReturnValueOnce(mockFromFeedback);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.feedback).toEqual(mockFeedback);
    expect(data.is_feedback_open).toBe(true);
  });

  it('should return null feedback if none exists', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'student-123' } },
      error: null,
    });

    // Mock active term query
    const mockFromTerm = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { code: 'FALL2025', is_feedback_open: true },
            error: null,
          }),
        }),
      }),
    };

    // Mock feedback query (no feedback)
    const mockFromFeedback = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      }),
    };

    mockSupabaseClient.from
      .mockReturnValueOnce(mockFromTerm)
      .mockReturnValueOnce(mockFromFeedback);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.feedback).toBeNull();
    expect(data.is_feedback_open).toBe(true);
  });
});

describe('POST /api/student/feedback', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Not authenticated'),
    });

    mockRequest = new NextRequest('http://localhost:3000/api/student/feedback', {
      method: 'POST',
      body: JSON.stringify({ rating: 5, comments: 'Great!' }),
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 if rating is invalid', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'student-123' } },
      error: null,
    });

    mockRequest = new NextRequest('http://localhost:3000/api/student/feedback', {
      method: 'POST',
      body: JSON.stringify({ rating: 6, comments: 'Too high rating' }),
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Rating must be between 1 and 5');
  });

  it('should return 403 if feedback is not open', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'student-123' } },
      error: null,
    });

    mockRequest = new NextRequest('http://localhost:3000/api/student/feedback', {
      method: 'POST',
      body: JSON.stringify({ rating: 4, comments: 'Good' }),
    });

    // Mock active term with feedback closed
    const mockFromTerm = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { code: 'FALL2025', is_feedback_open: false },
            error: null,
          }),
        }),
      }),
    };

    mockSupabaseClient.from.mockReturnValueOnce(mockFromTerm);

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain('Feedback is not currently open');
  });

  it('should successfully submit new feedback', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'student-123' } },
      error: null,
    });

    mockRequest = new NextRequest('http://localhost:3000/api/student/feedback', {
      method: 'POST',
      body: JSON.stringify({ rating: 5, comments: 'Excellent schedule!' }),
    });

    // Mock active term with feedback open
    const mockFromTerm = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { code: 'FALL2025', is_feedback_open: true },
            error: null,
          }),
        }),
      }),
    };

    // Mock upsert feedback
    const mockFromFeedback = {
      upsert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'new-feedback',
              student_id: 'student-123',
              term_code: 'FALL2025',
              rating: 5,
              comments: 'Excellent schedule!',
            },
            error: null,
          }),
        }),
      }),
    };

    mockSupabaseClient.from
      .mockReturnValueOnce(mockFromTerm)
      .mockReturnValueOnce(mockFromFeedback);

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.feedback.rating).toBe(5);
  });

  it('should update existing feedback', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'student-123' } },
      error: null,
    });

    mockRequest = new NextRequest('http://localhost:3000/api/student/feedback', {
      method: 'POST',
      body: JSON.stringify({ rating: 3, comments: 'Updated feedback' }),
    });

    // Mock active term with feedback open
    const mockFromTerm = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { code: 'FALL2025', is_feedback_open: true },
            error: null,
          }),
        }),
      }),
    };

    // Mock upsert feedback (update)
    const mockFromFeedback = {
      upsert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'existing-feedback',
              student_id: 'student-123',
              term_code: 'FALL2025',
              rating: 3,
              comments: 'Updated feedback',
            },
            error: null,
          }),
        }),
      }),
    };

    mockSupabaseClient.from
      .mockReturnValueOnce(mockFromTerm)
      .mockReturnValueOnce(mockFromFeedback);

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.feedback.comments).toBe('Updated feedback');
  });
});

