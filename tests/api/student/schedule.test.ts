import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/student/schedule/route';
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

describe('GET /api/student/schedule', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    mockRequest = new NextRequest('http://localhost:3000/api/student/schedule');
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

  it('should return 404 if no schedule is published for student', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'student-123', email: 'student@test.com' } },
      error: null,
    });

    // Mock active term query
    const mockFromTerm = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { code: 'FALL2025' },
            error: null,
          }),
        }),
      }),
    };

    // Mock schedule query (no schedule found)
    const mockFromSchedule = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116', message: 'Not found' },
              }),
            }),
          }),
        }),
      }),
    };

    mockSupabaseClient.from
      .mockReturnValueOnce(mockFromTerm)
      .mockReturnValueOnce(mockFromSchedule);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('No published schedule found');
  });

  it('should return formatted schedule data for authenticated student', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'student-123', email: 'student@test.com' } },
      error: null,
    });

    const mockScheduleData = {
      id: 'schedule-123',
      student_id: 'student-123',
      term_code: 'FALL2025',
      is_published: true,
      version: 1,
      created_at: '2025-10-01T00:00:00Z',
      data: {
        sections: [
          {
            course_code: 'CS301',
            course_name: 'Data Structures',
            section_id: 'CS301-01',
            instructor: 'Dr. Smith',
            room: 'E201',
            type: 'REQUIRED',
            times: [
              { day: 'SUNDAY', start_time: '08:00', end_time: '09:30' },
              { day: 'TUESDAY', start_time: '08:00', end_time: '09:30' },
            ],
          },
        ],
      },
    };

    // Mock active term query
    const mockFromTerm = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { code: 'FALL2025' },
            error: null,
          }),
        }),
      }),
    };

    // Mock schedule query (schedule found)
    const mockFromSchedule = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockScheduleData,
                error: null,
              }),
            }),
          }),
        }),
      }),
    };

    mockSupabaseClient.from
      .mockReturnValueOnce(mockFromTerm)
      .mockReturnValueOnce(mockFromSchedule);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.schedule).toBeDefined();
    expect(data.schedule.sections).toHaveLength(1);
    expect(data.schedule.sections[0].course_code).toBe('CS301');
  });

  it('should include metadata with schedule', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'student-123', email: 'student@test.com' } },
      error: null,
    });

    const mockScheduleData = {
      id: 'schedule-123',
      student_id: 'student-123',
      term_code: 'FALL2025',
      is_published: true,
      version: 2,
      created_at: '2025-10-01T00:00:00Z',
      updated_at: '2025-10-05T00:00:00Z',
      data: { sections: [] },
    };

    // Mock active term query
    const mockFromTerm = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { code: 'FALL2025' },
            error: null,
          }),
        }),
      }),
    };

    // Mock schedule query
    const mockFromSchedule = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockScheduleData,
                error: null,
              }),
            }),
          }),
        }),
      }),
    };

    mockSupabaseClient.from
      .mockReturnValueOnce(mockFromTerm)
      .mockReturnValueOnce(mockFromSchedule);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(data.schedule.term_code).toBe('FALL2025');
    expect(data.schedule.version).toBe(2);
    expect(data.schedule.published_at).toBeDefined();
  });
});

