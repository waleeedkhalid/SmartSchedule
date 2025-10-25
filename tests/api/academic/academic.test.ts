import { describe, it, expect, beforeAll } from 'vitest';

/**
 * Academic API Tests
 * 
 * Tests for:
 * - GET /api/academic/terms
 * - GET /api/academic/events
 * - POST /api/academic/events
 * - GET /api/academic/events/[id]
 * - PATCH /api/academic/events/[id]
 * - DELETE /api/academic/events/[id]
 * - GET /api/academic/timeline/[term_code]
 * 
 * Prerequisites:
 * - Database must have academic terms seeded (471, 472, 475)
 * - Database must have term_events seeded from migration
 * - User must be authenticated for all tests
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Test configuration
const TEST_TERM_CODE = '471'; // Fall 2024/2025
let createdEventId: string | null = null;
let authToken: string | null = null;

// Helper function to make authenticated requests
async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  return fetch(url, {
    ...options,
    headers
  });
}

describe('Academic Terms API', () => {
  describe('GET /api/academic/terms', () => {
    it('should return all academic terms', async () => {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/academic/terms`);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('count');
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.count).toBeGreaterThan(0);
    });

    it('should filter for active terms only', async () => {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/academic/terms?active=true`
      );
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      
      // All returned terms should be active
      data.data.forEach((term: any) => {
        expect(term.is_active).toBe(true);
      });
    });

    it('should filter for terms with open registration', async () => {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/academic/terms?registration_open=true`
      );
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      
      // All returned terms should have registration open
      data.data.forEach((term: any) => {
        expect(term.registration_open).toBe(true);
      });
    });

    it('should return 401 if not authenticated', async () => {
      const response = await fetch(`${API_BASE_URL}/api/academic/terms`);
      expect(response.status).toBe(401);
    });
  });
});

describe('Academic Events API', () => {
  describe('GET /api/academic/events', () => {
    it('should return all events', async () => {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/academic/events`);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('count');
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.count).toBeGreaterThan(0);
    });

    it('should filter events by term code', async () => {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/academic/events?term_code=${TEST_TERM_CODE}`
      );
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      
      // All returned events should be for the specified term
      data.data.forEach((event: any) => {
        expect(event.term_code).toBe(TEST_TERM_CODE);
      });
    });

    it('should filter events by event type', async () => {
      const eventType = 'registration';
      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/academic/events?event_type=${eventType}`
      );
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      
      // All returned events should be of the specified type
      data.data.forEach((event: any) => {
        expect(event.event_type).toBe(eventType);
      });
    });

    it('should filter events by category', async () => {
      const category = 'exam';
      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/academic/events?category=${category}`
      );
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      
      // All returned events should be in the specified category
      data.data.forEach((event: any) => {
        expect(event.category).toBe(category);
      });
    });

    it('should filter for upcoming events', async () => {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/academic/events?upcoming=true&days_ahead=60`
      );
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 60);
      
      // All returned events should be upcoming
      data.data.forEach((event: any) => {
        const startDate = new Date(event.start_date);
        expect(startDate >= now).toBe(true);
        expect(startDate <= futureDate).toBe(true);
      });
    });

    it('should return 401 if not authenticated', async () => {
      const response = await fetch(`${API_BASE_URL}/api/academic/events`);
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/academic/events', () => {
    it('should create a new event (committee only)', async () => {
      const newEvent = {
        term_code: TEST_TERM_CODE,
        title: 'Test Event',
        description: 'This is a test event created by automated tests',
        event_type: 'other',
        category: 'academic',
        start_date: new Date('2024-10-01T08:00:00Z').toISOString(),
        end_date: new Date('2024-10-01T23:59:59Z').toISOString(),
        is_recurring: false,
        metadata: { test: true }
      };

      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/academic/events`,
        {
          method: 'POST',
          body: JSON.stringify(newEvent)
        }
      );
      
      // Note: This will fail if user doesn't have committee role
      // In production tests, this would be 201 for committee users
      expect([201, 403]).toContain(response.status);
      
      if (response.status === 201) {
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data).toHaveProperty('id');
        expect(data.data.title).toBe(newEvent.title);
        
        // Save ID for later tests
        createdEventId = data.data.id;
      }
    });

    it('should reject event with invalid date range', async () => {
      const invalidEvent = {
        term_code: TEST_TERM_CODE,
        title: 'Invalid Event',
        event_type: 'other',
        category: 'academic',
        start_date: new Date('2024-10-10T08:00:00Z').toISOString(),
        end_date: new Date('2024-10-01T23:59:59Z').toISOString(), // Before start
      };

      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/academic/events`,
        {
          method: 'POST',
          body: JSON.stringify(invalidEvent)
        }
      );
      
      // Should be 400 (bad request) or 403 (no permission)
      expect([400, 403]).toContain(response.status);
    });

    it('should reject event with missing required fields', async () => {
      const incompleteEvent = {
        term_code: TEST_TERM_CODE,
        title: 'Incomplete Event',
        // Missing event_type, start_date, end_date
      };

      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/academic/events`,
        {
          method: 'POST',
          body: JSON.stringify(incompleteEvent)
        }
      );
      
      // Should be 400 (bad request) or 403 (no permission)
      expect([400, 403]).toContain(response.status);
    });
  });

  describe('GET /api/academic/events/[id]', () => {
    it('should return a single event by ID', async () => {
      // First, get any event ID
      const listResponse = await authenticatedFetch(
        `${API_BASE_URL}/api/academic/events?term_code=${TEST_TERM_CODE}`
      );
      const listData = await listResponse.json();
      
      if (listData.data.length > 0) {
        const eventId = listData.data[0].id;
        
        const response = await authenticatedFetch(
          `${API_BASE_URL}/api/academic/events/${eventId}`
        );
        
        expect(response.status).toBe(200);
        
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data).toHaveProperty('id', eventId);
      }
    });

    it('should return 404 for non-existent event', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/academic/events/${fakeId}`
      );
      
      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/academic/events/[id]', () => {
    it('should update an event (committee only)', async () => {
      if (!createdEventId) {
        // Skip if we don't have a created event
        return;
      }

      const updates = {
        title: 'Updated Test Event',
        description: 'This event has been updated'
      };

      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/academic/events/${createdEventId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(updates)
        }
      );
      
      // Note: Will be 403 if user doesn't have committee role
      expect([200, 403, 404]).toContain(response.status);
      
      if (response.status === 200) {
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data.title).toBe(updates.title);
      }
    });
  });

  describe('DELETE /api/academic/events/[id]', () => {
    it('should delete an event (committee only)', async () => {
      if (!createdEventId) {
        // Skip if we don't have a created event
        return;
      }

      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/academic/events/${createdEventId}`,
        {
          method: 'DELETE'
        }
      );
      
      // Note: Will be 403 if user doesn't have committee role
      expect([200, 403, 404]).toContain(response.status);
      
      if (response.status === 200) {
        const data = await response.json();
        expect(data.success).toBe(true);
        
        // Verify deletion
        const verifyResponse = await authenticatedFetch(
          `${API_BASE_URL}/api/academic/events/${createdEventId}`
        );
        expect(verifyResponse.status).toBe(404);
      }
    });
  });
});

describe('Academic Timeline API', () => {
  describe('GET /api/academic/timeline/[term_code]', () => {
    it('should return comprehensive timeline for a term', async () => {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/academic/timeline/${TEST_TERM_CODE}`
      );
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('term');
      expect(data.data).toHaveProperty('events');
      expect(data.data).toHaveProperty('statistics');
      
      // Check term info
      expect(data.data.term).toHaveProperty('code', TEST_TERM_CODE);
      expect(data.data.term).toHaveProperty('progress_percentage');
      expect(data.data.term).toHaveProperty('days_total');
      expect(data.data.term).toHaveProperty('days_elapsed');
      expect(data.data.term).toHaveProperty('days_remaining');
      
      // Check events structure
      expect(data.data.events).toHaveProperty('all');
      expect(data.data.events).toHaveProperty('by_category');
      expect(data.data.events).toHaveProperty('active');
      expect(data.data.events).toHaveProperty('upcoming');
      
      // Check events by category
      expect(data.data.events.by_category).toHaveProperty('academic');
      expect(data.data.events.by_category).toHaveProperty('registration');
      expect(data.data.events.by_category).toHaveProperty('exam');
      expect(data.data.events.by_category).toHaveProperty('administrative');
      
      // Check statistics
      expect(data.data.statistics).toHaveProperty('total_events');
      expect(data.data.statistics).toHaveProperty('active_events');
      expect(data.data.statistics).toHaveProperty('upcoming_events');
      expect(data.data.statistics).toHaveProperty('completed_events');
      expect(data.data.statistics).toHaveProperty('by_category');
    });

    it('should enrich events with status information', async () => {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/academic/timeline/${TEST_TERM_CODE}`
      );
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      // Check that events have enriched fields
      data.data.events.all.forEach((event: any) => {
        expect(event).toHaveProperty('status');
        expect(['completed', 'active', 'upcoming']).toContain(event.status);
        expect(event).toHaveProperty('duration_days');
        
        if (event.status === 'upcoming') {
          expect(event).toHaveProperty('days_until');
          expect(typeof event.days_until).toBe('number');
        }
        
        if (event.status === 'completed') {
          expect(event).toHaveProperty('days_since');
          expect(typeof event.days_since).toBe('number');
        }
      });
    });

    it('should respect days_ahead parameter for upcoming events', async () => {
      const daysAhead = 15;
      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/academic/timeline/${TEST_TERM_CODE}?days_ahead=${daysAhead}`
      );
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      const now = new Date();
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + daysAhead);
      
      // All upcoming events should be within the specified range
      data.data.events.upcoming.forEach((event: any) => {
        const startDate = new Date(event.start_date);
        expect(startDate >= now).toBe(true);
        expect(startDate <= maxDate).toBe(true);
      });
    });

    it('should return 404 for non-existent term', async () => {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/academic/timeline/999`
      );
      
      expect(response.status).toBe(404);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/academic/timeline/${TEST_TERM_CODE}`
      );
      expect(response.status).toBe(401);
    });
  });
});

