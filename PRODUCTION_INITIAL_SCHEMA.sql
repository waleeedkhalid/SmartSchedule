-- SmartSchedule Production Initial Schema
-- Created: October 29, 2025
-- Consolidated from 26 local migrations for clean production deployment
-- Includes: Core schema + RLS + Onboarding + Critical features

-- =====================================================
-- EXTENSIONS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE user_role AS ENUM ('scheduling', 'teaching_load', 'faculty', 'student', 'registrar');
CREATE TYPE room_type AS ENUM ('Lecture', 'Lab');
CREATE TYPE section_state AS ENUM ('draft', 'released');

-- =====================================================
-- CORE TABLES
-- =====================================================

-- User roles table (extends Supabase auth.users)
CREATE TABLE user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  level INT CHECK (level >= 1 AND level <= 8),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time grid configuration
CREATE TABLE time_grid_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teaching_days TEXT[] NOT NULL DEFAULT ARRAY['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
  daily_start_time TIME NOT NULL DEFAULT '08:00:00',
  daily_end_time TIME NOT NULL DEFAULT '17:00:00',
  slot_duration_minutes INT NOT NULL DEFAULT 60,
  break_start_time TIME NOT NULL DEFAULT '12:00:00',
  break_end_time TIME NOT NULL DEFAULT '13:00:00',
  exam_days TEXT[] NOT NULL DEFAULT ARRAY['Saturday'],
  exam_start_time TIME NOT NULL DEFAULT '09:00:00',
  exam_end_time TIME NOT NULL DEFAULT '17:00:00',
  typical_lab_duration_minutes INT NOT NULL DEFAULT 120,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Course table
CREATE TABLE course (
  code TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  level INT NOT NULL CHECK (level >= 0 AND level <= 8),
  credits INT NOT NULL CHECK (credits > 0),
  weekly_hours INT NOT NULL CHECK (weekly_hours > 0),
  is_elective BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Room table
CREATE TABLE room (
  code TEXT PRIMARY KEY,
  type room_type NOT NULL,
  capacity INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Instructor table
CREATE TABLE instructor (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  preferred_times JSONB DEFAULT '[]'::jsonb,
  unavailable_times JSONB DEFAULT '[]'::jsonb,
  max_load_per_week INT DEFAULT 12 CHECK (max_load_per_week > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Student group table
CREATE TABLE student_group (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level INT NOT NULL CHECK (level >= 1 AND level <= 8),
  size INT NOT NULL DEFAULT 0 CHECK (size >= 0),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Section table
CREATE TABLE section (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_code TEXT NOT NULL REFERENCES course(code) ON DELETE CASCADE,
  section_no TEXT NOT NULL,
  activity TEXT CHECK (activity IN ('lecture', 'tutorial', 'lab')),
  instructor_id UUID REFERENCES instructor(id) ON DELETE SET NULL,
  room_code TEXT REFERENCES room(code) ON DELETE SET NULL,
  capacity INT NOT NULL CHECK (capacity > 0),
  meeting_pattern JSONB NOT NULL DEFAULT '{}'::jsonb,
  group_level INT NOT NULL CHECK (group_level >= 1 AND group_level <= 8),
  state section_state NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(course_code, section_no)
);

-- Elective preference table
CREATE TABLE elective_preference (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_code TEXT NOT NULL REFERENCES course(code) ON DELETE CASCADE,
  rank INT NOT NULL CHECK (rank > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, course_code)
);

-- Exam table (course-level only, no section_id)
CREATE TABLE exam (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_code TEXT NOT NULL REFERENCES course(code) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
  room_codes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Scheduling rules table
CREATE TABLE rule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  time_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  forbidden_pairs JSONB NOT NULL DEFAULT '[]'::jsonb,
  exam_spacing_mins INT NOT NULL DEFAULT 120 CHECK (exam_spacing_mins >= 0),
  max_classes_per_instructor_day INT DEFAULT 4 CHECK (max_classes_per_instructor_day > 0),
  max_classes_per_student_day INT DEFAULT 6 CHECK (max_classes_per_student_day > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Schedule document table
CREATE TABLE schedule_doc (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  release_tag TEXT,
  diff_from_previous JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(release_tag)
);

-- Comment table (unified for schedules and electives)
CREATE TABLE comment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doc_id UUID REFERENCES schedule_doc(id) ON DELETE CASCADE,
  target_ref TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification table
CREATE TABLE notification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_user_roles_role ON user_roles(role);
CREATE INDEX idx_user_roles_onboarding ON user_roles(onboarding_completed) WHERE onboarding_completed = FALSE;
CREATE INDEX idx_user_roles_level ON user_roles(level) WHERE level IS NOT NULL;
CREATE INDEX idx_course_level ON course(level);
CREATE INDEX idx_course_is_elective ON course(is_elective);
CREATE INDEX idx_section_course_code ON section(course_code);
CREATE INDEX idx_section_instructor_id ON section(instructor_id);
CREATE INDEX idx_section_state ON section(state);
CREATE INDEX idx_section_group_level ON section(group_level);
CREATE INDEX idx_elective_preference_student ON elective_preference(student_id);
CREATE INDEX idx_exam_course_code ON exam(course_code);
CREATE INDEX idx_exam_date ON exam(date);
CREATE INDEX idx_comment_doc_id ON comment(doc_id);
CREATE INDEX idx_comment_author_id ON comment(author_id);
CREATE INDEX idx_notification_user_id ON notification(user_id);
CREATE INDEX idx_notification_read_at ON notification(read_at);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_time_grid_config_updated_at BEFORE UPDATE ON time_grid_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_updated_at BEFORE UPDATE ON course FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_room_updated_at BEFORE UPDATE ON room FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_instructor_updated_at BEFORE UPDATE ON instructor FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_group_updated_at BEFORE UPDATE ON student_group FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_section_updated_at BEFORE UPDATE ON section FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_elective_preference_updated_at BEFORE UPDATE ON elective_preference FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exam_updated_at BEFORE UPDATE ON exam FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rule_updated_at BEFORE UPDATE ON rule FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comment_updated_at BEFORE UPDATE ON comment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Helper Functions (with infinite recursion fix)
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM user_roles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER SET row_security = off;

CREATE OR REPLACE FUNCTION has_role(check_role user_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = check_role
  );
$$ LANGUAGE SQL SECURITY DEFINER SET row_security = off;

CREATE OR REPLACE FUNCTION has_any_role(check_roles user_role[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = ANY(check_roles)
  );
$$ LANGUAGE SQL SECURITY DEFINER SET row_security = off;

-- Auto-assign student to group function
CREATE OR REPLACE FUNCTION auto_assign_student_to_group(p_student_id UUID, p_level INT)
RETURNS UUID AS $$
DECLARE
  v_group_id UUID;
BEGIN
  -- Find the group with minimum size for this level
  SELECT id INTO v_group_id
  FROM student_group
  WHERE level = p_level
  ORDER BY size ASC, created_at ASC
  LIMIT 1;
  
  IF v_group_id IS NULL THEN
    RAISE EXCEPTION 'No student group found for level %', p_level;
  END IF;
  
  -- Increment group size
  UPDATE student_group
  SET size = size + 1
  WHERE id = v_group_id;
  
  RETURN v_group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_grid_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE course ENABLE ROW LEVEL SECURITY;
ALTER TABLE room ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructor ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_group ENABLE ROW LEVEL SECURITY;
ALTER TABLE section ENABLE ROW LEVEL SECURITY;
ALTER TABLE elective_preference ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_doc ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification ENABLE ROW LEVEL SECURITY;

-- USER_ROLES POLICIES
CREATE POLICY "Users can read own role"
  ON user_roles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all roles"
  ON user_roles FOR SELECT
  USING (has_any_role(ARRAY['scheduling', 'registrar']::user_role[]));

CREATE POLICY "Users can update own onboarding fields"
  ON user_roles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Scheduling can manage all roles"
  ON user_roles FOR ALL
  USING (has_role('scheduling'::user_role))
  WITH CHECK (has_role('scheduling'::user_role));

-- TIME_GRID_CONFIG POLICIES
CREATE POLICY "Everyone can read time grid config"
  ON time_grid_config FOR SELECT
  USING (true);

CREATE POLICY "Scheduling can update time grid config"
  ON time_grid_config FOR ALL
  USING (has_role('scheduling'::user_role))
  WITH CHECK (has_role('scheduling'::user_role));

-- COURSE POLICIES
CREATE POLICY "Everyone can read courses"
  ON course FOR SELECT
  USING (true);

CREATE POLICY "Scheduling and teaching_load can manage courses"
  ON course FOR ALL
  USING (has_any_role(ARRAY['scheduling', 'teaching_load']::user_role[]))
  WITH CHECK (has_any_role(ARRAY['scheduling', 'teaching_load']::user_role[]));

-- ROOM POLICIES
CREATE POLICY "Everyone can read rooms"
  ON room FOR SELECT
  USING (true);

CREATE POLICY "Scheduling can manage rooms"
  ON room FOR ALL
  USING (has_role('scheduling'::user_role))
  WITH CHECK (has_role('scheduling'::user_role));

-- INSTRUCTOR POLICIES
CREATE POLICY "Everyone can read instructors"
  ON instructor FOR SELECT
  USING (true);

CREATE POLICY "Faculty can update own availability"
  ON instructor FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Scheduling and teaching_load can manage instructors"
  ON instructor FOR ALL
  USING (has_any_role(ARRAY['scheduling', 'teaching_load']::user_role[]))
  WITH CHECK (has_any_role(ARRAY['scheduling', 'teaching_load']::user_role[]));

-- STUDENT_GROUP POLICIES
CREATE POLICY "Everyone can read student groups"
  ON student_group FOR SELECT
  USING (true);

CREATE POLICY "Scheduling can manage student groups"
  ON student_group FOR ALL
  USING (has_role('scheduling'::user_role))
  WITH CHECK (has_role('scheduling'::user_role));

-- SECTION POLICIES
CREATE POLICY "Everyone can read sections"
  ON section FOR SELECT
  USING (true);

CREATE POLICY "Scheduling and teaching_load can manage sections"
  ON section FOR ALL
  USING (has_any_role(ARRAY['scheduling', 'teaching_load']::user_role[]))
  WITH CHECK (has_any_role(ARRAY['scheduling', 'teaching_load']::user_role[]));

-- ELECTIVE_PREFERENCE POLICIES
CREATE POLICY "Students can manage own preferences"
  ON elective_preference FOR ALL
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid() AND has_role('student'::user_role));

CREATE POLICY "Scheduling can read all preferences"
  ON elective_preference FOR SELECT
  USING (has_role('scheduling'::user_role));

-- EXAM POLICIES
CREATE POLICY "Everyone can read exams"
  ON exam FOR SELECT
  USING (true);

CREATE POLICY "Scheduling can manage exams"
  ON exam FOR ALL
  USING (has_role('scheduling'::user_role))
  WITH CHECK (has_role('scheduling'::user_role));

-- RULE POLICIES
CREATE POLICY "Everyone can read rules"
  ON rule FOR SELECT
  USING (true);

CREATE POLICY "Scheduling can manage rules"
  ON rule FOR ALL
  USING (has_role('scheduling'::user_role))
  WITH CHECK (has_role('scheduling'::user_role));

-- SCHEDULE_DOC POLICIES
CREATE POLICY "Everyone can read schedule docs"
  ON schedule_doc FOR SELECT
  USING (true);

CREATE POLICY "Scheduling can manage schedule docs"
  ON schedule_doc FOR ALL
  USING (has_role('scheduling'::user_role))
  WITH CHECK (has_role('scheduling'::user_role));

-- COMMENT POLICIES
CREATE POLICY "Everyone can read comments"
  ON comment FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comment FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage own comments"
  ON comment FOR ALL
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- NOTIFICATION POLICIES
CREATE POLICY "Users can read own notifications"
  ON notification FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Scheduling can create notifications"
  ON notification FOR INSERT
  WITH CHECK (has_role('scheduling'::user_role));

CREATE POLICY "Users can update own notifications"
  ON notification FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications"
  ON notification FOR DELETE
  USING (user_id = auth.uid());

-- =====================================================
-- DEFAULT DATA
-- =====================================================

-- Insert default time grid config
INSERT INTO time_grid_config (id) VALUES (uuid_generate_v4());

-- Insert default rule
INSERT INTO rule (id) VALUES (uuid_generate_v4());

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE user_roles IS 'User roles and profiles (extends Supabase auth.users)';
COMMENT ON COLUMN user_roles.level IS 'Academic level for students (1-8). Levels 1-3: Foundation, 4-8: Major courses';
COMMENT ON COLUMN user_roles.onboarding_completed IS 'Tracks if user completed first-time onboarding';
COMMENT ON TABLE student_group IS 'Student groups organized by academic level';
COMMENT ON TABLE exam IS 'Course-level exams (applies to all sections of a course)';
COMMENT ON COLUMN section.activity IS 'Section activity type: lecture, tutorial, or lab';
COMMENT ON FUNCTION get_user_role IS 'Returns current user role. Bypasses RLS to prevent infinite recursion.';
COMMENT ON FUNCTION has_role IS 'Checks if current user has specified role. Bypasses RLS to prevent infinite recursion.';
COMMENT ON FUNCTION has_any_role IS 'Checks if current user has any of specified roles. Bypasses RLS to prevent infinite recursion.';
COMMENT ON FUNCTION auto_assign_student_to_group IS 'Automatically assigns student to group with minimum size for their level';

