import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase';

/**
 * GET /api/academic/timeline/[term_code]
 * Get organized timeline of events for a specific term
 * Returns events grouped by category and sorted chronologically
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ term_code: string }> }
) {
  try {
    const { term_code } = await params;
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const searchParams = request.nextUrl.searchParams;
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch term info
    const { data: term, error: termError } = await supabase
      .from('academic_term')
      .select('*')
      .eq('code', term_code)
      .single();

    if (termError) {
      if (termError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Term not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching academic term:', termError);
      return NextResponse.json(
        { error: 'Failed to fetch academic term', details: termError.message },
        { status: 500 }
      );
    }

    // Fetch all events for this term
    const { data: events, error: eventsError } = await supabase
      .from('term_events')
      .select('*')
      .eq('term_code', term_code)
      .order('start_date', { ascending: true });

    if (eventsError) {
      console.error('Error fetching term events:', eventsError);
      return NextResponse.json(
        { error: 'Failed to fetch term events', details: eventsError.message },
        { status: 500 }
      );
    }

    // Get current time for status calculations
    const now = new Date();

    // Enrich events with status and time-relative info
    const enrichedEvents = events.map(event => {
      const startDate = new Date(event.start_date);
      const endDate = new Date(event.end_date);
      
      let status: 'completed' | 'active' | 'upcoming';
      if (now > endDate) {
        status = 'completed';
      } else if (now >= startDate && now <= endDate) {
        status = 'active';
      } else {
        status = 'upcoming';
      }

      // Calculate days until/since
      const daysUntil = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const daysSince = Math.ceil((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));

      return {
        ...event,
        status,
        days_until: status === 'upcoming' ? daysUntil : null,
        days_since: status === 'completed' ? daysSince : null,
        duration_days: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      };
    });

    // Group events by category
    const eventsByCategory = {
      academic: enrichedEvents.filter(e => e.category === 'academic'),
      registration: enrichedEvents.filter(e => e.category === 'registration'),
      exam: enrichedEvents.filter(e => e.category === 'exam'),
      administrative: enrichedEvents.filter(e => e.category === 'administrative')
    };

    // Get upcoming events (next 30 days by default)
    const daysAhead = parseInt(searchParams.get('days_ahead') || '30', 10);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const upcomingEvents = enrichedEvents.filter(event => {
      const startDate = new Date(event.start_date);
      return startDate >= now && startDate <= futureDate;
    });

    // Get active events (happening now)
    const activeEvents = enrichedEvents.filter(event => event.status === 'active');

    // Calculate term progress
    const termStart = new Date(term.start_date);
    const termEnd = new Date(term.end_date);
    const termDuration = termEnd.getTime() - termStart.getTime();
    const termElapsed = now.getTime() - termStart.getTime();
    const termProgress = Math.min(100, Math.max(0, (termElapsed / termDuration) * 100));

    return NextResponse.json({
      success: true,
      data: {
        term: {
          ...term,
          progress_percentage: Math.round(termProgress),
          days_total: Math.ceil(termDuration / (1000 * 60 * 60 * 24)),
          days_elapsed: Math.max(0, Math.ceil(termElapsed / (1000 * 60 * 60 * 24))),
          days_remaining: Math.max(0, Math.ceil((termEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        },
        events: {
          all: enrichedEvents,
          by_category: eventsByCategory,
          active: activeEvents,
          upcoming: upcomingEvents
        },
        statistics: {
          total_events: enrichedEvents.length,
          active_events: activeEvents.length,
          upcoming_events: upcomingEvents.length,
          completed_events: enrichedEvents.filter(e => e.status === 'completed').length,
          by_category: {
            academic: eventsByCategory.academic.length,
            registration: eventsByCategory.registration.length,
            exam: eventsByCategory.exam.length,
            administrative: eventsByCategory.administrative.length
          }
        }
      }
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/academic/timeline/[term_code]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

