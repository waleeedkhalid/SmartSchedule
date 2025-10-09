-- SmartSchedule Database Schema
-- Run this script in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- STUDENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  level INTEGER NOT NULL DEFAULT 6,
  major TEXT NOT NULL DEFAULT 'Software Engineering',
  gpa DECIMAL(3,2) DEFAULT 0.0,
  completed_credits INTEGER DEFAULT 0,
  total_credits INTEGER DEFAULT 132,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- COMPLETED COURSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS completed_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_code TEXT NOT NULL,
  grade TEXT,
  semester TEXT,
  year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, course_code)
);

-- ============================================================================
-- ELECTIVE SUBMISSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS elective_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  submission_id TEXT NOT NULL UNIQUE, -- e.g., "SUB-1234567890"
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'submitted', -- 'submitted', 'processed', 'scheduled', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ELECTIVE PREFERENCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS elective_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES elective_submissions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_code TEXT NOT NULL,
  priority INTEGER NOT NULL, -- 1 = highest preference
  package_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(submission_id, course_code)
);

-- ============================================================================
-- STUDENT SCHEDULES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS student_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  semester TEXT NOT NULL, -- e.g., "Spring 2025"
  schedule_data JSONB, -- Flexible JSON storage for schedule
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, semester)
);

-- ============================================================================
-- STUDENT FEEDBACK TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS student_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  feedback_text TEXT NOT NULL,
  category TEXT DEFAULT 'general', -- 'schedule', 'elective', 'general', 'technical'
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);

CREATE INDEX IF NOT EXISTS idx_completed_courses_student ON completed_courses(student_id);
CREATE INDEX IF NOT EXISTS idx_completed_courses_code ON completed_courses(course_code);

CREATE INDEX IF NOT EXISTS idx_elective_submissions_student ON elective_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_elective_submissions_status ON elective_submissions(status);
CREATE INDEX IF NOT EXISTS idx_elective_submissions_submission_id ON elective_submissions(submission_id);

CREATE INDEX IF NOT EXISTS idx_elective_preferences_submission ON elective_preferences(submission_id);
CREATE INDEX IF NOT EXISTS idx_elective_preferences_student ON elective_preferences(student_id);

CREATE INDEX IF NOT EXISTS idx_student_schedules_student ON student_schedules(student_id);
CREATE INDEX IF NOT EXISTS idx_student_schedules_semester ON student_schedules(semester);

CREATE INDEX IF NOT EXISTS idx_student_feedback_student ON student_feedback(student_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE elective_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE elective_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_feedback ENABLE ROW LEVEL SECURITY;

-- Students can only view/update their own data
CREATE POLICY "Students can view own profile" ON students
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can update own profile" ON students
  FOR UPDATE USING (auth.uid() = user_id);

-- Students can view their own completed courses
CREATE POLICY "Students can view own completed courses" ON completed_courses
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

-- Students can view their own submissions
CREATE POLICY "Students can view own submissions" ON elective_submissions
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

CREATE POLICY "Students can create submissions" ON elective_submissions
  FOR INSERT WITH CHECK (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

-- Students can view their own preferences
CREATE POLICY "Students can view own preferences" ON elective_preferences
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

CREATE POLICY "Students can create preferences" ON elective_preferences
  FOR INSERT WITH CHECK (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

-- Students can view their own schedules
CREATE POLICY "Students can view own schedules" ON student_schedules
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

-- Students can create feedback
CREATE POLICY "Students can view own feedback" ON student_feedback
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

CREATE POLICY "Students can create feedback" ON student_feedback
  FOR INSERT WITH CHECK (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_elective_submissions_updated_at BEFORE UPDATE ON elective_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_schedules_updated_at BEFORE UPDATE ON student_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA (Optional - for testing)
-- ============================================================================

-- Note: Replace 'YOUR_AUTH_USER_ID' with actual auth.users id from Supabase Auth
-- You can get this by: SELECT id FROM auth.users WHERE email = 'test@example.com';

-- Example student (uncomment and update with real user ID)
/*
INSERT INTO students (user_id, student_id, name, email, level, gpa, completed_credits)
VALUES 
  ('YOUR_AUTH_USER_ID', '441000001', 'Ahmed Mohammed', 'ahmed@ksu.edu.sa', 6, 3.75, 102);

-- Example completed courses
INSERT INTO completed_courses (student_id, course_code, grade, semester, year)
SELECT 
  s.id,
  course_code,
  'A',
  'Fall',
  2024
FROM students s, (VALUES 
  ('SWE211'), ('SWE226'), ('SWE321'), ('SWE314'),
  ('CSC111'), ('CSC113'), ('CSC212'),
  ('MATH151'), ('MATH152'), ('MATH203')
) AS courses(course_code)
WHERE s.student_id = '441000001';
*/

-- ============================================================================
-- VIEWS FOR CONVENIENCE
-- ============================================================================

-- View: Student Profile with completed courses
CREATE OR REPLACE VIEW student_profiles AS
SELECT 
  s.id,
  s.user_id,
  s.student_id,
  s.name,
  s.email,
  s.level,
  s.major,
  s.gpa,
  s.completed_credits,
  s.total_credits,
  ARRAY_AGG(cc.course_code) FILTER (WHERE cc.course_code IS NOT NULL) AS completed_courses
FROM students s
LEFT JOIN completed_courses cc ON s.id = cc.student_id
GROUP BY s.id, s.user_id, s.student_id, s.name, s.email, s.level, s.major, s.gpa, s.completed_credits, s.total_credits;

-- View: Student submissions with preferences
CREATE OR REPLACE VIEW student_submission_details AS
SELECT 
  es.id,
  es.student_id,
  es.submission_id,
  es.submitted_at,
  es.status,
  s.name AS student_name,
  s.student_id AS student_number,
  ARRAY_AGG(
    json_build_object(
      'course_code', ep.course_code,
      'priority', ep.priority,
      'package_id', ep.package_id
    ) ORDER BY ep.priority
  ) AS preferences
FROM elective_submissions es
JOIN students s ON es.student_id = s.id
LEFT JOIN elective_preferences ep ON es.id = ep.submission_id
GROUP BY es.id, es.student_id, es.submission_id, es.submitted_at, es.status, s.name, s.student_id;

-- ============================================================================
-- GRANTS (if needed for service role)
-- ============================================================================

-- Grant usage to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

-- Run this query to verify tables were created:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('students', 'completed_courses', 'elective_submissions', 'elective_preferences', 'student_schedules', 'student_feedback')
ORDER BY table_name;
