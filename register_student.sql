-- Helper: Parse HH:MM to minutes
CREATE OR REPLACE FUNCTION reg_parse_time(t TEXT) RETURNS INT AS $$
DECLARE
  parts TEXT[];
BEGIN
  parts := string_to_array(t, ':');
  RETURN (parts[1]::INT * 60) + parts[2]::INT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Helper: Check time overlap
CREATE OR REPLACE FUNCTION reg_check_overlap(
  days1 JSONB, start1 TEXT, duration1 INT,
  days2 JSONB, start2 TEXT, duration2 INT
) RETURNS BOOLEAN AS $$
DECLARE
  d1 TEXT;
  d2 TEXT;
  overlap_days BOOLEAN := FALSE;
  s1 INT;
  e1 INT;
  s2 INT;
  e2 INT;
BEGIN
  -- Check day overlap
  FOR d1 IN SELECT jsonb_array_elements_text(days1) LOOP
    FOR d2 IN SELECT jsonb_array_elements_text(days2) LOOP
      IF d1 = d2 THEN
        overlap_days := TRUE;
        EXIT;
      END IF;
    END LOOP;
    IF overlap_days THEN EXIT; END IF;
  END LOOP;

  IF NOT overlap_days THEN RETURN FALSE; END IF;

  -- Check time overlap
  s1 := reg_parse_time(start1);
  e1 := s1 + duration1;
  s2 := reg_parse_time(start2);
  e2 := s2 + duration2;

  RETURN s1 < e2 AND s2 < e1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Main Registration Function
CREATE OR REPLACE FUNCTION register_student(
  p_student_id UUID,
  p_section_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_section RECORD;
  v_course RECORD;
  v_enrollment RECORD;
  v_exam RECORD;
  v_existing_exam RECORD;
  v_total_credits INT := 0;
  v_current_enrollment_count INT;
BEGIN
  -- 1. Get Section Details
  SELECT * INTO v_section FROM section WHERE id = p_section_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Section not found');
  END IF;

  IF v_section.state != 'released' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Section is not released');
  END IF;

  -- 2. Get Course Details
  SELECT * INTO v_course FROM course WHERE code = v_section.course_code;

  -- 3. Check Already Enrolled
  IF EXISTS (SELECT 1 FROM student_enrollment WHERE student_id = p_student_id AND section_id = p_section_id AND status = 'registered') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Already enrolled');
  END IF;

  -- 4. Time Conflict Check
  FOR v_enrollment IN
    SELECT s.meeting_pattern, s.course_code, s.section_no
    FROM student_enrollment se
    JOIN section s ON se.section_id = s.id
    WHERE se.student_id = p_student_id AND se.status = 'registered'
  LOOP
    IF reg_check_overlap(
      v_section.meeting_pattern->'days',
      v_section.meeting_pattern->>'start',
      (v_section.meeting_pattern->>'duration')::INT,
      v_enrollment.meeting_pattern->'days',
      v_enrollment.meeting_pattern->>'start',
      (v_enrollment.meeting_pattern->>'duration')::INT
    ) THEN
      RETURN jsonb_build_object('success', false, 'message', 'Time conflict with ' || v_enrollment.course_code || ' ' || v_enrollment.section_no);
    END IF;
  END LOOP;

  -- 5. Exam Conflict Check
  FOR v_exam IN SELECT * FROM exam WHERE course_code = v_section.course_code LOOP
    FOR v_existing_exam IN
      SELECT e.*, s.course_code as enrolled_course_code
      FROM student_enrollment se
      JOIN section s ON se.section_id = s.id
      JOIN exam e ON s.course_code = e.course_code
      WHERE se.student_id = p_student_id AND se.status = 'registered'
    LOOP
      IF v_exam.date = v_existing_exam.date THEN
         IF reg_parse_time(v_exam.start_time::TEXT) < (reg_parse_time(v_existing_exam.start_time::TEXT) + v_existing_exam.duration_minutes) AND
            reg_parse_time(v_existing_exam.start_time::TEXT) < (reg_parse_time(v_exam.start_time::TEXT) + v_exam.duration_minutes) THEN
            RETURN jsonb_build_object('success', false, 'message', 'Exam conflict with ' || v_existing_exam.enrolled_course_code);
         END IF;
      END IF;
    END LOOP;
  END LOOP;

  -- 6. Credit Limit Check (Max 20)
  SELECT COALESCE(SUM(c.credits), 0) INTO v_total_credits
  FROM student_enrollment se
  JOIN section s ON se.section_id = s.id
  JOIN course c ON s.course_code = c.code
  WHERE se.student_id = p_student_id AND se.status = 'registered';

  IF (v_total_credits + v_course.credits) > 20 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Credit limit exceeded');
  END IF;

  -- 7. Capacity Check
  SELECT COUNT(*) INTO v_current_enrollment_count
  FROM student_enrollment
  WHERE section_id = p_section_id AND status = 'registered';

  IF v_current_enrollment_count >= v_section.capacity THEN
    RETURN jsonb_build_object('success', false, 'message', 'Section is full');
  END IF;

  -- 8. Register
  INSERT INTO student_enrollment (student_id, section_id, status)
  VALUES (p_student_id, p_section_id, 'registered');

  RETURN jsonb_build_object('success', true, 'message', 'Registered successfully');
END;
$$ LANGUAGE plpgsql;
