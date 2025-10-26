import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FacultyScheduleViewer } from '@/components/faculty/FacultyScheduleViewer';

// Mock the fetch
global.fetch = vi.fn();

describe('FacultyScheduleViewer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    vi.mocked(fetch).mockImplementation(() => 
      new Promise(() => {}) // Never resolves to keep loading
    );

    render(<FacultyScheduleViewer />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display error message when schedule fetch fails', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ error: 'Faculty access required' }),
    } as Response);

    render(<FacultyScheduleViewer />);

    await waitFor(() => {
      expect(screen.getByText(/faculty access required|error/i)).toBeInTheDocument();
    });
  });

  it('should display empty state when no teaching assignments exist', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        term: { code: 'FALL2025', name: 'Fall 2025' },
        sections: [],
        total_hours: 0,
      }),
    } as Response);

    render(<FacultyScheduleViewer />);

    await waitFor(() => {
      expect(screen.getByText(/no teaching assignments|no courses/i)).toBeInTheDocument();
    });
  });

  it('should render teaching schedule with course details', async () => {
    const mockSchedule = {
      success: true,
      term: { code: 'FALL2025', name: 'Fall 2025' },
      sections: [
        {
          section_id: 'CS301-01',
          course_code: 'CS301',
          course_name: 'Data Structures',
          credits: 3,
          room: 'E201',
          times: [
            { day: 'SUNDAY', start_time: '08:00', end_time: '09:30' },
            { day: 'TUESDAY', start_time: '08:00', end_time: '09:30' },
          ],
        },
        {
          section_id: 'CS401-01',
          course_code: 'CS401',
          course_name: 'Machine Learning',
          credits: 3,
          room: 'E202',
          times: [
            { day: 'MONDAY', start_time: '10:00', end_time: '11:30' },
          ],
        },
      ],
      total_hours: 4.5,
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockSchedule,
    } as Response);

    render(<FacultyScheduleViewer />);

    await waitFor(() => {
      // Check that courses are rendered (they appear multiple times in calendar)
      const cs301Elements = screen.getAllByText('CS301');
      expect(cs301Elements.length).toBeGreaterThan(0);
      
      expect(screen.getByText('CS401')).toBeInTheDocument();
    });
  });

  it('should display teaching load summary', async () => {
    const mockSchedule = {
      success: true,
      term: { code: 'FALL2025', name: 'Fall 2025' },
      sections: [
        {
          section_id: 'CS301-01',
          course_code: 'CS301',
          course_name: 'Data Structures',
          credits: 3,
          room: 'E201',
          times: [
            { day: 'SUNDAY', start_time: '08:00', end_time: '09:30' },
          ],
        },
      ],
      total_hours: 1.5,
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockSchedule,
    } as Response);

    render(<FacultyScheduleViewer />);

    await waitFor(() => {
      // Check for teaching load info
      expect(screen.getByText(/1\.5.*hours/i)).toBeInTheDocument();
      expect(screen.getByText(/1.*section/i)).toBeInTheDocument();
    });
  });

  it('should show term information', async () => {
    const mockSchedule = {
      success: true,
      term: { code: 'FALL2025', name: 'Fall 2025' },
      sections: [
        {
          section_id: 'CS301-01',
          course_code: 'CS301',
          course_name: 'Data Structures',
          times: [{ day: 'SUNDAY', start_time: '08:00', end_time: '09:30' }],
        },
      ],
      total_hours: 1.5,
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockSchedule,
    } as Response);

    render(<FacultyScheduleViewer />);

    await waitFor(() => {
      expect(screen.getByText(/fall 2025/i)).toBeInTheDocument();
    });
  });

  it('should show export button for PDF', async () => {
    const mockSchedule = {
      success: true,
      term: { code: 'FALL2025', name: 'Fall 2025' },
      sections: [
        {
          section_id: 'CS301-01',
          course_code: 'CS301',
          times: [{ day: 'SUNDAY', start_time: '08:00', end_time: '09:30' }],
        },
      ],
      total_hours: 1.5,
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockSchedule,
    } as Response);

    render(<FacultyScheduleViewer />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /export.*pdf/i })).toBeInTheDocument();
    });
  });
});

