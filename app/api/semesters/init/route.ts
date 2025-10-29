/**
 * Initialize a default current semester
 * This endpoint creates a default semester if none exists
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { getCurrentSemester, createSemester, setCurrentSemester } from '@/lib/db/semesters';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if current semester exists
    const currentSemester = await getCurrentSemester();
    
    if (currentSemester) {
      return NextResponse.json({
        message: 'Current semester already exists',
        semester: currentSemester
      });
    }
    
    // Create a default semester for Fall 2024/2025
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    
    // Determine semester based on current date
    let semesterName: string;
    let semesterCode: string;
    let startDate: Date;
    let endDate: Date;
    
    if (currentMonth >= 8 || currentMonth <= 0) {
      // Fall semester (September - January)
      const year = currentMonth >= 8 ? currentYear : currentYear - 1;
      semesterName = `Fall ${year}/${year + 1}`;
      semesterCode = `F${year}`;
      startDate = new Date(year, 8, 1); // September 1
      endDate = new Date(year + 1, 0, 31); // January 31
    } else if (currentMonth >= 1 && currentMonth <= 5) {
      // Spring semester (February - June)
      semesterName = `Spring ${currentYear}`;
      semesterCode = `S${currentYear}`;
      startDate = new Date(currentYear, 1, 1); // February 1
      endDate = new Date(currentYear, 5, 30); // June 30
    } else {
      // Summer semester (July - August)
      semesterName = `Summer ${currentYear}`;
      semesterCode = `SU${currentYear}`;
      startDate = new Date(currentYear, 6, 1); // July 1
      endDate = new Date(currentYear, 7, 31); // August 31
    }
    
    // Create the semester
    const newSemester = await createSemester({
      name: semesterName,
      code: semesterCode,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      status: 'planning',
      is_current: true,
    });
    
    return NextResponse.json({
      message: 'Default semester created successfully',
      semester: newSemester
    });
    
  } catch (error) {
    console.error('Error initializing semester:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to initialize semester' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const currentSemester = await getCurrentSemester();
    
    if (!currentSemester) {
      return NextResponse.json({
        message: 'No current semester found',
        currentSemester: null,
        needsInitialization: true
      });
    }
    
    return NextResponse.json({
      message: 'Current semester exists',
      currentSemester,
      needsInitialization: false
    });
    
  } catch (error) {
    console.error('Error checking semester:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check semester' },
      { status: 500 }
    );
  }
}

