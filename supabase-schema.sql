-- ============================================================================
-- SMARTSCHEDULE FINAL SQL SCHEMA (INCLUDING STUDENTS + RLS)
-- ============================================================================
-- Full unified schema including academic profiles, scheduling, rules, and
-- role-based row-level security (RLS) for Supabase deployment.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. USER
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('student','faculty','scheduling_committee','teaching_load_committee','registrar')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 2. STUDENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.students (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.user(id) ON DELETE CASCADE,
  student_id text NOT NULL UNIQUE,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  level integer NOT NULL DEFAULT 6,
  major text NOT NULL DEFAULT 'Software Engineering',
  gpa decimal(3,2) DEFAULT 0.00 CHECK (gpa BETWEEN 0.00 AND 5.00),
  completed_credits integer DEFAULT 0 CHECK (completed_credits >= 0),
  total_credits integer DEFAULT 132 CHECK (total_credits > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 3. COURSE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.course (
  code text PRIMARY KEY,
  name text NOT NULL,
  credits integer NOT NULL,
  level integer NOT NULL,
  type text NOT NULL CHECK (type IN ('required','elective','external')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 4. TIME_SLOT
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.time_slot (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week text NOT NULL CHECK (day_of_week IN ('sunday','monday','tuesday','wednesday','thursday','friday')),
  start_time time NOT NULL,
  end_time time NOT NULL,
  kind text NOT NULL CHECK (kind IN ('lecture','lab','exam')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 5. SECTION
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.section (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code text NOT NULL REFERENCES public.course(code) ON DELETE CASCADE,
  instructor_id uuid NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
  capacity integer NOT NULL,
  time_slot_id uuid NOT NULL REFERENCES public.time_slot(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 6. SCHEDULE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  semester text NOT NULL,
  version integer DEFAULT 1,
  created_by uuid NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('draft','review','final')) DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 7. SCHEDULE_ITEM
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.schedule_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL REFERENCES public.schedule(id) ON DELETE CASCADE,
  course_code text NOT NULL REFERENCES public.course(code) ON DELETE CASCADE,
  section_id uuid REFERENCES public.section(id) ON DELETE SET NULL,
  instructor_id uuid REFERENCES public.user(id) ON DELETE SET NULL,
  time_slot_id uuid NOT NULL REFERENCES public.time_slot(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('lecture','lab','exam')),
  room text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 8. RULE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.rule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name text NOT NULL CHECK (rule_name IN (
    'break_times','midterm_slots','elective_levels',
    'prerequisite_linking','balanced_distribution','lab_continuity',
    'prerequisite_enforcement'
  )),
  description text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 9. RULE_ACTIVATION
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.rule_activation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid NOT NULL REFERENCES public.rule(id) ON DELETE CASCADE,
  value_json jsonb DEFAULT '{}'::jsonb,
  modified_by uuid NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
  modified_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 10. FEEDBACK
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
  schedule_id uuid NOT NULL REFERENCES public.schedule(id) ON DELETE CASCADE,
  comment text,
  rating integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 11. ELECTIVE_PREFERENCES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.elective_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
  elective_choices jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 12. REGISTRATION
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.registration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
  section_id uuid NOT NULL REFERENCES public.section(id) ON DELETE CASCADE,
  status text CHECK (status IN ('pending','enrolled','waitlisted','overridden')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 13. NOTIFICATION
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 14. LOAD_ASSIGNMENT
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.load_assignment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id uuid NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
  course_code text NOT NULL REFERENCES public.course(code) ON DELETE CASCADE,
  hours integer NOT NULL,
  approved_by uuid REFERENCES public.user(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 15. EXTERNAL_COURSE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.external_course (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  department text NOT NULL,
  time_slot_id uuid NOT NULL REFERENCES public.time_slot(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 16. IRREGULAR_STUDENT
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.irregular_student (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
  remaining_courses jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 17. VERSION_HISTORY
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.version_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL REFERENCES public.schedule(id) ON DELETE CASCADE,
  diff_json jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 18. FACULTY_AVAILABILITY
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.faculty_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id uuid NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
  day_of_week text CHECK (day_of_week IN ('sunday','monday','tuesday','wednesday','thursday')),
  start_time time NOT NULL,
  end_time time NOT NULL,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 19. STUDENT_PREFERENCES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.student_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
  preferred_times jsonb,
  disliked_times jsonb,
  elective_choices jsonb,
  instructor_preferences jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 20. SCHEDULING_TASK
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.scheduling_task (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid REFERENCES public.schedule(id) ON DELETE CASCADE,
  initiated_by uuid REFERENCES public.user(id) ON DELETE SET NULL,
  status text CHECK (status IN ('pending','running','completed','failed')) DEFAULT 'pending',
  parameters jsonb,
  result_summary jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- RLS POLICIES (ROLE-AWARE)
-- ============================================================================
-- Secure, granular role-based access control aligned with SmartSchedule workflow.
-- ============================================================================

-- USERS
ALTER TABLE public.user ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.user FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update their own profile" ON public.user FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Committees and registrar can view all users" ON public.user FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user u WHERE u.id = auth.uid() AND u.role IN ('registrar','scheduling_committee','teaching_load_committee'))
);

-- STUDENTS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view their own profile" ON public.students FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Registrar and scheduling committee can manage student profiles" ON public.students FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user u WHERE u.id = auth.uid() AND u.role IN ('registrar','scheduling_committee'))
);

-- COURSE
ALTER TABLE public.course ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All users can view courses" ON public.course FOR SELECT USING (true);
CREATE POLICY "Registrar and teaching load committee can manage courses" ON public.course FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user u WHERE u.id = auth.uid() AND u.role IN ('registrar','teaching_load_committee'))
);

-- TIME_SLOT
ALTER TABLE public.time_slot ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view time slots" ON public.time_slot FOR SELECT USING (true);
CREATE POLICY "Scheduling committee and registrar can manage time slots" ON public.time_slot FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user u WHERE u.id = auth.uid() AND u.role IN ('scheduling_committee','registrar'))
);

-- SECTION
ALTER TABLE public.section ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Faculty can view their own sections" ON public.section FOR SELECT USING (instructor_id = auth.uid());
CREATE POLICY "Scheduling committee and registrar can view and manage all sections" ON public.section FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user u WHERE u.id = auth.uid() AND u.role IN ('scheduling_committee','registrar'))
);

-- SCHEDULE
ALTER TABLE public.schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view final schedules" ON public.schedule FOR SELECT USING (status = 'final');
CREATE POLICY "Scheduling committee and registrar can manage schedules" ON public.schedule FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user u WHERE u.id = auth.uid() AND u.role IN ('scheduling_committee','registrar'))
);

-- SCHEDULE_ITEM
ALTER TABLE public.schedule_item ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view final schedule items" ON public.schedule_item FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.schedule s WHERE s.id = schedule_id AND s.status = 'final')
);
CREATE POLICY "Scheduling committee and registrar can manage schedule items" ON public.schedule_item FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user u WHERE u.id = auth.uid() AND u.role IN ('scheduling_committee','registrar'))
);

-- RULE / RULE_ACTIVATION
ALTER TABLE public.rule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view rules" ON public.rule FOR SELECT USING (true);
CREATE POLICY "Committees and registrar can manage rules" ON public.rule FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user u WHERE u.id = auth.uid() AND u.role IN ('scheduling_committee','teaching_load_committee','registrar'))
);

ALTER TABLE public.rule_activation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Committees and registrar can manage rule activations" ON public.rule_activation FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user u WHERE u.id = auth.uid() AND u.role IN ('scheduling_committee','teaching_load_committee','registrar'))
);

-- FEEDBACK
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own feedback" ON public.feedback FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert feedback for themselves" ON public.feedback FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Committees and registrar can view all feedback" ON public.feedback FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user u WHERE u.id = auth.uid() AND u.role IN ('scheduling_committee','teaching_load_committee','registrar'))
);

-- ELECTIVE_PREFERENCES
ALTER TABLE public.elective_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can manage their own elective preferences" ON public.elective_preferences FOR ALL USING (student_id = auth.uid());
CREATE POLICY "Committees and registrar can view all elective preferences" ON public.elective_preferences FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user u WHERE u.id = auth.uid() AND u.role IN ('scheduling_committee','registrar'))
);

-- REGISTRATION
ALTER TABLE public.registration ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students manage their own registrations" ON public.registration FOR ALL USING (student_id = auth.uid());
CREATE POLICY "Registrar and scheduling committee can manage all registrations" ON public.registration FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user u WHERE u.id = auth.uid() AND u.role IN ('registrar','scheduling_committee'))
);

-- NOTIFICATION
ALTER TABLE public.notification ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications" ON public.notification FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can insert notifications" ON public.notification FOR INSERT WITH CHECK (true);

-- LOAD_ASSIGNMENT
ALTER TABLE public.load_assignment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Faculty can view their own load" ON public.load_assignment FOR SELECT USING (faculty_id = auth.uid());
CREATE POLICY "Teaching load committee and registrar manage all" ON public.load_assignment FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user u WHERE u.id = auth.uid() AND u.role IN ('teaching_load_committee','registrar'))
);

-- EXTERNAL_COURSE
ALTER TABLE public.external_course ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view external courses" ON public.external_course FOR SELECT USING (true);
CREATE POLICY "Scheduling committee and registrar can manage external courses" ON public.external_course FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user u WHERE u.id = auth.uid() AND u.role IN ('scheduling_committee','registrar'))
);

-- IRREGULAR_STUDENT
ALTER TABLE public.irregular_student ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view their own irregular record" ON public.irregular_student FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Registrar can manage all irregular records" ON public.irregular_student FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user u WHERE u.id = auth.uid() AND u.role = 'registrar')
);

-- VERSION_HISTORY
ALTER TABLE public.version_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Committees and registrar can view version history" ON public.version_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user u WHERE u.id = auth.uid() AND u.role IN ('scheduling_committee','teaching_load_committee','registrar'))
);

-- FACULTY_AVAILABILITY
ALTER TABLE public.faculty_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Faculty can manage their own availability" ON public.faculty_availability FOR ALL USING (faculty_id = auth.uid());
CREATE POLICY "Committees and registrar can view all availability" ON public.faculty_availability FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user u WHERE u.id = auth.uid() AND u.role IN ('scheduling_committee','teaching_load_committee','registrar'))
);

-- STUDENT_PREFERENCES
ALTER TABLE public.student_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students manage their own preferences" ON public.student_preferences FOR ALL USING (student_id = auth.uid());
CREATE POLICY "Committees and registrar can view all preferences" ON public.student_preferences FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user u WHERE u.id = auth.uid() AND u.role IN ('scheduling_committee','registrar'))
);

-- SCHEDULING_TASK
ALTER TABLE public.scheduling_task ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Committees and registrar can view/manage scheduling tasks" ON public.scheduling_task FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user u WHERE u.id = auth.uid() AND u.role IN ('scheduling_committee','registrar'))
);
