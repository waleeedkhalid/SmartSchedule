import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/faculty/schedule/route';
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

describe('GET /api/faculty/schedule', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    mockRequest = new NextRequest('http://localhost:3000/api/faculty/schedule');
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

  it('should return 403 if user is not faculty', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    // Mock user role check (not faculty)
    const mockFromUsers = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { role: 'student' },
            error: null,
          }),
        }),
      }),
    };

    mockSupabaseClient.from.mockReturnValueOnce(mockFromUsers);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain('Faculty access required');
  });

  it('should return 404 when no active term exists', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'faculty-123' } },
      error: null,
    });

    // Mock user role check (is faculty)
    const mockFromUsers = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { role: 'faculty' },
            error: null,
          }),
        }),
      }),
    };

    // Mock active term query (no active term)
    const mockFromTerm = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      }),
    };

    mockSupabaseClient.from
      .mockReturnValueOnce(mockFromUsers)
      .mockReturnValueOnce(mockFromTerm);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('No active academic term');
  });

  it('should return empty sections when faculty has no assignments', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'faculty-123' } },
      error: null,
    });

    // Mock user role check
    const mockFromUsers = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { role: 'faculty' },
            error: null,
          }),
        }),
      }),
    };

    // Mock active term query
    const mockFromTerm = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { code: 'FALL2025', name: 'Fall 2025' },
            error: null,
          }),
        }),
      }),
    };

    // Mock sections query (no sections)
    const mockFromSections = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          data: [],
          error: null,
        }),
      }),
    };

    mockSupabaseClient.from
      .mockReturnValueOnce(mockFromUsers)
      .mockReturnValueOnce(mockFromTerm)
      .mockReturnValueOnce(mockFromSections);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.sections).toEqual([]);
  });

  it('should return faculty teaching schedule with all section details', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'faculty-123' } },
      error: null,
    });

    const mockSections = [
      {
        id: 'section-1',
        section_id: 'CS301-01',
        faculty_id: 'faculty-123',
        course: {
          code: 'CS301',
          name: 'Data Structures',
          credits: 3,
        },
        room: {
          room_id: 'E201',
        },
        section_time: [
          { day: 'SUNDAY', start_time: '08:00', end_time: '09:30' },
          { day: 'TUESDAY', start_time: '08:00', end_time: '09:30' },
        ],
      },
      {
        id: 'section-2',
        section_id: 'CS401-01',
        faculty_id: 'faculty-123',
        course: {
          code: 'CS401',
          name: 'Machine Learning',
          credits: 3,
        },
        room: {
          room_id: 'E202',
        },
        section_time: [
          { day: 'MONDAY', start_time: '10:00', end_time: '11:30' },
        ],
      },
    ];

    // Mock user role check
    const mockFromUsers = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { role: 'faculty' },
            error: null,
          }),
        }),
      }),
    };

    // Mock active term query
    const mockFromTerm = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { code: 'FALL2025', name: 'Fall 2025' },
            error: null,
          }),
        }),
      }),
    };

    // Mock sections query
    const mockFromSections = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: mockSections,
          error: null,
        }),
      }),
    };

    mockSupabaseClient.from
      .mockReturnValueOnce(mockFromUsers)
      .mockReturnValueOnce(mockFromTerm)
      .mockReturnValueOnce(mockFromSections);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.sections).toHaveLength(2);
    expect(data.sections[0].course_code).toBe('CS301');
    expect(data.sections[0].times).toHaveLength(2);
    expect(data.term).toEqual({ code: 'FALL2025', name: 'Fall 2025' });
  });

  it('should calculate total teaching hours', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'faculty-123' } },
      error: null,
    });

    const mockSections = [
      {
        id: 'section-1',
        section_id: 'CS301-01',
        course: {
          code: 'CS301',
          name: 'Data Structures',
          credits: 3,
        },
        room: { room_id: 'E201' },
        section_time: [
          { day: 'SUNDAY', start_time: '08:00', end_time: '09:30' }, // 1.5 hours
          { day: 'TUESDAY', start_time: '08:00', end_time: '09:30' }, // 1.5 hours
        ],
      },
    ];

    // Mock user role check
    const mockFromUsers = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { role: 'faculty' },
            error: null,
          }),
        }),
      }),
    };

    // Mock active term query
    const mockFromTerm = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { code: 'FALL2025', name: 'Fall 2025' },
            error: null,
          }),
        }),
      }),
    };

    // Mock sections query
    const mockFromSections = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: mockSections,
          error: null,
        }),
      }),
    };

    mockSupabaseClient.from
      .mockReturnValueOnce(mockFromUsers)
      .mockReturnValueOnce(mockFromTerm)
      .mockReturnValueOnce(mockFromSections);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.total_hours).toBe(3); // 1.5 + 1.5 = 3 hours per week
  });
});

