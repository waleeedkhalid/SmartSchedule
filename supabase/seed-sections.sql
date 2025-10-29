-- ============================================================================
-- SECTIONS SEED DATA
-- ============================================================================
-- This file seeds all sections from external_departments_courses_sections.json
-- with proper instructor and room assignments
-- ============================================================================

-- MATH 244 - Linear Algebra (Level 4)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'MATH 244',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'azahrani@university.edu'),
  'MATH-201',
  45,
  4,
  jsonb_build_object(
    'days', ARRAY['sunday', 'tuesday'],
    'start_time', '09:00',
    'duration_minutes', 90
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'MATH 244' AND section_no = '01L');

INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'MATH 244',
  '01T',
  'tutorial',
  (SELECT id FROM instructor WHERE email = 'azahrani@university.edu'),
  'MATH-202',
  45,
  4,
  jsonb_build_object(
    'days', ARRAY['thursday'],
    'start_time', '09:00',
    'duration_minutes', 60
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'MATH 244' AND section_no = '01T');

-- MATH 254 - Numerical Analysis (Elective)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'MATH 254',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'nshehri@university.edu'),
  'MATH-305',
  30,
  5,
  jsonb_build_object(
    'days', ARRAY['sunday', 'tuesday'],
    'start_time', '10:00',
    'duration_minutes', 90
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'MATH 254' AND section_no = '01L');

INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'MATH 254',
  '01T',
  'tutorial',
  (SELECT id FROM instructor WHERE email = 'nshehri@university.edu'),
  'MATH-306',
  30,
  5,
  jsonb_build_object(
    'days', ARRAY['thursday'],
    'start_time', '10:00',
    'duration_minutes', 60
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'MATH 254' AND section_no = '01T');

-- CSC 113 - Computer Programming II (Level 4)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'CSC 113',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'omalki@university.edu'),
  'CSC-113-LEC-01',
  35,
  4,
  jsonb_build_object(
    'days', ARRAY['sunday', 'tuesday'],
    'start_time', '11:00',
    'duration_minutes', 50
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'CSC 113' AND section_no = '01L');

INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'CSC 113',
  '01T',
  'tutorial',
  (SELECT id FROM instructor WHERE email = 'omalki@university.edu'),
  'CSC-113-TUT-01',
  35,
  4,
  jsonb_build_object(
    'days', ARRAY['thursday'],
    'start_time', '11:00',
    'duration_minutes', 50
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'CSC 113' AND section_no = '01T');

INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'CSC 113',
  '01B',
  'lab',
  (SELECT id FROM instructor WHERE email = 'omalki@university.edu'),
  'CSC-113-LAB-01',
  35,
  4,
  jsonb_build_object(
    'days', ARRAY['thursday'],
    'start_time', '08:00',
    'duration_minutes', 120
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'CSC 113' AND section_no = '01B');

-- CSC 212 - Data Structures (Level 5)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'CSC 212',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'ranazi@university.edu'),
  'CS-301',
  40,
  5,
  jsonb_build_object(
    'days', ARRAY['sunday', 'tuesday'],
    'start_time', '08:00',
    'duration_minutes', 90
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'CSC 212' AND section_no = '01L');

INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'CSC 212',
  '01T',
  'tutorial',
  (SELECT id FROM instructor WHERE email = 'ranazi@university.edu'),
  'CS-302',
  40,
  5,
  jsonb_build_object(
    'days', ARRAY['thursday'],
    'start_time', '08:00',
    'duration_minutes', 60
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'CSC 212' AND section_no = '01T');

-- CSC 220 - Computer Organization (Level 5)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'CSC 220',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'ysubhi@university.edu'),
  'CS-303',
  40,
  5,
  jsonb_build_object(
    'days', ARRAY['sunday', 'tuesday'],
    'start_time', '10:00',
    'duration_minutes', 90
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'CSC 220' AND section_no = '01L');

INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'CSC 220',
  '01T',
  'tutorial',
  (SELECT id FROM instructor WHERE email = 'ysubhi@university.edu'),
  'CS-304',
  40,
  5,
  jsonb_build_object(
    'days', ARRAY['thursday'],
    'start_time', '10:00',
    'duration_minutes', 60
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'CSC 220' AND section_no = '01T');

-- CSC 227 - Operating Systems (Level 6)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'CSC 227',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'tjuaid@university.edu'),
  'CS-401',
  35,
  6,
  jsonb_build_object(
    'days', ARRAY['sunday', 'tuesday'],
    'start_time', '08:00',
    'duration_minutes', 90
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'CSC 227' AND section_no = '01L');

INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'CSC 227',
  '01T',
  'tutorial',
  (SELECT id FROM instructor WHERE email = 'tjuaid@university.edu'),
  'CS-402',
  35,
  6,
  jsonb_build_object(
    'days', ARRAY['thursday'],
    'start_time', '08:00',
    'duration_minutes', 60
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'CSC 227' AND section_no = '01T');

-- CSC 215 - Procedural Language (Elective, Level 4)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'CSC 215',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'lsubaie@university.edu'),
  'CS-LAB-301',
  30,
  4,
  jsonb_build_object(
    'days', ARRAY['sunday', 'tuesday'],
    'start_time', '14:00',
    'duration_minutes', 90
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'CSC 215' AND section_no = '01L');

INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'CSC 215',
  '01T',
  'tutorial',
  (SELECT id FROM instructor WHERE email = 'lsubaie@university.edu'),
  'CS-LAB-302',
  30,
  4,
  jsonb_build_object(
    'days', ARRAY['thursday'],
    'start_time', '14:00',
    'duration_minutes', 60
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'CSC 215' AND section_no = '01T');

-- CSC 311 - Algorithms (Elective, Level 6)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'CSC 311',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'sotaibi@university.edu'),
  'CS-305',
  40,
  6,
  jsonb_build_object(
    'days', ARRAY['sunday', 'tuesday'],
    'start_time', '09:00',
    'duration_minutes', 90
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'CSC 311' AND section_no = '01L');

INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'CSC 311',
  '01T',
  'tutorial',
  (SELECT id FROM instructor WHERE email = 'sotaibi@university.edu'),
  'CS-306',
  40,
  6,
  jsonb_build_object(
    'days', ARRAY['thursday'],
    'start_time', '09:00',
    'duration_minutes', 60
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'CSC 311' AND section_no = '01T');

-- CSC 361 - Artificial Intelligence (Elective, Level 6)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'CSC 361',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'nfayez@university.edu'),
  'CS-402',
  35,
  6,
  jsonb_build_object(
    'days', ARRAY['sunday', 'tuesday'],
    'start_time', '10:00',
    'duration_minutes', 90
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'CSC 361' AND section_no = '01L');

INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'CSC 361',
  '01T',
  'tutorial',
  (SELECT id FROM instructor WHERE email = 'nfayez@university.edu'),
  'CS-403',
  35,
  6,
  jsonb_build_object(
    'days', ARRAY['thursday'],
    'start_time', '10:00',
    'duration_minutes', 60
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'CSC 361' AND section_no = '01T');

-- CSC 476 - Computer Graphics (Elective, Level 6)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'CSC 476',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'mharbi@university.edu'),
  'CS-LAB-401',
  30,
  6,
  jsonb_build_object(
    'days', ARRAY['sunday', 'tuesday'],
    'start_time', '13:00',
    'duration_minutes', 90
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'CSC 476' AND section_no = '01L');

INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'CSC 476',
  '01T',
  'tutorial',
  (SELECT id FROM instructor WHERE email = 'mharbi@university.edu'),
  'CS-LAB-402',
  30,
  6,
  jsonb_build_object(
    'days', ARRAY['thursday'],
    'start_time', '13:00',
    'duration_minutes', 60
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'CSC 476' AND section_no = '01T');

-- CSC 478 - Digital Image Processing (Elective, Level 7)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'CSC 478',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'mshammari@university.edu'),
  'CS-403',
  25,
  7,
  jsonb_build_object(
    'days', ARRAY['sunday', 'tuesday'],
    'start_time', '13:00',
    'duration_minutes', 90
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'CSC 478' AND section_no = '01L');

INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'CSC 478',
  '01T',
  'tutorial',
  (SELECT id FROM instructor WHERE email = 'mshammari@university.edu'),
  'CS-404',
  25,
  7,
  jsonb_build_object(
    'days', ARRAY['thursday'],
    'start_time', '13:00',
    'duration_minutes', 60
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'CSC 478' AND section_no = '01T');

-- PHYS 104 - General Physics II (Level 4)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'PHYS 104',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'szahrani@university.edu'),
  'PHYS-201',
  40,
  4,
  jsonb_build_object(
    'days', ARRAY['sunday', 'tuesday'],
    'start_time', '13:00',
    'duration_minutes', 75
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'PHYS 104' AND section_no = '01L');

INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'PHYS 104',
  '01T',
  'tutorial',
  (SELECT id FROM instructor WHERE email = 'szahrani@university.edu'),
  'PHYS-LAB-201',
  40,
  4,
  jsonb_build_object(
    'days', ARRAY['thursday'],
    'start_time', '13:00',
    'duration_minutes', 120
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'PHYS 104' AND section_no = '01T');

-- PHYS 201 - Mathematical Physics I (Elective, Level 3)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'PHYS 201',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'hnajjar@university.edu'),
  'PHYS-301',
  30,
  3,
  jsonb_build_object(
    'days', ARRAY['sunday', 'tuesday'],
    'start_time', '11:00',
    'duration_minutes', 90
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'PHYS 201' AND section_no = '01L');

INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'PHYS 201',
  '01T',
  'tutorial',
  (SELECT id FROM instructor WHERE email = 'hnajjar@university.edu'),
  'PHYS-302',
  30,
  3,
  jsonb_build_object(
    'days', ARRAY['thursday'],
    'start_time', '11:00',
    'duration_minutes', 60
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'PHYS 201' AND section_no = '01T');

-- GPH 201 - Principles of Geophysics (Elective, Level 3)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'GPH 201',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'zmalki@university.edu'),
  'GPH-201',
  30,
  3,
  jsonb_build_object(
    'days', ARRAY['sunday', 'tuesday'],
    'start_time', '14:00',
    'duration_minutes', 90
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'GPH 201' AND section_no = '01L');

INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'GPH 201',
  '01T',
  'tutorial',
  (SELECT id FROM instructor WHERE email = 'zmalki@university.edu'),
  'GPH-202',
  30,
  3,
  jsonb_build_object(
    'days', ARRAY['thursday'],
    'start_time', '14:00',
    'duration_minutes', 60
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'GPH 201' AND section_no = '01T');

-- CEN 303 - Computer Communications and Networks (Level 4)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'CEN 303',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'fjuhani@university.edu'),
  'CEN-201',
  35,
  4,
  jsonb_build_object(
    'days', ARRAY['sunday', 'tuesday'],
    'start_time', '10:00',
    'duration_minutes', 90
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'CEN 303' AND section_no = '01L');

INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'CEN 303',
  '01T',
  'tutorial',
  (SELECT id FROM instructor WHERE email = 'fjuhani@university.edu'),
  'CEN-202',
  35,
  4,
  jsonb_build_object(
    'days', ARRAY['thursday'],
    'start_time', '10:00',
    'duration_minutes', 60
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'CEN 303' AND section_no = '01T');

-- CEN 316 - Computer Architecture (Elective, Level 6)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'CEN 316',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'wotaibi@university.edu'),
  'CEN-301',
  30,
  6,
  jsonb_build_object(
    'days', ARRAY['sunday', 'tuesday'],
    'start_time', '09:00',
    'duration_minutes', 90
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'CEN 316' AND section_no = '01L');

INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'CEN 316',
  '01T',
  'tutorial',
  (SELECT id FROM instructor WHERE email = 'wotaibi@university.edu'),
  'CEN-302',
  30,
  6,
  jsonb_build_object(
    'days', ARRAY['thursday'],
    'start_time', '09:00',
    'duration_minutes', 60
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'CEN 316' AND section_no = '01T');

-- CEN 445 - Network Protocols & Algorithms (Elective, Level 5)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'CEN 445',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'amutlaq@university.edu'),
  'CEN-401',
  30,
  5,
  jsonb_build_object(
    'days', ARRAY['sunday', 'tuesday'],
    'start_time', '14:00',
    'duration_minutes', 90
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'CEN 445' AND section_no = '01L');

INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'CEN 445',
  '01T',
  'tutorial',
  (SELECT id FROM instructor WHERE email = 'amutlaq@university.edu'),
  'CEN-402',
  30,
  5,
  jsonb_build_object(
    'days', ARRAY['thursday'],
    'start_time', '14:00',
    'duration_minutes', 60
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'CEN 445' AND section_no = '01T');

-- CEN 318 - Embedded Systems Design (Elective, Level 5)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'CEN 318',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'bturki@university.edu'),
  'CEN-LAB-101',
  25,
  5,
  jsonb_build_object(
    'days', ARRAY['sunday', 'tuesday'],
    'start_time', '11:00',
    'duration_minutes', 90
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'CEN 318' AND section_no = '01L');

INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'CEN 318',
  '01T',
  'tutorial',
  (SELECT id FROM instructor WHERE email = 'bturki@university.edu'),
  'CEN-LAB-102',
  25,
  5,
  jsonb_build_object(
    'days', ARRAY['thursday'],
    'start_time', '11:00',
    'duration_minutes', 60
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'CEN 318' AND section_no = '01T');

-- IS 230 - Introduction to Database Systems (Level 6)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'IS 230',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'akhaldi@university.edu'),
  'IS-201',
  35,
  6,
  jsonb_build_object(
    'days', ARRAY['sunday', 'tuesday'],
    'start_time', '11:00',
    'duration_minutes', 90
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'IS 230' AND section_no = '01L');

INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'IS 230',
  '01T',
  'tutorial',
  (SELECT id FROM instructor WHERE email = 'akhaldi@university.edu'),
  'IS-202',
  35,
  6,
  jsonb_build_object(
    'days', ARRAY['thursday'],
    'start_time', '11:00',
    'duration_minutes', 60
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'IS 230' AND section_no = '01T');

-- IS 385 - Enterprise Resource Planning Systems (Elective, Level 7)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'IS 385',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'ysalem@university.edu'),
  'IS-301',
  30,
  7,
  jsonb_build_object(
    'days', ARRAY['sunday', 'tuesday'],
    'start_time', '13:00',
    'duration_minutes', 90
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'IS 385' AND section_no = '01L');

INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'IS 385',
  '01T',
  'tutorial',
  (SELECT id FROM instructor WHERE email = 'ysalem@university.edu'),
  'IS-302',
  30,
  7,
  jsonb_build_object(
    'days', ARRAY['thursday'],
    'start_time', '13:00',
    'duration_minutes', 60
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'IS 385' AND section_no = '01T');

-- IS 485 - ERP Systems Lab (Elective, Level 8)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'IS 485',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'lajmi@university.edu'),
  'IS-LAB-101',
  25,
  8,
  jsonb_build_object(
    'days', ARRAY['sunday', 'tuesday'],
    'start_time', '15:00',
    'duration_minutes', 90
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'IS 485' AND section_no = '01L');

INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'IS 485',
  '01T',
  'tutorial',
  (SELECT id FROM instructor WHERE email = 'lajmi@university.edu'),
  'IS-LAB-102',
  25,
  8,
  jsonb_build_object(
    'days', ARRAY['thursday'],
    'start_time', '15:00',
    'duration_minutes', 60
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'IS 485' AND section_no = '01T');

-- IC 100 - Studies in the Prophet Biography (Elective, Level 1)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'IC 100',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'sqahtani@university.edu'),
  'IC-101',
  50,
  1,
  jsonb_build_object(
    'days', ARRAY['sunday', 'tuesday'],
    'start_time', '08:00',
    'duration_minutes', 50
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'IC 100' AND section_no = '01L');

-- IC 101 - Principles of Islamic Culture (Elective, Level 1)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'IC 101',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'fshehri@university.edu'),
  'IC-201',
  50,
  1,
  jsonb_build_object(
    'days', ARRAY['monday', 'wednesday'],
    'start_time', '08:00',
    'duration_minutes', 50
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'IC 101' AND section_no = '01L');

-- IC 102 - Family in Islam (Elective, Level 1)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'IC 102',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'szahrani2@university.edu'),
  'IC-301',
  50,
  1,
  jsonb_build_object(
    'days', ARRAY['sunday', 'tuesday'],
    'start_time', '12:00',
    'duration_minutes', 50
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'IC 102' AND section_no = '01L');

-- IC 103 - Economic System in Islam (Elective, Level 1)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'IC 103',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'amutairi@university.edu'),
  'IC-401',
  45,
  1,
  jsonb_build_object(
    'days', ARRAY['monday', 'wednesday'],
    'start_time', '14:00',
    'duration_minutes', 50
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'IC 103' AND section_no = '01L');

-- IC 104 - Islamic Political System (Elective, Level 1)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'IC 104',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'tghamdi@university.edu'),
  'IC-501',
  45,
  1,
  jsonb_build_object(
    'days', ARRAY['sunday', 'tuesday'],
    'start_time', '14:00',
    'duration_minutes', 50
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'IC 104' AND section_no = '01L');

-- IC 105 - Human Rights (Elective, Level 1)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'IC 105',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'oshammari@university.edu'),
  'IC-601',
  50,
  1,
  jsonb_build_object(
    'days', ARRAY['monday', 'wednesday'],
    'start_time', '10:00',
    'duration_minutes', 50
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'IC 105' AND section_no = '01L');

-- IC 106 - Medical Jurisprudence (Elective, Level 1)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'IC 106',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'ndosari@university.edu'),
  'IC-701',
  40,
  1,
  jsonb_build_object(
    'days', ARRAY['sunday', 'tuesday'],
    'start_time', '15:00',
    'duration_minutes', 50
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'IC 106' AND section_no = '01L');

-- IC 107 - Professional Ethics (Level 7)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'IC 107',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'mshahrani@university.edu'),
  'IC-801',
  40,
  7,
  jsonb_build_object(
    'days', ARRAY['monday', 'wednesday'],
    'start_time', '11:00',
    'duration_minutes', 50
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'IC 107' AND section_no = '01L');

-- IC 108 - Contemporary Issues (Level 8)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'IC 108',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'jotaibi@university.edu'),
  'IC-901',
  40,
  8,
  jsonb_build_object(
    'days', ARRAY['sunday', 'tuesday'],
    'start_time', '09:00',
    'duration_minutes', 50
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'IC 108' AND section_no = '01L');

-- QURN 100 - The Holy Quran (Elective, Level 1)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'QURN 100',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'asubaie@university.edu'),
  'QURN-101',
  35,
  1,
  jsonb_build_object(
    'days', ARRAY['sunday', 'tuesday'],
    'start_time', '13:00',
    'duration_minutes', 50
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'QURN 100' AND section_no = '01L');

-- OPER 122 - Introduction to Operations Research (Elective, Level 3)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'OPER 122',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'rharbi@university.edu'),
  'OPER-201',
  35,
  3,
  jsonb_build_object(
    'days', ARRAY['sunday', 'tuesday'],
    'start_time', '12:00',
    'duration_minutes', 90
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'OPER 122' AND section_no = '01L');

INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'OPER 122',
  '01T',
  'tutorial',
  (SELECT id FROM instructor WHERE email = 'rharbi@university.edu'),
  'OPER-202',
  35,
  3,
  jsonb_build_object(
    'days', ARRAY['thursday'],
    'start_time', '12:00',
    'duration_minutes', 60
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'OPER 122' AND section_no = '01T');

-- BIOL 145 - Biology (Elective, Level 2)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'BIOL 145',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'asulaiman@university.edu'),
  'BIOL-201',
  40,
  2,
  jsonb_build_object(
    'days', ARRAY['sunday', 'tuesday'],
    'start_time', '10:00',
    'duration_minutes', 90
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'BIOL 145' AND section_no = '01L');

INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'BIOL 145',
  '01T',
  'tutorial',
  (SELECT id FROM instructor WHERE email = 'asulaiman@university.edu'),
  'BIOL-LAB-101',
  40,
  2,
  jsonb_build_object(
    'days', ARRAY['thursday'],
    'start_time', '10:00',
    'duration_minutes', 60
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'BIOL 145' AND section_no = '01T');

-- MIC 140 - General Microbiology (Elective, Level 2)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'MIC 140',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'mzahrani@university.edu'),
  'MIC-201',
  30,
  2,
  jsonb_build_object(
    'days', ARRAY['sunday', 'tuesday'],
    'start_time', '08:00',
    'duration_minutes', 90
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'MIC 140' AND section_no = '01L');

INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'MIC 140',
  '01T',
  'tutorial',
  (SELECT id FROM instructor WHERE email = 'mzahrani@university.edu'),
  'MIC-LAB-101',
  30,
  2,
  jsonb_build_object(
    'days', ARRAY['thursday'],
    'start_time', '08:00',
    'duration_minutes', 60
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'MIC 140' AND section_no = '01T');

-- BCH 101 - General Biochemistry (Elective, Level 2)
INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'BCH 101',
  '01L',
  'lecture',
  (SELECT id FROM instructor WHERE email = 'sfayez@university.edu'),
  'BCH-201',
  35,
  2,
  jsonb_build_object(
    'days', ARRAY['sunday', 'tuesday'],
    'start_time', '14:00',
    'duration_minutes', 75
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'BCH 101' AND section_no = '01L');

INSERT INTO section (course_code, section_no, activity, instructor_id, room_code, capacity, group_level, meeting_pattern, state)
SELECT 
  'BCH 101',
  '01B',
  'lab',
  (SELECT id FROM instructor WHERE email = 'sfayez@university.edu'),
  'BCH-LAB-101',
  35,
  2,
  jsonb_build_object(
    'days', ARRAY['thursday'],
    'start_time', '14:00',
    'duration_minutes', 120
  ),
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM section WHERE course_code = 'BCH 101' AND section_no = '01B');

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
DECLARE
  section_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO section_count FROM section;
  
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Sections seed completed successfully!';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Total Sections: %', section_count;
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Note: All sections are in "draft" state';
  RAISE NOTICE 'Update to "released" when ready for student enrollment';
  RAISE NOTICE '============================================================================';
END $$;

