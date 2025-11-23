-- Migration: Add partial indexes for student_enrollment table
-- These indexes optimize queries for active (registered) enrollments only
-- Prisma 7 doesn't support WHERE clauses in @@index directives, so we create them manually

-- Partial index for studentId (only registered enrollments)
CREATE INDEX IF NOT EXISTS idx_student_enrollment_student_id_registered 
ON student_enrollment(student_id) 
WHERE status = 'registered';

-- Partial index for sectionId (only registered enrollments)
CREATE INDEX IF NOT EXISTS idx_student_enrollment_section_id_registered 
ON student_enrollment(section_id) 
WHERE status = 'registered';

-- Note: The general indexes on studentId and sectionId are still useful for queries
-- that need to include dropped enrollments, but these partial indexes will be
-- used preferentially by PostgreSQL for queries filtering by status = 'registered'

