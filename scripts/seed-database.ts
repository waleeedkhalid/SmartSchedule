/**
 * Seed Database Script
 * 
 * Usage:
 *   pnpm tsx scripts/seed-database.ts
 * 
 * This script populates the database with sample data for testing and demos.
 * It uses the enhanced seed data file (seed-data-enhanced.json)
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Read environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface SeedData {
  version: string
  data: {
    courses: Array<{
      code: string
      name: string
      level: number
      credits: number
      type: string
      is_elective: boolean
    }>
    rooms: Array<{
      name: string
      type: string
      capacity: number
    }>
    instructors: Array<{
      name: string
      email: string
      max_load_per_week: number
    }>
    student_groups: Array<{
      level: number
      size: number
      name: string
    }>
  }
}

async function loadSeedData(): Promise<SeedData> {
  const seedFilePath = path.join(process.cwd(), 'seed-data-enhanced.json')
  
  if (!fs.existsSync(seedFilePath)) {
    console.error(`❌ Seed file not found: ${seedFilePath}`)
    process.exit(1)
  }

  const fileContent = fs.readFileSync(seedFilePath, 'utf-8')
  return JSON.parse(fileContent) as SeedData
}

async function clearExistingData() {
  console.log('🗑️  Clearing existing data...')
  
  // Delete in reverse order of dependencies
  await supabase.from('sections').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('exams').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('elective_preferences').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('student_groups').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('instructors').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('rooms').delete().neq('name', 'DUMMY')
  await supabase.from('courses').delete().neq('code', 'DUMMY')
  
  console.log('✅ Existing data cleared')
}

async function seedCourses(courses: SeedData['data']['courses']) {
  console.log(`📚 Seeding ${courses.length} courses...`)
  
  const { data, error } = await supabase
    .from('courses')
    .upsert(courses, { onConflict: 'code' })
  
  if (error) {
    console.error('❌ Error seeding courses:', error.message)
    throw error
  }
  
  console.log(`✅ Seeded ${courses.length} courses`)
}

async function seedRooms(rooms: SeedData['data']['rooms']) {
  console.log(`🏫 Seeding ${rooms.length} rooms...`)
  
  const { data, error } = await supabase
    .from('rooms')
    .upsert(rooms, { onConflict: 'name' })
  
  if (error) {
    console.error('❌ Error seeding rooms:', error.message)
    throw error
  }
  
  console.log(`✅ Seeded ${rooms.length} rooms`)
}

async function seedInstructors(instructors: SeedData['data']['instructors']) {
  console.log(`👨‍🏫 Seeding ${instructors.length} instructors...`)
  
  const { data, error } = await supabase
    .from('instructors')
    .upsert(
      instructors.map(i => ({
        name: i.name,
        email: i.email,
        max_load_per_week: i.max_load_per_week,
        preferred_times: [],
        unavailable_times: []
      })),
      { onConflict: 'email' }
    )
  
  if (error) {
    console.error('❌ Error seeding instructors:', error.message)
    throw error
  }
  
  console.log(`✅ Seeded ${instructors.length} instructors`)
}

async function seedStudentGroups(groups: SeedData['data']['student_groups']) {
  console.log(`👥 Seeding ${groups.length} student groups...`)
  
  // First delete existing groups to avoid duplicates
  await supabase.from('student_groups').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  
  const { data, error } = await supabase
    .from('student_groups')
    .insert(groups)
  
  if (error) {
    console.error('❌ Error seeding student groups:', error.message)
    throw error
  }
  
  console.log(`✅ Seeded ${groups.length} student groups`)
}

async function createSampleSections() {
  console.log('📝 Creating sample sections for Level 1 courses...')
  
  // Get Level 1 courses
  const { data: level1Courses } = await supabase
    .from('courses')
    .select('code')
    .eq('level', 1)
    .limit(3)
  
  if (!level1Courses || level1Courses.length === 0) {
    console.log('⚠️  No Level 1 courses found, skipping section creation')
    return
  }
  
  // Get first instructor
  const { data: instructors } = await supabase
    .from('instructors')
    .select('id')
    .limit(1)
  
  // Get first room
  const { data: rooms } = await supabase
    .from('rooms')
    .select('name')
    .eq('type', 'lecture')
    .limit(1)
  
  if (!instructors || !rooms || instructors.length === 0 || rooms.length === 0) {
    console.log('⚠️  Missing instructors or rooms, skipping section creation')
    return
  }
  
  // Create sample sections
  const sampleSections = level1Courses.slice(0, 2).map((course, idx) => ({
    course_code: course.code,
    section_number: '01',
    instructor_id: instructors[0].id,
    room_id: rooms[0].name,
    meeting_days: ['sunday', 'tuesday'],
    start_time: idx === 0 ? '08:00' : '10:00',
    end_time: idx === 0 ? '09:30' : '11:30',
    is_lab: false,
    status: 'draft'
  }))
  
  const { error } = await supabase
    .from('sections')
    .insert(sampleSections)
  
  if (error) {
    console.log('⚠️  Could not create sample sections:', error.message)
  } else {
    console.log(`✅ Created ${sampleSections.length} sample sections`)
  }
}

async function printStats() {
  console.log('\n📊 Database Statistics:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  const tables = [
    { name: 'courses', label: 'Courses' },
    { name: 'rooms', label: 'Rooms' },
    { name: 'instructors', label: 'Instructors' },
    { name: 'student_groups', label: 'Student Groups' },
    { name: 'sections', label: 'Sections' },
    { name: 'exams', label: 'Exams' }
  ]
  
  for (const table of tables) {
    const { count } = await supabase
      .from(table.name)
      .select('*', { count: 'exact', head: true })
    
    console.log(`  ${table.label.padEnd(20)}: ${count || 0}`)
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

async function main() {
  console.log('🌱 SmartSchedule Database Seeder')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  try {
    // Load seed data
    const seedData = await loadSeedData()
    console.log(`📦 Loaded seed data version ${seedData.version}\n`)
    
    // Optional: Clear existing data
    const shouldClear = process.argv.includes('--clear')
    if (shouldClear) {
      await clearExistingData()
      console.log()
    }
    
    // Seed data
    await seedCourses(seedData.data.courses)
    await seedRooms(seedData.data.rooms)
    await seedInstructors(seedData.data.instructors)
    await seedStudentGroups(seedData.data.student_groups)
    
    // Create sample sections
    await createSampleSections()
    
    // Print stats
    await printStats()
    
    console.log('✅ Database seeding completed successfully!\n')
    console.log('Next steps:')
    console.log('  1. Login to the dashboard')
    console.log('  2. Go to Import/Export to load more data if needed')
    console.log('  3. Use the Schedule Generator to create sections')
    console.log('  4. View dashboards to see statistics\n')
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error)
    process.exit(1)
  }
}

// Run the script
main()

