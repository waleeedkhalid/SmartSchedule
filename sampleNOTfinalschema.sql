-- Users and Authentication
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);

-- Roles
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL
);

-- Students
CREATE TABLE students (
    student_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,
    student_number VARCHAR(50) UNIQUE NOT NULL,
    academic_level_id INTEGER NOT NULL,
    group_number VARCHAR(10),
    is_irregular BOOLEAN DEFAULT false,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (academic_level_id) REFERENCES academic_levels(level_id)
);
CREATE INDEX idx_students_level ON students(academic_level_id);
CREATE INDEX idx_students_irregular ON students(is_irregular);

-- Faculty
CREATE TABLE faculty (
    faculty_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100),
    office_location VARCHAR(100),
    availability_preferences JSONB,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Academic Levels
CREATE TABLE academic_levels (
    level_id SERIAL PRIMARY KEY,
    level_name VARCHAR(50) NOT NULL,
    level_number INTEGER NOT NULL,
    department VARCHAR(100) NOT NULL,
    UNIQUE(level_number, department)
);

-- Student Counts (Edugate Import Data)
CREATE TABLE student_counts (
    count_id SERIAL PRIMARY KEY,
    academic_level_id INTEGER NOT NULL,
    semester VARCHAR(20) NOT NULL,
    total_students INTEGER NOT NULL,
    ideal_sections INTEGER,
    students_per_section INTEGER DEFAULT 25,
    import_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (academic_level_id) REFERENCES academic_levels(level_id)
);
CREATE INDEX idx_student_counts_level ON student_counts(academic_level_id);

-- Courses
CREATE TABLE courses (
    course_id SERIAL PRIMARY KEY,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    course_type VARCHAR(50) NOT NULL, -- 'core', 'elective', 'lab'
    credit_hours INTEGER NOT NULL,
    is_lab BOOLEAN DEFAULT false,
    requires_continuous_block BOOLEAN DEFAULT false,
    department VARCHAR(100) NOT NULL,
    description TEXT
);
CREATE INDEX idx_courses_type ON courses(course_type);
CREATE INDEX idx_courses_dept ON courses(department);

-- Course Prerequisites
CREATE TABLE course_prerequisites (
    prerequisite_id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL,
    prerequisite_course_id INTEGER NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (prerequisite_course_id) REFERENCES courses(course_id),
    UNIQUE(course_id, prerequisite_course_id)
);

-- Classrooms
CREATE TABLE classrooms (
    classroom_id SERIAL PRIMARY KEY,
    room_number VARCHAR(50) UNIQUE NOT NULL,
    building VARCHAR(100),
    capacity INTEGER NOT NULL,
    room_type VARCHAR(50), -- 'lecture', 'lab', 'seminar'
    equipment JSONB
);

-- Sections
CREATE TABLE sections (
    section_id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL,
    section_number VARCHAR(10) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    academic_level_id INTEGER,
    faculty_id INTEGER,
    classroom_id INTEGER,
    max_students INTEGER DEFAULT 25,
    enrolled_students INTEGER DEFAULT 0,
    FOREIGN KEY (course_id) REFERENCES courses(course_id),
    FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id),
    FOREIGN KEY (classroom_id) REFERENCES classrooms(classroom_id),
    FOREIGN KEY (academic_level_id) REFERENCES academic_levels(level_id),
    UNIQUE(course_id, section_number, semester)
);
CREATE INDEX idx_sections_course ON sections(course_id);
CREATE INDEX idx_sections_faculty ON sections(faculty_id);

-- Schedules
CREATE TABLE schedules (
    schedule_id SERIAL PRIMARY KEY,
    schedule_name VARCHAR(255) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    schedule_type VARCHAR(50) NOT NULL, -- 'preliminary', 'draft', 'final'
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'under_review', 'finalized'
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finalized_at TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);
CREATE INDEX idx_schedules_semester ON schedules(semester);
CREATE INDEX idx_schedules_status ON schedules(status);

-- Schedule Slots
CREATE TABLE schedule_slots (
    slot_id SERIAL PRIMARY KEY,
    schedule_id INTEGER NOT NULL,
    section_id INTEGER NOT NULL,
    day_of_week VARCHAR(20) NOT NULL, -- 'Sunday', 'Monday', etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_blocked BOOLEAN DEFAULT false, -- for breaks/midterms
    FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES sections(section_id)
);
CREATE INDEX idx_slots_schedule ON schedule_slots(schedule_id);
CREATE INDEX idx_slots_section ON schedule_slots(section_id);
CREATE INDEX idx_slots_time ON schedule_slots(day_of_week, start_time);

-- Exam Schedules
CREATE TABLE exam_schedules (
    exam_id SERIAL PRIMARY KEY,
    schedule_id INTEGER NOT NULL,
    section_id INTEGER NOT NULL,
    exam_type VARCHAR(50) NOT NULL, -- 'midterm', 'final'
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    classroom_id INTEGER,
    FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES sections(section_id),
    FOREIGN KEY (classroom_id) REFERENCES classrooms(classroom_id)
);
CREATE INDEX idx_exams_schedule ON exam_schedules(schedule_id);

-- Irregular Students
CREATE TABLE irregular_students (
    irregular_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    semester VARCHAR(20) NOT NULL,
    remaining_courses JSONB NOT NULL, -- Array of course_ids from past levels
    current_courses JSONB NOT NULL, -- Array of course_ids to prevent falling behind
    notes TEXT,
    entered_by INTEGER NOT NULL,
    entered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (entered_by) REFERENCES users(user_id)
);
CREATE INDEX idx_irregular_student ON irregular_students(student_id);

-- Elective Preferences
CREATE TABLE elective_preferences (
    preference_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    semester VARCHAR(20) NOT NULL,
    priority INTEGER DEFAULT 1, -- 1 = first choice, 2 = second choice, etc.
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id),
    UNIQUE(student_id, course_id, semester)
);
CREATE INDEX idx_preferences_student ON elective_preferences(student_id);

-- Department Schedule Info (External Constraints)
CREATE TABLE department_schedule_info (
    dept_info_id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL,
    course_code VARCHAR(20) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    available_slots JSONB NOT NULL, -- Array of {day, start_time, end_time}
    max_sections INTEGER,
    notes TEXT,
    entered_by INTEGER NOT NULL,
    entered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (entered_by) REFERENCES users(user_id)
);
CREATE INDEX idx_dept_info_semester ON department_schedule_info(semester);

-- Scheduling Rules
CREATE TABLE scheduling_rules (
    rule_id SERIAL PRIMARY KEY,
    rule_name VARCHAR(255) NOT NULL,
    rule_type VARCHAR(50) NOT NULL, -- 'time_constraint', 'resource_constraint', 'preference'
    rule_description TEXT,
    rule_logic JSONB NOT NULL, -- Structured rule definition
    priority INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);
CREATE INDEX idx_rules_active ON scheduling_rules(is_active);

-- Comments and Feedback
CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    schedule_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    comment_text TEXT NOT NULL,
    comment_type VARCHAR(50), -- 'feedback', 'suggestion', 'issue'
    parent_comment_id INTEGER, -- for threaded comments
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (parent_comment_id) REFERENCES comments(comment_id)
);
CREATE INDEX idx_comments_schedule ON comments(schedule_id);
CREATE INDEX idx_comments_user ON comments(user_id);

-- Schedule Versions (jsondiffpatch)
CREATE TABLE schedule_versions (
    version_id SERIAL PRIMARY KEY,
    schedule_id INTEGER NOT NULL,
    version_number INTEGER NOT NULL,
    changes_diff JSONB NOT NULL, -- jsondiffpatch output
    changed_by INTEGER NOT NULL,
    change_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(user_id),
    UNIQUE(schedule_id, version_number)
);
CREATE INDEX idx_versions_schedule ON schedule_versions(schedule_id);

-- Notifications
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- 'deadline', 'comment', 'update', 'assignment'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    reference_type VARCHAR(50), -- 'schedule', 'exam', 'comment'
    reference_id INTEGER,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);