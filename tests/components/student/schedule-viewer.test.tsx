import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ScheduleViewer } from '@/components/student/ScheduleViewer';

// Mock the fetch
global.fetch = vi.fn();

describe('ScheduleViewer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    vi.mocked(fetch).mockImplementation(() => 
      new Promise(() => {}) // Never resolves to keep loading
    );

    render(<ScheduleViewer />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display error message when schedule fetch fails', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: 'No published schedule found' }),
    } as Response);

    render(<ScheduleViewer />);

    await waitFor(() => {
      expect(screen.getByText(/no published schedule/i)).toBeInTheDocument();
    });
  });

  it('should display empty state when no sections in schedule', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        schedule: {
          term_code: 'FALL2025',
          sections: [],
        },
      }),
    } as Response);

    render(<ScheduleViewer />);

    await waitFor(() => {
      expect(screen.getByText(/no courses/i)).toBeInTheDocument();
    });
  });

  it('should render schedule calendar grid with courses', async () => {
    const mockSchedule = {
      success: true,
      schedule: {
        term_code: 'FALL2025',
        sections: [
          {
            course_code: 'CS301',
            course_name: 'Data Structures',
            section_id: 'CS301-01',
            instructor: 'Dr. Smith',
            room: 'E201',
            type: 'REQUIRED',
            credits: 3,
            times: [
              { day: 'SUNDAY', start_time: '08:00', end_time: '09:30' },
              { day: 'TUESDAY', start_time: '08:00', end_time: '09:30' },
            ],
          },
          {
            course_code: 'CS401',
            course_name: 'Machine Learning',
            section_id: 'CS401-01',
            instructor: 'Dr. Johnson',
            room: 'E202',
            type: 'ELECTIVE',
            credits: 3,
            times: [
              { day: 'MONDAY', start_time: '10:00', end_time: '11:30' },
            ],
          },
        ],
      },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockSchedule,
    } as Response);

    render(<ScheduleViewer />);

    await waitFor(() => {
      // CS301 appears twice (Sunday and Tuesday), so use getAllByText
      const cs301Elements = screen.getAllByText('CS301');
      expect(cs301Elements).toHaveLength(2);
      
      const dataStructuresElements = screen.getAllByText('Data Structures');
      expect(dataStructuresElements).toHaveLength(2);
      
      // CS401 appears once
      expect(screen.getByText('CS401')).toBeInTheDocument();
      expect(screen.getByText('Machine Learning')).toBeInTheDocument();
    });
  });

  it('should color-code courses by type', async () => {
    const mockSchedule = {
      success: true,
      schedule: {
        sections: [
          {
            course_code: 'CS301',
            course_name: 'Required Course',
            type: 'REQUIRED',
            times: [{ day: 'SUNDAY', start_time: '08:00', end_time: '09:30' }],
          },
          {
            course_code: 'CS401',
            course_name: 'Elective Course',
            type: 'ELECTIVE',
            times: [{ day: 'MONDAY', start_time: '10:00', end_time: '11:30' }],
          },
        ],
      },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockSchedule,
    } as Response);

    const { container } = render(<ScheduleViewer />);

    await waitFor(() => {
      // Check that both courses are rendered
      expect(screen.getByText('CS301')).toBeInTheDocument();
      expect(screen.getByText('CS401')).toBeInTheDocument();
      
      // Check that the required and elective classes exist in the DOM
      const htmlString = container.innerHTML;
      expect(htmlString).toContain('required');
      expect(htmlString).toContain('elective');
    });
  });

  it('should display course details on hover or click', async () => {
    const mockSchedule = {
      success: true,
      schedule: {
        sections: [
          {
            course_code: 'CS301',
            course_name: 'Data Structures',
            section_id: 'CS301-01',
            instructor: 'Dr. Smith',
            room: 'E201',
            type: 'REQUIRED',
            times: [{ day: 'SUNDAY', start_time: '08:00', end_time: '09:30' }],
          },
        ],
      },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockSchedule,
    } as Response);

    render(<ScheduleViewer />);

    await waitFor(() => {
      // Check that course details are displayed in the calendar grid
      expect(screen.getByText('CS301')).toBeInTheDocument();
      expect(screen.getByText('Data Structures')).toBeInTheDocument();
      
      // Room and instructor should be visible somewhere in the document
      expect(screen.getByText('E201')).toBeInTheDocument();
      expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    });
  });

  it('should show export buttons (PDF, iCal)', async () => {
    const mockSchedule = {
      success: true,
      schedule: {
        sections: [
          {
            course_code: 'CS301',
            times: [{ day: 'SUNDAY', start_time: '08:00', end_time: '09:30' }],
          },
        ],
      },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockSchedule,
    } as Response);

    render(<ScheduleViewer />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /export.*pdf/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export.*ical/i })).toBeInTheDocument();
    });
  });

  it('should display total credit hours', async () => {
    const mockSchedule = {
      success: true,
      schedule: {
        sections: [
          {
            course_code: 'CS301',
            credits: 3,
            times: [{ day: 'SUNDAY', start_time: '08:00', end_time: '09:30' }],
          },
          {
            course_code: 'CS302',
            credits: 4,
            times: [{ day: 'MONDAY', start_time: '10:00', end_time: '11:30' }],
          },
        ],
      },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockSchedule,
    } as Response);

    render(<ScheduleViewer />);

    await waitFor(() => {
      expect(screen.getByText(/7.*credit.*hours/i)).toBeInTheDocument();
    });
  });
});

