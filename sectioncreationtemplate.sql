-- ========================================
-- MANUAL SECTION CREATION TEMPLATE
-- ========================================

-- 1. Create a section (example: Operations Research)
INSERT INTO sections (course_id, section_number, instructor_id, activity, status, semester, year, capacity, enrolled_count)
SELECT
c.id,
'122-01', -- Section number format: course_code + serial
f.id,
'lecture'::course_activity_type,
'open'::section_status,
'1st',
1447,
40, -- schedulers can adjust capacity (>=25 or bigger for grads)
0
FROM courses c
JOIN faculty f ON f.name = 'نورة عبدالعزيز الشمري'
WHERE c.code = '122 بحث';

-- 2. Assign a 2-hour slot (example: Monday 08:00–09:50)
INSERT INTO section_times (section_id, day_of_week, start_time, end_time, room_id)
SELECT
s.id,
2, -- Monday (1=Sun, 2=Mon, ... 5=Thu)
TIME '08:00',
TIME '09:50',
r.id
FROM sections s
JOIN courses c ON c.id = s.course_id
JOIN rooms r ON r.code = '0150 02 G B 015'
WHERE c.code = '122 بحث' AND s.section_number = '122-01';

-- 3. Another example: Physics I, 1-hour slot on Wednesday 10:00–10:50
INSERT INTO sections (course_id, section_number, instructor_id, activity, status, semester, year, capacity, enrolled_count)
SELECT
c.id,
'103-01',
f.id,
'lecture'::course_activity_type,
'open'::section_status,
'1st',
1447,
50,
0
FROM courses c
JOIN faculty f ON f.name = 'زياد فهد العتيبي'
WHERE c.code = '103 فيز';

INSERT INTO section_times (section_id, day_of_week, start_time, end_time, room_id)
SELECT
s.id,
4, -- Wednesday
TIME '10:00',
TIME '10:50',
r.id
FROM sections s
JOIN courses c ON c.id = s.course_id
JOIN rooms r ON r.code = '0160 31 1 A 061'
WHERE c.code = '103 فيز' AND s.section_number = '103-01';
