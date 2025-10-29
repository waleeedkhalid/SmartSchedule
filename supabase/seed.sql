-- ============================================================================
-- SmartSchedule Database Seed Data
-- ============================================================================
-- This file contains seed data for the SmartSchedule application including:
--   - SWE Study Plan courses
--   - External department courses
--   - Instructors
--   - Rooms
--   - Sections
--   - Exams
--   - Student groups
-- ============================================================================

-- Clear existing data (optional - comment out if you want to keep existing data)
-- DELETE FROM exam;
-- DELETE FROM section;
-- DELETE FROM elective_preference;
-- DELETE FROM student_group;
-- DELETE FROM instructor;
-- DELETE FROM room;
-- DELETE FROM course;

-- ============================================================================
-- COURSES
-- ============================================================================

-- SWE Core Courses (Levels 4-8)
INSERT INTO course (code, title, level, credits, weekly_hours, is_elective) VALUES
-- Level 4
('SWE 211', 'Introduction to Software Engineering', 4, 3, 5, false),

-- Level 5
('SWE 314', 'Software Security Engineering', 5, 3, 5, false),
('SWE 312', 'Software Requirements Engineering', 5, 3, 5, false),

-- Level 6
('SWE 381', 'Web Application Development', 6, 3, 5, false),
('SWE 321', 'Software Design and Architecture', 6, 3, 5, false),
('SWE 333', 'Software Quality Assurance', 6, 2, 4, false),

-- Level 7
('SWE 444', 'Software Construction Laboratory', 7, 2, 4, false),
('SWE 434', 'Software Testing & Validation', 7, 3, 5, false),
('SWE 496', 'Graduation Project I', 7, 3, 5, false),
('SWE 477', 'Software Engineering Code of Ethics & Professional Practice', 7, 2, 4, false),
('SWE 482', 'Human-Computer Interaction', 7, 3, 5, false),

-- Level 8
('SWE 466', 'Software Project Management', 8, 3, 5, false),
('SWE 455', 'Software Maintenance & Evolution', 8, 2, 4, false),
('SWE 497', 'Graduation Project II', 8, 3, 5, false)

ON CONFLICT (code) DO UPDATE SET
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  credits = EXCLUDED.credits,
  weekly_hours = EXCLUDED.weekly_hours,
  is_elective = EXCLUDED.is_elective;

-- SWE Elective Courses
INSERT INTO course (code, title, level, credits, weekly_hours, is_elective) VALUES
('SWE 481', 'Advanced Web Applications Engineering', 0, 3, 5, true),
('SWE 483', 'Mobile Application Development', 0, 3, 5, true),
('SWE 484', 'Multimedia Computing', 0, 3, 5, true),
('SWE 485', 'Selected Topics in Software Engineering', 0, 3, 5, true),
('SWE 486', 'Cloud Computing and Big Data', 0, 3, 5, true),
('SWE 488', 'Complex Systems Engineering', 0, 3, 5, true)

ON CONFLICT (code) DO UPDATE SET
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  credits = EXCLUDED.credits,
  weekly_hours = EXCLUDED.weekly_hours,
  is_elective = EXCLUDED.is_elective;

-- External Department Courses
INSERT INTO course (code, title, level, credits, weekly_hours, is_elective) VALUES
-- MATH Department
('MATH 244', 'Linear Algebra', 4, 3, 5, false),
('MATH 254', 'Numerical Analysis', 0, 3, 5, true),
('MATH 200', 'Differential and Integral Calculus', 0, 3, 5, true),

-- CSC Department
('CSC 113', 'Computer Programming II', 4, 4, 5, false),
('CSC 212', 'Data Structures', 5, 3, 5, false),
('CSC 220', 'Computer Organization', 5, 3, 5, false),
('CSC 227', 'Operating Systems', 6, 3, 5, false),
('CSC 215', 'Procedural Language', 0, 3, 5, true),
('CSC 311', 'Algorithms', 0, 3, 5, true),
('CSC 361', 'Artificial Intelligence', 0, 3, 5, true),
('CSC 476', 'Computer Graphics', 0, 3, 5, true),
('CSC 478', 'Digital Image Processing', 0, 3, 5, true),

-- PHYS Department
('PHYS 104', 'General Physics II', 4, 4, 6, false),
('PHYS 201', 'Mathematical Physics I', 0, 3, 5, true),
('GPH 201', 'Principles of Geophysics', 0, 3, 5, true),

-- CEN Department
('CEN 303', 'Computer Communications and Networks', 4, 3, 5, false),
('CEN 316', 'Computer Architecture', 0, 3, 5, true),
('CEN 445', 'Network Protocols & Algorithms', 0, 3, 5, true),
('CEN 318', 'Embedded Systems Design', 0, 3, 5, true),

-- IS Department
('IS 230', 'Introduction to Database Systems', 6, 3, 5, false),
('IS 385', 'Enterprise Resource Planning Systems', 0, 3, 5, true),
('IS 485', 'ERP Systems Lab', 0, 3, 5, true),

-- IC Department
('IC 100', 'Studies in the Prophet Biography', 0, 2, 2, true),
('IC 101', 'Principles of Islamic Culture', 0, 2, 2, true),
('IC 102', 'Family in Islam', 0, 2, 2, true),
('IC 103', 'Economic System in Islam', 0, 2, 2, true),
('IC 104', 'Islamic Political System', 0, 2, 2, true),
('IC 105', 'Human Rights', 0, 2, 2, true),
('IC 106', 'Medical Jurisprudence', 0, 2, 2, true),
('IC 107', 'Professional Ethics', 7, 2, 2, false),
('IC 108', 'Contemporary Issues', 8, 2, 2, false),
('QURN 100', 'The Holy Quran', 0, 2, 2, true),

-- OPER Department
('OPER 122', 'Introduction to Operations Research', 0, 3, 5, true),

-- BIOL Department
('BIOL 145', 'Biology', 0, 3, 5, true),
('MIC 140', 'General Microbiology', 0, 3, 5, true),

-- BCH Department
('BCH 101', 'General Biochemistry', 0, 4, 6, true)

ON CONFLICT (code) DO UPDATE SET
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  credits = EXCLUDED.credits,
  weekly_hours = EXCLUDED.weekly_hours,
  is_elective = EXCLUDED.is_elective;

-- ============================================================================
-- INSTRUCTORS
-- ============================================================================

INSERT INTO instructor (id, name, email, max_load_per_week, preferred_times, unavailable_times) VALUES
-- MATH Department
(gen_random_uuid(), 'Dr. Ahmed Al-Zahrani', 'azahrani@university.edu', 12, '[]', '[]'),
(gen_random_uuid(), 'Dr. Noura Al-Shehri', 'nshehri@university.edu', 12, '[]', '[]'),

-- CSC Department
(gen_random_uuid(), 'Dr. Omar Al-Malki', 'omalki@university.edu', 12, '[]', '[]'),
(gen_random_uuid(), 'Dr. Reem Al-Anazi', 'ranazi@university.edu', 12, '[]', '[]'),
(gen_random_uuid(), 'Dr. Yasir Al-Subhi', 'ysubhi@university.edu', 12, '[]', '[]'),
(gen_random_uuid(), 'Dr. Tariq Al-Juaid', 'tjuaid@university.edu', 12, '[]', '[]'),
(gen_random_uuid(), 'Dr. Laila Al-Subaie', 'lsubaie@university.edu', 12, '[]', '[]'),
(gen_random_uuid(), 'Dr. Sami Al-Otaibi', 'sotaibi@university.edu', 12, '[]', '[]'),
(gen_random_uuid(), 'Dr. Nadia Al-Fayez', 'nfayez@university.edu', 12, '[]', '[]'),
(gen_random_uuid(), 'Dr. Mansour Al-Harbi', 'mharbi@university.edu', 12, '[]', '[]'),
(gen_random_uuid(), 'Dr. Majid Al-Shammari', 'mshammari@university.edu', 12, '[]', '[]'),

-- PHYS Department
(gen_random_uuid(), 'Dr. Saad Al-Zahrani', 'szahrani@university.edu', 12, '[]', '[]'),
(gen_random_uuid(), 'Dr. Hassan Al-Najjar', 'hnajjar@university.edu', 12, '[]', '[]'),
(gen_random_uuid(), 'Dr. Ziyad Al-Malki', 'zmalki@university.edu', 12, '[]', '[]'),

-- CEN Department
(gen_random_uuid(), 'Dr. Faisal Al-Juhani', 'fjuhani@university.edu', 12, '[]', '[]'),
(gen_random_uuid(), 'Dr. Walid Al-Otaibi', 'wotaibi@university.edu', 12, '[]', '[]'),
(gen_random_uuid(), 'Dr. Aisha Al-Mutlaq', 'amutlaq@university.edu', 12, '[]', '[]'),
(gen_random_uuid(), 'Dr. Badr Al-Turki', 'bturki@university.edu', 12, '[]', '[]'),

-- IS Department
(gen_random_uuid(), 'Dr. Amjad Al-Khaldi', 'akhaldi@university.edu', 12, '[]', '[]'),
(gen_random_uuid(), 'Dr. Youssef Al-Salem', 'ysalem@university.edu', 12, '[]', '[]'),
(gen_random_uuid(), 'Dr. Lubna Al-Ajmi', 'lajmi@university.edu', 12, '[]', '[]'),

-- IC Department
(gen_random_uuid(), 'Dr. Saleh Al-Qahtani', 'sqahtani@university.edu', 12, '[]', '[]'),
(gen_random_uuid(), 'Dr. Fahad Al-Shehri', 'fshehri@university.edu', 12, '[]', '[]'),
(gen_random_uuid(), 'Dr. Samir Al-Zahrani', 'szahrani2@university.edu', 12, '[]', '[]'),
(gen_random_uuid(), 'Dr. Adel Al-Mutairi', 'amutairi@university.edu', 12, '[]', '[]'),
(gen_random_uuid(), 'Dr. Turki Al-Ghamdi', 'tghamdi@university.edu', 12, '[]', '[]'),
(gen_random_uuid(), 'Dr. Osama Al-Shammari', 'oshammari@university.edu', 12, '[]', '[]'),
(gen_random_uuid(), 'Dr. Nasser Al-Dosari', 'ndosari@university.edu', 12, '[]', '[]'),
(gen_random_uuid(), 'Dr. Mazen Al-Shahrani', 'mshahrani@university.edu', 12, '[]', '[]'),
(gen_random_uuid(), 'Dr. Jaber Al-Otaibi', 'jotaibi@university.edu', 12, '[]', '[]'),
(gen_random_uuid(), 'Dr. Abdulaziz Al-Subaie', 'asubaie@university.edu', 12, '[]', '[]'),

-- OPER Department
(gen_random_uuid(), 'Dr. Rashed Al-Harbi', 'rharbi@university.edu', 12, '[]', '[]'),

-- BIOL Department
(gen_random_uuid(), 'Dr. Amal Al-Sulaiman', 'asulaiman@university.edu', 12, '[]', '[]'),
(gen_random_uuid(), 'Dr. Mona Al-Zahrani', 'mzahrani@university.edu', 12, '[]', '[]'),

-- BCH Department
(gen_random_uuid(), 'Dr. Sulaiman Al-Fayez', 'sfayez@university.edu', 12, '[]', '[]')

ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  max_load_per_week = EXCLUDED.max_load_per_week;

-- ============================================================================
-- ROOMS
-- ============================================================================

INSERT INTO room (code, type, capacity) VALUES
-- MATH Department Rooms
('MATH-201', 'lecture', 50),
('MATH-202', 'lecture', 50),
('MATH-305', 'lecture', 50),
('MATH-306', 'lecture', 50),

-- CSC Department Rooms
('CSC-113-LEC-01', 'lecture', 50),
('CSC-113-TUT-01', 'lecture', 50),
('CSC-113-LAB-01', 'lab', 30),
('CS-301', 'lecture', 50),
('CS-302', 'lecture', 50),
('CS-303', 'lecture', 50),
('CS-304', 'lecture', 50),
('CS-305', 'lecture', 50),
('CS-306', 'lecture', 50),
('CS-401', 'lecture', 50),
('CS-402', 'lecture', 50),
('CS-403', 'lecture', 50),
('CS-404', 'lecture', 50),
('CS-LAB-301', 'lab', 30),
('CS-LAB-302', 'lab', 30),
('CS-LAB-401', 'lab', 30),
('CS-LAB-402', 'lab', 30),

-- PHYS Department Rooms
('PHYS-201', 'lecture', 50),
('PHYS-LAB-201', 'lab', 30),
('PHYS-301', 'lecture', 50),
('PHYS-302', 'lecture', 50),
('GPH-201', 'lecture', 50),
('GPH-202', 'lecture', 50),

-- CEN Department Rooms
('CEN-201', 'lecture', 50),
('CEN-202', 'lecture', 50),
('CEN-301', 'lecture', 50),
('CEN-302', 'lecture', 50),
('CEN-401', 'lecture', 50),
('CEN-402', 'lecture', 50),
('CEN-LAB-101', 'lab', 30),
('CEN-LAB-102', 'lab', 30),

-- IS Department Rooms
('IS-201', 'lecture', 50),
('IS-202', 'lecture', 50),
('IS-301', 'lecture', 50),
('IS-302', 'lecture', 50),
('IS-LAB-101', 'lab', 30),
('IS-LAB-102', 'lab', 30),

-- IC Department Rooms
('IC-101', 'lecture', 50),
('IC-201', 'lecture', 50),
('IC-301', 'lecture', 50),
('IC-401', 'lecture', 50),
('IC-501', 'lecture', 50),
('IC-601', 'lecture', 50),
('IC-701', 'lecture', 50),
('IC-801', 'lecture', 50),
('IC-901', 'lecture', 50),
('QURN-101', 'lecture', 50),

-- OPER Department Rooms
('OPER-201', 'lecture', 50),
('OPER-202', 'lecture', 50),

-- BIOL Department Rooms
('BIOL-201', 'lecture', 50),
('BIOL-LAB-101', 'lab', 30),
('MIC-201', 'lecture', 50),
('MIC-LAB-101', 'lab', 30),

-- BCH Department Rooms
('BCH-201', 'lecture', 50),
('BCH-LAB-101', 'lab', 30),

-- Exam Rooms
('EXAM-D101', 'exam', 100),
('EXAM-D102', 'exam', 100),
('EXAM-F101', 'exam', 100),
('EXAM-I101', 'exam', 100),
('EXAM-I102', 'exam', 100),
('EXAM-J101', 'exam', 100),
('EXAM-J102', 'exam', 100),
('EXAM-K101', 'exam', 100),
('EXAM-K102', 'exam', 100),
('EXAM-L101', 'exam', 100),
('EXAM-M101', 'exam', 100),
('EXAM-N101', 'exam', 100),
('EXAM-N102', 'exam', 100),
('EXAM-O101', 'exam', 100),
('EXAM-P101', 'exam', 100),
('EXAM-Q101', 'exam', 100),
('EXAM-T101', 'exam', 100),
('EXAM-T102', 'exam', 100),
('EXAM-U101', 'exam', 100),
('EXAM-V101', 'exam', 100),
('EXAM-V102', 'exam', 100),
('EXAM-W101', 'exam', 100),
('EXAM-X101', 'exam', 100),
('EXAM-Y101', 'exam', 100),
('EXAM-Z101', 'exam', 100),
('EXAM-Z102', 'exam', 100),
('EXAM-AA101', 'exam', 100),
('EXAM-AB101', 'exam', 100),
('EXAM-AC101', 'exam', 100),
('EXAM-AC102', 'exam', 100),
('EXAM-AC103', 'exam', 100),
('EXAM-AE101', 'exam', 100),
('EXAM-AE102', 'exam', 100),
('EXAM-AF101', 'exam', 100),
('EXAM-AF102', 'exam', 100),
('EXAM-AG101', 'exam', 100),
('EXAM-AH101', 'exam', 100),
('EXAM-AI101', 'exam', 100),
('EXAM-AJ101', 'exam', 100),
('EXAM-AK101', 'exam', 100),
('EXAM-AL101', 'exam', 100),
('EXAM-AM101', 'exam', 100),
('EXAM-AO101', 'exam', 100),
('EXAM-AP101', 'exam', 100),
('EXAM-AP102', 'exam', 100),
('EXAM-AQ101', 'exam', 100),
('EXAM-AR101', 'exam', 100),
('EXAM-AS101', 'exam', 100)

ON CONFLICT (code) DO UPDATE SET
  type = EXCLUDED.type,
  capacity = EXCLUDED.capacity;

-- ============================================================================
-- SECTIONS
-- Note: Sections will use instructor IDs from the instructor table
-- We'll need to fetch the IDs after insertion. For this seed file,
-- we'll create sections without instructor assignments and let the
-- TypeScript seeder handle the instructor mapping, or manually update later.
-- ============================================================================

-- For a complete section seeding with instructor assignments,
-- you should use the TypeScript seeder: pnpm db:seed:external

-- ============================================================================
-- STUDENT GROUPS
-- ============================================================================

INSERT INTO student_group (level, size, name) VALUES
(1, 0, 'Level 1'),
(2, 0, 'Level 2'),
(3, 0, 'Level 3'),
(4, 0, 'Level 4'),
(5, 0, 'Level 5'),
(6, 0, 'Level 6'),
(7, 0, 'Level 7'),
(8, 0, 'Level 8')

ON CONFLICT DO NOTHING;

-- ============================================================================
-- EXAMS
-- Note: These are sample exams from Spring 2026 semester
-- ============================================================================

-- MATH 244 Exams
INSERT INTO exam (course_code, date, start_time, duration_minutes, room_codes) VALUES
('MATH 244', '2026-03-17', '13:00', 120, ARRAY['EXAM-D101', 'EXAM-D102']),
('MATH 244', '2026-04-22', '13:00', 120, ARRAY['EXAM-D101', 'EXAM-D102']),
('MATH 244', '2026-05-27', '13:00', 180, ARRAY['EXAM-D101', 'EXAM-D102']);

-- MATH 254 Exams
INSERT INTO exam (course_code, date, start_time, duration_minutes, room_codes) VALUES
('MATH 254', '2026-03-19', '13:00', 120, ARRAY['EXAM-F101']),
('MATH 254', '2026-04-24', '13:00', 120, ARRAY['EXAM-F101']),
('MATH 254', '2026-05-29', '13:00', 180, ARRAY['EXAM-F101']);

-- CSC 113 Exams
INSERT INTO exam (course_code, date, start_time, duration_minutes, room_codes) VALUES
('CSC 113', '2026-03-21', '09:00', 120, ARRAY['EXAM-I101', 'EXAM-I102']),
('CSC 113', '2026-04-26', '09:00', 120, ARRAY['EXAM-I101', 'EXAM-I102']),
('CSC 113', '2026-05-31', '13:00', 180, ARRAY['EXAM-I101', 'EXAM-I102']);

-- CSC 212 Exams
INSERT INTO exam (course_code, date, start_time, duration_minutes, room_codes) VALUES
('CSC 212', '2026-03-22', '13:00', 120, ARRAY['EXAM-J101', 'EXAM-J102']),
('CSC 212', '2026-04-27', '13:00', 120, ARRAY['EXAM-J101', 'EXAM-J102']),
('CSC 212', '2026-06-01', '09:00', 180, ARRAY['EXAM-J101', 'EXAM-J102']);

-- CSC 220 Exams
INSERT INTO exam (course_code, date, start_time, duration_minutes, room_codes) VALUES
('CSC 220', '2026-03-23', '09:00', 120, ARRAY['EXAM-K101']),
('CSC 220', '2026-04-28', '09:00', 120, ARRAY['EXAM-K101']),
('CSC 220', '2026-06-02', '13:00', 180, ARRAY['EXAM-K101', 'EXAM-K102']);

-- CSC 227 Exams
INSERT INTO exam (course_code, date, start_time, duration_minutes, room_codes) VALUES
('CSC 227', '2026-03-24', '13:00', 120, ARRAY['EXAM-L101']),
('CSC 227', '2026-04-29', '13:00', 120, ARRAY['EXAM-L101']),
('CSC 227', '2026-06-03', '09:00', 180, ARRAY['EXAM-L101']);

-- CSC 215 Exams
INSERT INTO exam (course_code, date, start_time, duration_minutes, room_codes) VALUES
('CSC 215', '2026-03-25', '09:00', 120, ARRAY['EXAM-M101']),
('CSC 215', '2026-04-30', '09:00', 120, ARRAY['EXAM-M101']),
('CSC 215', '2026-06-04', '13:00', 180, ARRAY['EXAM-M101']);

-- CSC 311 Exams
INSERT INTO exam (course_code, date, start_time, duration_minutes, room_codes) VALUES
('CSC 311', '2026-03-26', '13:00', 120, ARRAY['EXAM-N101', 'EXAM-N102']),
('CSC 311', '2026-05-01', '13:00', 120, ARRAY['EXAM-N101', 'EXAM-N102']),
('CSC 311', '2026-06-05', '09:00', 180, ARRAY['EXAM-N101', 'EXAM-N102']);

-- CSC 361 Exams
INSERT INTO exam (course_code, date, start_time, duration_minutes, room_codes) VALUES
('CSC 361', '2026-03-27', '09:00', 120, ARRAY['EXAM-O101']),
('CSC 361', '2026-05-02', '09:00', 120, ARRAY['EXAM-O101']),
('CSC 361', '2026-06-06', '13:00', 180, ARRAY['EXAM-O101']);

-- CSC 476 Exams
INSERT INTO exam (course_code, date, start_time, duration_minutes, room_codes) VALUES
('CSC 476', '2026-03-28', '13:00', 120, ARRAY['EXAM-P101']),
('CSC 476', '2026-05-03', '13:00', 120, ARRAY['EXAM-P101']),
('CSC 476', '2026-06-07', '09:00', 180, ARRAY['EXAM-P101']);

-- CSC 478 Exams
INSERT INTO exam (course_code, date, start_time, duration_minutes, room_codes) VALUES
('CSC 478', '2026-03-29', '09:00', 120, ARRAY['EXAM-Q101']),
('CSC 478', '2026-05-04', '09:00', 120, ARRAY['EXAM-Q101']),
('CSC 478', '2026-06-08', '13:00', 180, ARRAY['EXAM-Q101']);

-- PHYS 104 Exams
INSERT INTO exam (course_code, date, start_time, duration_minutes, room_codes) VALUES
('PHYS 104', '2026-03-31', '13:00', 120, ARRAY['EXAM-T101', 'EXAM-T102']),
('PHYS 104', '2026-05-06', '13:00', 120, ARRAY['EXAM-T101', 'EXAM-T102']),
('PHYS 104', '2026-06-10', '13:00', 180, ARRAY['EXAM-T101', 'EXAM-T102']);

-- PHYS 201 Exams
INSERT INTO exam (course_code, date, start_time, duration_minutes, room_codes) VALUES
('PHYS 201', '2026-04-01', '09:00', 120, ARRAY['EXAM-U101']),
('PHYS 201', '2026-05-07', '09:00', 120, ARRAY['EXAM-U101']),
('PHYS 201', '2026-06-11', '09:00', 180, ARRAY['EXAM-U101']);

-- GPH 201 Exams
INSERT INTO exam (course_code, date, start_time, duration_minutes, room_codes) VALUES
('GPH 201', '2026-04-23', '09:00', 120, ARRAY['EXAM-AS101']),
('GPH 201', '2026-05-19', '09:00', 120, ARRAY['EXAM-AS101']),
('GPH 201', '2026-07-03', '09:00', 180, ARRAY['EXAM-AS101']);

-- CEN 303 Exams
INSERT INTO exam (course_code, date, start_time, duration_minutes, room_codes) VALUES
('CEN 303', '2026-04-02', '13:00', 120, ARRAY['EXAM-V101']),
('CEN 303', '2026-05-08', '13:00', 120, ARRAY['EXAM-V101']),
('CEN 303', '2026-06-12', '13:00', 180, ARRAY['EXAM-V101', 'EXAM-V102']);

-- CEN 316 Exams
INSERT INTO exam (course_code, date, start_time, duration_minutes, room_codes) VALUES
('CEN 316', '2026-04-03', '09:00', 120, ARRAY['EXAM-W101']),
('CEN 316', '2026-05-09', '09:00', 120, ARRAY['EXAM-W101']),
('CEN 316', '2026-06-13', '09:00', 180, ARRAY['EXAM-W101']);

-- CEN 445 Exams
INSERT INTO exam (course_code, date, start_time, duration_minutes, room_codes) VALUES
('CEN 445', '2026-04-04', '13:00', 120, ARRAY['EXAM-X101']),
('CEN 445', '2026-05-10', '13:00', 120, ARRAY['EXAM-X101']),
('CEN 445', '2026-06-14', '13:00', 180, ARRAY['EXAM-X101']);

-- CEN 318 Exams
INSERT INTO exam (course_code, date, start_time, duration_minutes, room_codes) VALUES
('CEN 318', '2026-04-05', '09:00', 120, ARRAY['EXAM-Y101']),
('CEN 318', '2026-05-11', '09:00', 120, ARRAY['EXAM-Y101']),
('CEN 318', '2026-06-15', '09:00', 180, ARRAY['EXAM-Y101']);

-- IS 230 Exams
INSERT INTO exam (course_code, date, start_time, duration_minutes, room_codes) VALUES
('IS 230', '2026-04-06', '09:00', 120, ARRAY['EXAM-Z101']),
('IS 230', '2026-05-12', '09:00', 120, ARRAY['EXAM-Z101']),
('IS 230', '2026-06-16', '09:00', 180, ARRAY['EXAM-Z101', 'EXAM-Z102']);

-- IS 385 Exams
INSERT INTO exam (course_code, date, start_time, duration_minutes, room_codes) VALUES
('IS 385', '2026-04-07', '13:00', 120, ARRAY['EXAM-AA101']),
('IS 385', '2026-05-13', '13:00', 120, ARRAY['EXAM-AA101']),
('IS 385', '2026-06-17', '13:00', 180, ARRAY['EXAM-AA101']);

-- IS 485 Exams
INSERT INTO exam (course_code, date, start_time, duration_minutes, room_codes) VALUES
('IS 485', '2026-04-08', '09:00', 120, ARRAY['EXAM-AB101']),
('IS 485', '2026-05-14', '09:00', 120, ARRAY['EXAM-AB101']),
('IS 485', '2026-06-18', '09:00', 180, ARRAY['EXAM-AB101']);

-- IC Course Exams
INSERT INTO exam (course_code, date, start_time, duration_minutes, room_codes) VALUES
('IC 100', '2026-04-09', '09:00', 90, ARRAY['EXAM-AC101', 'EXAM-AC102']),
('IC 100', '2026-06-19', '09:00', 120, ARRAY['EXAM-AC101', 'EXAM-AC102', 'EXAM-AC103']),
('IC 101', '2026-04-10', '13:00', 90, ARRAY['EXAM-AE101', 'EXAM-AE102']),
('IC 101', '2026-06-20', '13:00', 120, ARRAY['EXAM-AE101', 'EXAM-AE102']),
('IC 102', '2026-04-11', '09:00', 90, ARRAY['EXAM-AF101']),
('IC 102', '2026-06-21', '09:00', 120, ARRAY['EXAM-AF101', 'EXAM-AF102']),
('IC 103', '2026-04-12', '13:00', 90, ARRAY['EXAM-AG101']),
('IC 103', '2026-06-22', '13:00', 120, ARRAY['EXAM-AG101']),
('IC 104', '2026-04-13', '09:00', 90, ARRAY['EXAM-AH101']),
('IC 104', '2026-06-23', '09:00', 120, ARRAY['EXAM-AH101']),
('IC 105', '2026-04-14', '13:00', 90, ARRAY['EXAM-AI101']),
('IC 105', '2026-06-24', '13:00', 120, ARRAY['EXAM-AI101']),
('IC 106', '2026-04-15', '09:00', 90, ARRAY['EXAM-AJ101']),
('IC 106', '2026-06-25', '09:00', 120, ARRAY['EXAM-AJ101']),
('IC 107', '2026-04-16', '13:00', 90, ARRAY['EXAM-AK101']),
('IC 107', '2026-06-26', '13:00', 120, ARRAY['EXAM-AK101']),
('IC 108', '2026-04-17', '09:00', 90, ARRAY['EXAM-AL101']),
('IC 108', '2026-06-27', '09:00', 120, ARRAY['EXAM-AL101']),
('QURN 100', '2026-04-18', '13:00', 90, ARRAY['EXAM-AM101']),
('QURN 100', '2026-06-28', '13:00', 120, ARRAY['EXAM-AM101']);

-- OPER 122 Exams
INSERT INTO exam (course_code, date, start_time, duration_minutes, room_codes) VALUES
('OPER 122', '2026-04-19', '09:00', 120, ARRAY['EXAM-AO101']),
('OPER 122', '2026-05-15', '09:00', 120, ARRAY['EXAM-AO101']),
('OPER 122', '2026-06-29', '09:00', 180, ARRAY['EXAM-AO101']);

-- BIOL 145 Exams
INSERT INTO exam (course_code, date, start_time, duration_minutes, room_codes) VALUES
('BIOL 145', '2026-04-20', '13:00', 120, ARRAY['EXAM-AP101']),
('BIOL 145', '2026-05-16', '13:00', 120, ARRAY['EXAM-AP101']),
('BIOL 145', '2026-06-30', '13:00', 180, ARRAY['EXAM-AP101', 'EXAM-AP102']);

-- MIC 140 Exams
INSERT INTO exam (course_code, date, start_time, duration_minutes, room_codes) VALUES
('MIC 140', '2026-04-22', '13:00', 120, ARRAY['EXAM-AR101']),
('MIC 140', '2026-05-18', '13:00', 120, ARRAY['EXAM-AR101']),
('MIC 140', '2026-07-02', '13:00', 180, ARRAY['EXAM-AR101']);

-- BCH 101 Exams
INSERT INTO exam (course_code, date, start_time, duration_minutes, room_codes) VALUES
('BCH 101', '2026-04-21', '09:00', 120, ARRAY['EXAM-AQ101']),
('BCH 101', '2026-05-17', '09:00', 120, ARRAY['EXAM-AQ101']),
('BCH 101', '2026-07-01', '09:00', 180, ARRAY['EXAM-AQ101'])

ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
DECLARE
  course_count INTEGER;
  instructor_count INTEGER;
  room_count INTEGER;
  exam_count INTEGER;
  group_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO course_count FROM course;
  SELECT COUNT(*) INTO instructor_count FROM instructor;
  SELECT COUNT(*) INTO room_count FROM room;
  SELECT COUNT(*) INTO exam_count FROM exam;
  SELECT COUNT(*) INTO group_count FROM student_group;
  
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Seed data import completed successfully!';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Courses: %', course_count;
  RAISE NOTICE 'Instructors: %', instructor_count;
  RAISE NOTICE 'Rooms: %', room_count;
  RAISE NOTICE 'Exams: %', exam_count;
  RAISE NOTICE 'Student Groups: %', group_count;
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Use the TypeScript seeder for sections: pnpm db:seed:external';
  RAISE NOTICE '  2. Or manually create sections via the dashboard';
  RAISE NOTICE '  3. Review and update section states when ready';
  RAISE NOTICE '============================================================================';
END $$;

