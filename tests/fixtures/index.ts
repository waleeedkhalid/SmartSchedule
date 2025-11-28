/**
 * Test Fixtures Index
 * Central export for all test fixtures
 * 
 * Usage:
 * import { TEST_FIXTURES, loadFixturesToDatabase } from '@/tests/fixtures';
 * 
 * const students = TEST_FIXTURES.users.students;
 * const rooms = TEST_FIXTURES.rooms.all;
 */

// Re-export all fixtures
export * from './users.fixture';
export * from './academic-term.fixture';
export * from './room.fixture';
export * from './courses.fixture';
export * from './sections.fixture';
export * from './preferences.fixture';
export * from './availability.fixture';
export * from './rules.fixture';
export * from './schedules.fixture';
export * from './schedule-versions.fixture';
export * from './irregular-students.fixture';
export * from './capacity-thresholds.fixture';
export * from './feedback.fixture';
export * from './teaching-load-change-requests.fixture';

// Import for bundling
import { TEST_USERS } from './users.fixture';
import { TEST_TERM_DATA } from './academic-term.fixture';
import { TEST_ROOM_DATA } from './room.fixture';
import { TEST_COURSES } from './courses.fixture';
import { TEST_SECTION_DATA } from './sections.fixture';
import { TEST_PREFERENCES } from './preferences.fixture';
import { TEST_AVAILABILITY } from './availability.fixture';
import { TEST_RULES } from './rules.fixture';
import { TEST_SCHEDULES } from './schedules.fixture';
import { TEST_SCHEDULE_VERSION_DATA } from './schedule-versions.fixture';
import { TEST_IRREGULAR_STUDENT_DATA } from './irregular-students.fixture';
import { TEST_CAPACITY_THRESHOLD_DATA } from './capacity-thresholds.fixture';
import { TEST_FEEDBACK_DATA } from './feedback.fixture';
import { TEST_TEACHING_LOAD_CHANGE_REQUEST_DATA } from './teaching-load-change-requests.fixture';

// =====================================================
// COMPLETE TEST FIXTURE BUNDLE
// =====================================================

export const TEST_FIXTURES = {
  users: TEST_USERS,
  terms: TEST_TERM_DATA,
  rooms: TEST_ROOM_DATA,
  courses: TEST_COURSES,
  sections: TEST_SECTION_DATA,
  preferences: TEST_PREFERENCES,
  availability: TEST_AVAILABILITY,
  rules: TEST_RULES,
  schedules: TEST_SCHEDULES,
  scheduleVersions: TEST_SCHEDULE_VERSION_DATA,
  irregularStudents: TEST_IRREGULAR_STUDENT_DATA,
  capacityThresholds: TEST_CAPACITY_THRESHOLD_DATA,
  feedback: TEST_FEEDBACK_DATA,
  teachingLoadChangeRequests: TEST_TEACHING_LOAD_CHANGE_REQUEST_DATA,
};

// =====================================================
// FIXTURE SUMMARY
// =====================================================

export const FIXTURE_SUMMARY = {
  users: {
    total: TEST_USERS.all.length,
    students: TEST_USERS.students.length,
    faculty: TEST_USERS.faculty.length,
    scheduling_committee: TEST_USERS.schedulingCommittee.length,
    teaching_load_committee: TEST_USERS.teachingLoadCommittee.length,
    registrar: TEST_USERS.registrar.length,
  },
  terms: {
    total: TEST_TERM_DATA.all.length,
    current: TEST_TERM_DATA.current.code,
    active: TEST_TERM_DATA.helpers.getActive()?.code,
  },
  rooms: {
    total: TEST_ROOM_DATA.all.length,
    available: TEST_ROOM_DATA.helpers.getAvailable().length,
    classrooms: TEST_ROOM_DATA.helpers.getByType('CLASSROOM').length,
    labs: TEST_ROOM_DATA.helpers.getByType('LAB').length,
  },
  courses: {
    total: TEST_COURSES.all.length,
    required: TEST_COURSES.required.length,
    electives: TEST_COURSES.electives.length,
  },
  sections: {
    total: TEST_SECTION_DATA.sections.length,
    lectures: TEST_SECTION_DATA.helpers.getLectures().length,
    labs: TEST_SECTION_DATA.helpers.getLabs().length,
    section_times: TEST_SECTION_DATA.sectionTimes.length,
  },
  preferences: {
    total: TEST_PREFERENCES.all.length,
  },
  availability: {
    total: TEST_AVAILABILITY.all.length,
  },
  rules: {
    total: TEST_RULES.all.length,
    hard: TEST_RULES.helpers.getByType('HARD_CONSTRAINT').length,
    soft: TEST_RULES.helpers.getByType('SOFT_CONSTRAINT').length,
  },
  schedules: {
    v1: TEST_SCHEDULES.v1.length,
    v2: TEST_SCHEDULES.v2.length,
  },
  scheduleVersions: {
    total: TEST_SCHEDULE_VERSION_DATA.all.length,
  },
  irregularStudents: {
    total: TEST_IRREGULAR_STUDENT_DATA.all.length,
  },
  capacityThresholds: {
    total: TEST_CAPACITY_THRESHOLD_DATA.all.length,
  },
  feedback: {
    total: TEST_FEEDBACK_DATA.all.length,
  },
  teachingLoadChangeRequests: {
    total: TEST_TEACHING_LOAD_CHANGE_REQUEST_DATA.all.length,
  },
};

// =====================================================
// FIXTURE LOADER (Respects Foreign Key Dependencies)
// =====================================================

/**
 * Loads all fixtures into Supabase for testing
 * ORDER MATTERS - respects foreign key constraints
 * @returns Promise with loading results
 */
export async function loadFixturesToDatabase(supabaseClient: any) {
  const results = {
    users: 0,
    terms: 0,
    rooms: 0,
    courses: 0,
    sections: 0,
    sectionTimes: 0,
    preferences: 0,
    availability: 0,
    rules: 0,
    scheduleVersions: 0,
    schedules: 0,
    irregularStudents: 0,
    capacityThresholds: 0,
    feedback: 0,
    teachingLoadChangeRequests: 0,
    errors: [] as string[],
  };
  
  try {
    // 1. Users (no dependencies)
    const { error: usersError, data: usersData } = await supabaseClient
      .from('users')
      .insert(TEST_USERS.all);
    if (usersError) results.errors.push(`Users: ${usersError.message}`);
    else results.users = TEST_USERS.all.length;
    
    // 2. Academic Terms (no dependencies)
    const { error: termsError } = await supabaseClient
      .from('academic_term')
      .insert(TEST_TERM_DATA.all);
    if (termsError) results.errors.push(`Terms: ${termsError.message}`);
    else results.terms = TEST_TERM_DATA.all.length;
    
    // 3. Rooms (no dependencies)
    const { error: roomsError } = await supabaseClient
      .from('room')
      .insert(TEST_ROOM_DATA.all);
    if (roomsError) results.errors.push(`Rooms: ${roomsError.message}`);
    else results.rooms = TEST_ROOM_DATA.all.length;
    
    // 4. Courses (no dependencies)
    const { error: coursesError } = await supabaseClient
      .from('course')
      .insert(TEST_COURSES.all);
    if (coursesError) results.errors.push(`Courses: ${coursesError.message}`);
    else results.courses = TEST_COURSES.all.length;
    
    // 5. Sections (depends on: courses, rooms, users, terms)
    const { error: sectionsError } = await supabaseClient
      .from('section')
      .insert(TEST_SECTION_DATA.sections);
    if (sectionsError) results.errors.push(`Sections: ${sectionsError.message}`);
    else results.sections = TEST_SECTION_DATA.sections.length;
    
    // 6. Section Times (depends on: sections)
    const { error: sectionTimesError } = await supabaseClient
      .from('section_time')
      .insert(TEST_SECTION_DATA.sectionTimes);
    if (sectionTimesError) results.errors.push(`Section Times: ${sectionTimesError.message}`);
    else results.sectionTimes = TEST_SECTION_DATA.sectionTimes.length;
    
    // 7. Elective Preferences (depends on: users, courses, terms)
    const { error: prefsError } = await supabaseClient
      .from('elective_preferences')
      .insert(TEST_PREFERENCES.all);
    if (prefsError) results.errors.push(`Preferences: ${prefsError.message}`);
    else results.preferences = TEST_PREFERENCES.all.length;
    
    // 8. Faculty Availability (depends on: users, terms)
    const { error: availError } = await supabaseClient
      .from('faculty_availability')
      .insert(TEST_AVAILABILITY.all);
    if (availError) results.errors.push(`Availability: ${availError.message}`);
    else results.availability = TEST_AVAILABILITY.all.length;
    
    // 9. Scheduling Rules (depends on: users, terms)
    const { error: rulesError } = await supabaseClient
      .from('scheduling_rules')
      .insert(TEST_RULES.all);
    if (rulesError) results.errors.push(`Rules: ${rulesError.message}`);
    else results.rules = TEST_RULES.all.length;
    
    // 10. Schedule Versions (depends on: terms, users)
    const { error: versionsError } = await supabaseClient
      .from('schedule_versions')
      .insert(TEST_SCHEDULE_VERSION_DATA.all);
    if (versionsError) results.errors.push(`Schedule Versions: ${versionsError.message}`);
    else results.scheduleVersions = TEST_SCHEDULE_VERSION_DATA.all.length;
    
    // 11. Schedules (depends on: users, terms, schedule_versions)
    const allSchedules = [...TEST_SCHEDULES.v1, ...TEST_SCHEDULES.v2];
    const { error: schedulesError } = await supabaseClient
      .from('schedules')
      .insert(allSchedules);
    if (schedulesError) results.errors.push(`Schedules: ${schedulesError.message}`);
    else results.schedules = allSchedules.length;
    
    // 12. Irregular Students (depends on: users, terms)
    const { error: irregularError } = await supabaseClient
      .from('irregular_students')
      .insert(TEST_IRREGULAR_STUDENT_DATA.all);
    if (irregularError) results.errors.push(`Irregular Students: ${irregularError.message}`);
    else results.irregularStudents = TEST_IRREGULAR_STUDENT_DATA.all.length;
    
    // 13. Capacity Thresholds (depends on: courses, terms, users)
    const { error: thresholdsError } = await supabaseClient
      .from('capacity_thresholds')
      .insert(TEST_CAPACITY_THRESHOLD_DATA.all);
    if (thresholdsError) results.errors.push(`Capacity Thresholds: ${thresholdsError.message}`);
    else results.capacityThresholds = TEST_CAPACITY_THRESHOLD_DATA.all.length;
    
    // 14. Feedback (depends on: users, schedules)
    const { error: feedbackError } = await supabaseClient
      .from('feedback')
      .insert(TEST_FEEDBACK_DATA.all);
    if (feedbackError) results.errors.push(`Feedback: ${feedbackError.message}`);
    else results.feedback = TEST_FEEDBACK_DATA.all.length;
    
    // 15. Teaching Load Change Requests (depends on: schedule_versions, sections, users)
    const { error: requestsError } = await supabaseClient
      .from('teaching_load_change_requests')
      .insert(TEST_TEACHING_LOAD_CHANGE_REQUEST_DATA.all);
    if (requestsError) results.errors.push(`Change Requests: ${requestsError.message}`);
    else results.teachingLoadChangeRequests = TEST_TEACHING_LOAD_CHANGE_REQUEST_DATA.all.length;
    
    return results;
  } catch (error) {
    results.errors.push(`Unexpected error: ${error}`);
    return results;
  }
}

/**
 * Clears all test data from database (in reverse dependency order)
 */
export async function clearFixturesFromDatabase(supabaseClient: any) {
  const results = {
    cleared: [] as string[],
    errors: [] as string[],
  };
  
  try {
    // Clear in reverse order of dependencies
    await supabaseClient.from('teaching_load_change_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    results.cleared.push('teaching_load_change_requests');
    
    await supabaseClient.from('feedback').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    results.cleared.push('feedback');
    
    await supabaseClient.from('capacity_thresholds').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    results.cleared.push('capacity_thresholds');
    
    await supabaseClient.from('irregular_students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    results.cleared.push('irregular_students');
    
    await supabaseClient.from('schedules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    results.cleared.push('schedules');
    
    await supabaseClient.from('schedule_versions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    results.cleared.push('schedule_versions');
    
    await supabaseClient.from('scheduling_rules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    results.cleared.push('scheduling_rules');
    
    await supabaseClient.from('faculty_availability').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    results.cleared.push('faculty_availability');
    
    await supabaseClient.from('elective_preferences').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    results.cleared.push('elective_preferences');
    
    await supabaseClient.from('section_time').delete().neq('id', '');
    results.cleared.push('section_time');
    
    await supabaseClient.from('section').delete().neq('id', '');
    results.cleared.push('section');
    
    await supabaseClient.from('course').delete().neq('code', '');
    results.cleared.push('course');
    
    await supabaseClient.from('room').delete().neq('number', '');
    results.cleared.push('room');
    
    await supabaseClient.from('academic_term').delete().neq('code', '');
    results.cleared.push('academic_term');
    
    await supabaseClient.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    results.cleared.push('users');
    
    return results;
  } catch (error) {
    results.errors.push(`Error clearing: ${error}`);
    return results;
  }
}

// =====================================================
// EXPORT SUMMARY FOR LOGGING
// =====================================================

console.log('\n📦 Test Fixtures Loaded:');
console.log('========================');
console.log(`Users:                  ${FIXTURE_SUMMARY.users.total}`);
console.log(`  - Students:           ${FIXTURE_SUMMARY.users.students}`);
console.log(`  - Faculty:            ${FIXTURE_SUMMARY.users.faculty}`);
console.log(`  - Committee:          ${FIXTURE_SUMMARY.users.scheduling_committee + FIXTURE_SUMMARY.users.teaching_load_committee}`);
console.log(`Terms:                  ${FIXTURE_SUMMARY.terms.total} (current: ${FIXTURE_SUMMARY.terms.current})`);
console.log(`Rooms:                  ${FIXTURE_SUMMARY.rooms.total} (${FIXTURE_SUMMARY.rooms.classrooms} classrooms, ${FIXTURE_SUMMARY.rooms.labs} labs)`);
console.log(`Courses:                ${FIXTURE_SUMMARY.courses.total} (${FIXTURE_SUMMARY.courses.required} required, ${FIXTURE_SUMMARY.courses.electives} elective)`);
console.log(`Sections:               ${FIXTURE_SUMMARY.sections.total} (${FIXTURE_SUMMARY.sections.lectures} lectures, ${FIXTURE_SUMMARY.sections.labs} labs)`);
console.log(`Section Times:          ${FIXTURE_SUMMARY.sections.section_times}`);
console.log(`Preferences:            ${FIXTURE_SUMMARY.preferences.total}`);
console.log(`Availability:           ${FIXTURE_SUMMARY.availability.total}`);
console.log(`Rules:                  ${FIXTURE_SUMMARY.rules.total} (${FIXTURE_SUMMARY.rules.hard} hard, ${FIXTURE_SUMMARY.rules.soft} soft)`);
console.log(`Schedule Versions:      ${FIXTURE_SUMMARY.scheduleVersions.total}`);
console.log(`Schedules v1:           ${FIXTURE_SUMMARY.schedules.v1}`);
console.log(`Schedules v2:           ${FIXTURE_SUMMARY.schedules.v2}`);
console.log(`Irregular Students:     ${FIXTURE_SUMMARY.irregularStudents.total}`);
console.log(`Capacity Thresholds:    ${FIXTURE_SUMMARY.capacityThresholds.total}`);
console.log(`Feedback:               ${FIXTURE_SUMMARY.feedback.total}`);
console.log(`Change Requests:        ${FIXTURE_SUMMARY.teachingLoadChangeRequests.total}`);
console.log('========================\n');
