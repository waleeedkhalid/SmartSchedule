/**
 * Seed External Data Script
 * 
 * Usage:
 *   pnpm tsx scripts/seed-external-data.ts
 *   pnpm tsx scripts/seed-external-data.ts --clear (clears existing data first)
 * 
 * This script imports data from:
 *   - external_departments_courses_sections.json (external dept courses, sections, exams)
 *   - swe_plan.json (SWE study plan courses)
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

interface ExternalDepartmentsData {
  external_departments: Array<{
    department_code: string
    department_name: string
    courses: Array<{
      code: string
      title: string
      credits: number
      weekly_hours: number
      level: number
      is_elective: boolean
      prerequisite?: string
      section_groups: Array<{
        group_id: string | number
        group_level: number
        capacity: number
        sections: Array<{
          section_no: string
          section_type: string
          instructor: {
            name: string
            email: string
          }
          room_code: string
          meeting_pattern: {
            days: string[]
            start_time: string
            duration_minutes: number
          }
        }>
      }>
      exams?: {
        midterm?: {
          date: string
          start_time: string
          duration_minutes: number
          room_codes: string[]
        }
        midterm2?: {
          date: string
          start_time: string
          duration_minutes: number
          room_codes: string[]
        }
        final?: {
          date: string
          start_time: string
          duration_minutes: number
          room_codes: string[]
        }
      }
    }>
  }>
}

interface SWEPlanData {
  study_plan: Array<{
    level: number
    courses: Array<{
      code: string
      title: string
      credit_hours: number
      prerequisite?: string
    }>
  }>
  elective_groups: Array<{
    group_name: string
    required_credit_hours: number
    courses: Array<{
      code: string
      title: string
      credit_hours: number
      prerequisite?: string
    }>
  }>
}

async function loadExternalDepartmentsData(): Promise<ExternalDepartmentsData> {
  const filePath = path.join(process.cwd(), 'external_departments_courses_sections.json')
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`)
    process.exit(1)
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(fileContent) as ExternalDepartmentsData
}

async function loadSWEPlanData(): Promise<SWEPlanData> {
  const filePath = path.join(process.cwd(), 'swe_plan.json')
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`)
    process.exit(1)
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(fileContent) as SWEPlanData
}

async function clearExistingData() {
  console.log('🗑️  Clearing existing data...')
  
  // Delete in reverse order of dependencies
  await supabase.from('exam').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('section').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('elective_preference').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('student_group').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('instructor').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('room').delete().neq('code', 'DUMMY')
  await supabase.from('course').delete().neq('code', 'DUMMY')
  
  console.log('✅ Existing data cleared\n')
}

async function seedSWECourses(swePlan: SWEPlanData) {
  console.log('📚 Seeding SWE courses from study plan...')
  
  const courses: any[] = []
  
  // Process core courses from each level
  for (const levelPlan of swePlan.study_plan) {
    for (const course of levelPlan.courses) {
      // Skip courses that are from external departments (already in external data)
      if (!course.code.startsWith('SWE')) continue
      
      courses.push({
        code: course.code,
        title: course.title,
        level: levelPlan.level,
        credits: course.credit_hours,
        weekly_hours: course.credit_hours + 2, // Estimate: credits + 2 hours
        is_elective: false
      })
    }
  }
  
  // Process elective courses
  for (const electiveGroup of swePlan.elective_groups) {
    for (const course of electiveGroup.courses) {
      // Skip courses that are from external departments or already added
      if (!course.code.startsWith('SWE')) continue
      if (courses.find(c => c.code === course.code)) continue
      
      courses.push({
        code: course.code,
        title: course.title,
        level: 0, // Electives don't have a fixed level
        credits: course.credit_hours,
        weekly_hours: course.credit_hours + 2, // Estimate
        is_elective: true
      })
    }
  }
  
  if (courses.length > 0) {
    const { data, error } = await supabase
      .from('course')
      .upsert(courses, { onConflict: 'code' })
      .select()
    
    if (error) {
      console.error('❌ Error seeding SWE courses:', error.message)
      throw error
    }
    
    console.log(`✅ Seeded ${courses.length} SWE courses\n`)
  } else {
    console.log('⚠️  No SWE courses to seed\n')
  }
}

async function seedExternalCourses(externalData: ExternalDepartmentsData) {
  console.log('📚 Seeding external department courses...')
  
  const courses: any[] = []
  
  for (const dept of externalData.external_departments) {
    for (const course of dept.courses) {
      courses.push({
        code: course.code,
        title: course.title,
        level: course.level,
        credits: course.credits,
        weekly_hours: course.weekly_hours,
        is_elective: course.is_elective
      })
    }
  }
  
  const { data, error } = await supabase
    .from('course')
    .upsert(courses, { onConflict: 'code' })
    .select()
  
  if (error) {
    console.error('❌ Error seeding courses:', error.message)
    throw error
  }
  
  console.log(`✅ Seeded ${courses.length} external courses\n`)
}

async function seedInstructors(externalData: ExternalDepartmentsData) {
  console.log('👨‍🏫 Seeding instructors...')
  
  const instructorMap = new Map<string, any>()
  
  for (const dept of externalData.external_departments) {
    for (const course of dept.courses) {
      for (const sectionGroup of course.section_groups) {
        for (const section of sectionGroup.sections) {
          const email = section.instructor.email
          if (!instructorMap.has(email)) {
            instructorMap.set(email, {
              name: section.instructor.name,
              email: email,
              max_load_per_week: 12,
              preferred_times: [],
              unavailable_times: []
            })
          }
        }
      }
    }
  }
  
  const instructors = Array.from(instructorMap.values())
  
  const { data, error } = await supabase
    .from('instructor')
    .upsert(instructors, { onConflict: 'email' })
    .select()
  
  if (error) {
    console.error('❌ Error seeding instructors:', error.message)
    throw error
  }
  
  console.log(`✅ Seeded ${instructors.length} instructors\n`)
  return data
}

async function seedRooms(externalData: ExternalDepartmentsData) {
  console.log('🏫 Seeding rooms...')
  
  const roomSet = new Set<string>()
  
  for (const dept of externalData.external_departments) {
    for (const course of dept.courses) {
      for (const sectionGroup of course.section_groups) {
        for (const section of sectionGroup.sections) {
          roomSet.add(section.room_code)
        }
      }
      
      // Add exam rooms
      if (course.exams) {
        if (course.exams.midterm) {
          course.exams.midterm.room_codes.forEach(code => roomSet.add(code))
        }
        if (course.exams.midterm2) {
          course.exams.midterm2.room_codes.forEach(code => roomSet.add(code))
        }
        if (course.exams.final) {
          course.exams.final.room_codes.forEach(code => roomSet.add(code))
        }
      }
    }
  }
  
  const rooms = Array.from(roomSet).map(code => {
    // Infer room type from code
    let type: 'lecture' | 'lab' | 'exam' = 'lecture'
    if (code.includes('LAB')) {
      type = 'lab'
    } else if (code.includes('EXAM')) {
      type = 'exam'
    }
    
    return {
      code,
      type,
      capacity: type === 'lab' ? 30 : type === 'exam' ? 100 : 50
    }
  })
  
  const { data, error } = await supabase
    .from('room')
    .upsert(rooms, { onConflict: 'code' })
    .select()
  
  if (error) {
    console.error('❌ Error seeding rooms:', error.message)
    throw error
  }
  
  console.log(`✅ Seeded ${rooms.length} rooms\n`)
}

async function seedSections(externalData: ExternalDepartmentsData, instructors: any[]) {
  console.log('📝 Seeding sections...')
  
  // Create instructor email to ID map
  const instructorEmailMap = new Map<string, string>()
  instructors.forEach(inst => {
    if (inst.email) {
      instructorEmailMap.set(inst.email, inst.id)
    }
  })
  
  const sections: any[] = []
  
  for (const dept of externalData.external_departments) {
    for (const course of dept.courses) {
      for (const sectionGroup of course.section_groups) {
        for (const section of sectionGroup.sections) {
          const instructorId = instructorEmailMap.get(section.instructor.email)
          
          // Determine activity type
          let activity: 'lecture' | 'tutorial' | 'lab' = 'lecture'
          const sectionType = section.section_type.toLowerCase()
          if (sectionType === 'tutorial') {
            activity = 'tutorial'
          } else if (sectionType === 'lab') {
            activity = 'lab'
          }
          
          // Normalize days to lowercase
          const normalizedDays = section.meeting_pattern.days.map(d => d.toLowerCase())
          
          sections.push({
            course_code: course.code,
            section_no: section.section_no,
            activity: activity,
            instructor_id: instructorId,
            room_code: section.room_code,
            capacity: sectionGroup.capacity,
            group_level: sectionGroup.group_level,
            meeting_pattern: {
              days: normalizedDays,
              start_time: section.meeting_pattern.start_time,
              duration_minutes: section.meeting_pattern.duration_minutes
            },
            state: 'draft'
          })
        }
      }
    }
  }
  
  const { data, error } = await supabase
    .from('section')
    .insert(sections)
    .select()
  
  if (error) {
    console.error('❌ Error seeding sections:', error.message)
    throw error
  }
  
  console.log(`✅ Seeded ${sections.length} sections\n`)
}

async function seedExams(externalData: ExternalDepartmentsData) {
  console.log('📅 Seeding exams...')
  
  const exams: any[] = []
  
  for (const dept of externalData.external_departments) {
    for (const course of dept.courses) {
      if (!course.exams) continue
      
      // Midterm
      if (course.exams.midterm) {
        exams.push({
          course_code: course.code,
          date: course.exams.midterm.date,
          start_time: course.exams.midterm.start_time,
          duration_minutes: course.exams.midterm.duration_minutes,
          room_codes: course.exams.midterm.room_codes
        })
      }
      
      // Midterm 2
      if (course.exams.midterm2) {
        exams.push({
          course_code: course.code,
          date: course.exams.midterm2.date,
          start_time: course.exams.midterm2.start_time,
          duration_minutes: course.exams.midterm2.duration_minutes,
          room_codes: course.exams.midterm2.room_codes
        })
      }
      
      // Final
      if (course.exams.final) {
        exams.push({
          course_code: course.code,
          date: course.exams.final.date,
          start_time: course.exams.final.start_time,
          duration_minutes: course.exams.final.duration_minutes,
          room_codes: course.exams.final.room_codes
        })
      }
    }
  }
  
  const { data, error } = await supabase
    .from('exam')
    .insert(exams)
    .select()
  
  if (error) {
    console.error('❌ Error seeding exams:', error.message)
    throw error
  }
  
  console.log(`✅ Seeded ${exams.length} exams\n`)
}

async function seedStudentGroups() {
  console.log('👥 Seeding student groups...')
  
  const groups: any[] = []
  
  // Create groups for levels 1-8
  for (let level = 1; level <= 8; level++) {
    groups.push({
      level: level,
      size: 0, // Will be auto-updated when students are added
      name: `Level ${level}`
    })
  }
  
  const { data, error } = await supabase
    .from('student_group')
    .insert(groups)
    .select()
  
  if (error) {
    console.error('❌ Error seeding student groups:', error.message)
    throw error
  }
  
  console.log(`✅ Seeded ${groups.length} student groups\n`)
}

async function printStats() {
  console.log('\n📊 Database Statistics:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  const tables = [
    { name: 'course', label: 'Courses' },
    { name: 'room', label: 'Rooms' },
    { name: 'instructor', label: 'Instructors' },
    { name: 'student_group', label: 'Student Groups' },
    { name: 'section', label: 'Sections' },
    { name: 'exam', label: 'Exams' }
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
  console.log('🌱 SmartSchedule External Data Seeder')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  try {
    // Load data files
    console.log('📦 Loading data files...')
    const externalData = await loadExternalDepartmentsData()
    const swePlan = await loadSWEPlanData()
    console.log(`✅ Loaded external departments: ${externalData.external_departments.length}`)
    console.log(`✅ Loaded SWE study plan levels: ${swePlan.study_plan.length}`)
    console.log(`✅ Loaded SWE elective groups: ${swePlan.elective_groups.length}\n`)
    
    // Optional: Clear existing data
    const shouldClear = process.argv.includes('--clear')
    if (shouldClear) {
      await clearExistingData()
    }
    
    // Seed data in order
    await seedSWECourses(swePlan)
    await seedExternalCourses(externalData)
    
    const instructors = await seedInstructors(externalData)
    await seedRooms(externalData)
    
    await seedSections(externalData, instructors)
    await seedExams(externalData)
    await seedStudentGroups()
    
    // Print stats
    await printStats()
    
    console.log('✅ Database seeding completed successfully!\n')
    console.log('Summary:')
    console.log('  • SWE core and elective courses imported')
    console.log('  • External department courses imported')
    console.log('  • Instructors, rooms, sections, and exams imported')
    console.log('  • Student groups created for levels 1-8\n')
    console.log('Next steps:')
    console.log('  1. Login to the dashboard')
    console.log('  2. Review the imported data')
    console.log('  3. Update section states to "released" when ready')
    console.log('  4. Create student accounts and assign to levels\n')
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error)
    process.exit(1)
  }
}

// Run the script
main()

