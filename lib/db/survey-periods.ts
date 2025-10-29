/**
 * Database queries for survey periods
 * 
 * REFACTORED: New file for survey period management
 * Supports elective preference and faculty availability surveys
 */
import { createClient } from '@/supabase/server';
import { getCurrentSemester } from './semesters';

export interface SurveyPeriod {
  id: string;
  academic_semester_id: string;
  survey_type: 'elective_survey' | 'availability_survey';
  status: 'draft' | 'open' | 'closed';
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  created_at: string | null;
  created_by: string | null;
  updated_at: string | null;
}

export interface SurveyPeriodCreate {
  academic_semester_id: string;
  survey_type: 'elective_survey' | 'availability_survey';
  status?: 'draft' | 'open' | 'closed';
  start_date?: string;
  end_date?: string;
  description?: string;
}

export interface SurveyPeriodUpdate {
  survey_type?: 'elective_survey' | 'availability_survey';
  status?: 'draft' | 'open' | 'closed';
  start_date?: string;
  end_date?: string;
  description?: string;
}

export interface SurveyEligibility {
  eligible: boolean;
  survey_period_id: string | null;
  reason?: string;
}

/**
 * Get all survey periods, optionally filtered by semester
 * @param semesterId - Optional semester ID filter
 * @returns Array of survey periods
 */
export async function getSurveyPeriods(semesterId?: string): Promise<SurveyPeriod[]> {
  const supabase = await createClient();
  let query = supabase
    .from('survey_period')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (semesterId) {
    query = query.eq('academic_semester_id', semesterId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data as SurveyPeriod[];
}

/**
 * Get a specific survey period by ID
 * @param id - Survey period ID
 * @returns Survey period or null if not found
 */
export async function getSurveyPeriod(id: string): Promise<SurveyPeriod | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('survey_period')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }
  return data as SurveyPeriod;
}

/**
 * Get active survey period for a specific type and semester
 * @param surveyType - Type of survey
 * @param semesterId - Semester ID (defaults to current semester)
 * @returns Active survey period or null
 */
export async function getActiveSurveyPeriod(
  surveyType: 'elective_survey' | 'availability_survey',
  semesterId?: string
): Promise<SurveyPeriod | null> {
  const supabase = await createClient();
  const semester = semesterId || (await getCurrentSemester())?.id;
  
  if (!semester) return null;
  
  const { data, error } = await supabase
    .from('survey_period')
    .select('*')
    .eq('academic_semester_id', semester)
    .eq('survey_type', surveyType)
    .eq('status', 'open')
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }
  return data as SurveyPeriod;
}

/**
 * Create a new survey period
 * @param surveyData - Survey period data
 * @returns Created survey period
 */
export async function createSurveyPeriod(surveyData: SurveyPeriodCreate): Promise<SurveyPeriod> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('survey_period')
    .insert({ 
      ...surveyData, 
      created_by: user?.id,
      status: surveyData.status || 'draft'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as SurveyPeriod;
}

/**
 * Update an existing survey period
 * @param id - Survey period ID
 * @param updates - Fields to update
 * @returns Updated survey period
 */
export async function updateSurveyPeriod(id: string, updates: SurveyPeriodUpdate): Promise<SurveyPeriod> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('survey_period')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as SurveyPeriod;
}

/**
 * Delete a survey period
 * @param id - Survey period ID
 */
export async function deleteSurveyPeriod(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('survey_period')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

/**
 * Open a survey period
 * Uses the database function open_survey() if available
 * @param id - Survey period ID
 * @returns Updated survey period
 */
export async function openSurvey(id: string): Promise<SurveyPeriod> {
  const supabase = await createClient();
  
  // Try using database function first
  const { data: fnData, error: fnError } = await supabase
    .rpc('open_survey', { survey_period_id: id });
  
  if (!fnError && fnData) {
    // Function succeeded, fetch and return the updated survey
    return await getSurveyPeriod(id) as SurveyPeriod;
  }
  
  // Fallback to direct update
  return await updateSurveyPeriod(id, {
    status: 'open',
    start_date: new Date().toISOString()
  });
}

/**
 * Close a survey period
 * Uses the database function close_survey() if available
 * @param id - Survey period ID
 * @returns Updated survey period
 */
export async function closeSurvey(id: string): Promise<SurveyPeriod> {
  const supabase = await createClient();
  
  // Try using database function first
  const { data: fnData, error: fnError } = await supabase
    .rpc('close_survey', { survey_period_id: id });
  
  if (!fnError && fnData) {
    // Function succeeded, fetch and return the updated survey
    return await getSurveyPeriod(id) as SurveyPeriod;
  }
  
  // Fallback to direct update
  return await updateSurveyPeriod(id, {
    status: 'closed',
    end_date: new Date().toISOString()
  });
}

/**
 * Check if a user is eligible to respond to a survey
 * Uses the database function check_survey_eligibility() if available
 * @param userId - User ID
 * @param surveyType - Type of survey
 * @param semesterId - Semester ID (defaults to current semester)
 * @returns Eligibility status
 */
export async function checkSurveyEligibility(
  userId: string,
  surveyType: 'elective_survey' | 'availability_survey',
  semesterId?: string
): Promise<SurveyEligibility> {
  const supabase = await createClient();
  const semester = semesterId || (await getCurrentSemester())?.id;
  
  if (!semester) {
    return {
      eligible: false,
      survey_period_id: null,
      reason: 'No active semester'
    };
  }
  
  // Try using database function first
  const { data: fnData, error: fnError } = await supabase
    .rpc('check_survey_eligibility', { 
      user_id: userId,
      survey_type: surveyType,
      semester_id: semester
    });
  
  if (!fnError && fnData) {
    return fnData as SurveyEligibility;
  }
  
  // Fallback to manual check
  const activeSurvey = await getActiveSurveyPeriod(surveyType, semester);
  
  if (!activeSurvey) {
    return {
      eligible: false,
      survey_period_id: null,
      reason: 'No active survey period'
    };
  }
  
  // Check if survey is currently open (within date range)
  const now = new Date();
  const start = activeSurvey.start_date ? new Date(activeSurvey.start_date) : null;
  const end = activeSurvey.end_date ? new Date(activeSurvey.end_date) : null;
  
  if (start && now < start) {
    return {
      eligible: false,
      survey_period_id: activeSurvey.id,
      reason: 'Survey has not started yet'
    };
  }
  
  if (end && now > end) {
    return {
      eligible: false,
      survey_period_id: activeSurvey.id,
      reason: 'Survey has ended'
    };
  }
  
  return {
    eligible: true,
    survey_period_id: activeSurvey.id
  };
}

/**
 * Get survey periods by status
 * @param status - Survey status
 * @param semesterId - Optional semester ID filter
 * @returns Array of survey periods
 */
export async function getSurveyPeriodsByStatus(
  status: 'draft' | 'open' | 'closed',
  semesterId?: string
): Promise<SurveyPeriod[]> {
  const supabase = await createClient();
  let query = supabase
    .from('survey_period')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });
  
  if (semesterId) {
    query = query.eq('academic_semester_id', semesterId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data as SurveyPeriod[];
}

