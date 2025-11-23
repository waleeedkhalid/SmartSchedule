-- CreateEnum
CREATE TYPE "UserRoleType" AS ENUM ('scheduling', 'teaching_load', 'faculty', 'student', 'registrar');

-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('Lecture', 'Lab');

-- CreateEnum
CREATE TYPE "SectionState" AS ENUM ('draft', 'released');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('registered', 'dropped');

-- CreateEnum
CREATE TYPE "SemesterType" AS ENUM ('FALL', 'SPRING', 'SUMMER');

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" UUID NOT NULL,
    "role" "UserRoleType" NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "student_profile" (
    "user_id" UUID NOT NULL,
    "level" INTEGER NOT NULL,
    "student_group_id" UUID,
    "department" TEXT NOT NULL DEFAULT 'Software Engineering',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "student_profile_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "faculty_profile" (
    "user_id" UUID NOT NULL,
    "preferred_times" JSONB NOT NULL DEFAULT '[]',
    "unavailable_times" JSONB NOT NULL DEFAULT '[]',
    "max_load_per_week" INTEGER NOT NULL DEFAULT 12,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "faculty_profile_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "academic_semesters" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SemesterType" NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "electives_survey_open" BOOLEAN NOT NULL DEFAULT false,
    "registration_open" BOOLEAN NOT NULL DEFAULT false,
    "feedback_open" BOOLEAN NOT NULL DEFAULT false,
    "schedule_published" BOOLEAN NOT NULL DEFAULT false,
    "is_faculty_availability_open" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "academic_semesters_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "semester_timeline" (
    "id" UUID NOT NULL,
    "term_code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "event_type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "start_date" TIMESTAMPTZ NOT NULL,
    "end_date" TIMESTAMPTZ NOT NULL,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,

    CONSTRAINT "semester_timeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course" (
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "credits" INTEGER NOT NULL,
    "weekly_hours" INTEGER NOT NULL,
    "is_elective" BOOLEAN NOT NULL DEFAULT false,
    "elective_group_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,

    CONSTRAINT "course_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "elective_group" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "required_credit_hours" INTEGER NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "elective_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_prerequisite" (
    "id" UUID NOT NULL,
    "course_code" TEXT NOT NULL,
    "prerequisite_code" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_prerequisite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_offering" (
    "id" UUID NOT NULL,
    "course_code" TEXT NOT NULL,
    "semester_code" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "max_sections" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,

    CONSTRAINT "course_offering_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room" (
    "code" TEXT NOT NULL,
    "type" "RoomType" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,

    CONSTRAINT "room_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "student_group" (
    "id" UUID NOT NULL,
    "level" INTEGER NOT NULL,
    "size" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,

    CONSTRAINT "student_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "section" (
    "id" UUID NOT NULL,
    "course_code" TEXT NOT NULL,
    "section_no" TEXT NOT NULL,
    "instructor_id" UUID,
    "room_code" TEXT,
    "capacity" INTEGER NOT NULL,
    "meeting_pattern" JSONB NOT NULL,
    "group_level" INTEGER NOT NULL,
    "state" "SectionState" NOT NULL DEFAULT 'draft',
    "is_scheduled_by_algorithm" BOOLEAN NOT NULL DEFAULT false,
    "course_offering_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,

    CONSTRAINT "section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam" (
    "id" UUID NOT NULL,
    "course_code" TEXT NOT NULL,
    "student_group_id" UUID,
    "date" DATE NOT NULL,
    "start_time" TEXT NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "room_codes" TEXT[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,

    CONSTRAINT "exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rule" (
    "id" UUID NOT NULL,
    "time_blocks" JSONB NOT NULL,
    "forbidden_pairs" JSONB NOT NULL,
    "exam_spacing_mins" INTEGER NOT NULL DEFAULT 120,
    "max_classes_per_instructor_day" INTEGER NOT NULL DEFAULT 4,
    "max_classes_per_student_day" INTEGER NOT NULL DEFAULT 6,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,

    CONSTRAINT "rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_grid_config" (
    "id" UUID NOT NULL,
    "teaching_days" TEXT[],
    "daily_start_time" TEXT NOT NULL DEFAULT '08:00:00',
    "daily_end_time" TEXT NOT NULL DEFAULT '17:00:00',
    "slot_duration_minutes" INTEGER NOT NULL DEFAULT 60,
    "break_start_time" TEXT NOT NULL DEFAULT '12:00:00',
    "break_end_time" TEXT NOT NULL DEFAULT '13:00:00',
    "exam_days" TEXT[],
    "exam_start_time" TEXT NOT NULL DEFAULT '09:00:00',
    "exam_end_time" TEXT NOT NULL DEFAULT '17:00:00',
    "typical_lab_duration_minutes" INTEGER NOT NULL DEFAULT 120,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "time_grid_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_enrollment" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'registered',
    "enrollment_type" TEXT NOT NULL DEFAULT 'elective',
    "enrolled_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dropped_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "student_enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "irregular_student" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "required_course_codes" TEXT[],
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,

    CONSTRAINT "irregular_student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_comment" (
    "id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "section_id" UUID,
    "comment_text" TEXT NOT NULL,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_by" UUID,
    "resolved_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "schedule_comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "read_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_doc" (
    "id" UUID NOT NULL,
    "content" JSONB NOT NULL DEFAULT '{}',
    "release_tag" TEXT,
    "diff_from_previous" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "schedule_doc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "elective_preference" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "course_code" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "elective_preference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment" (
    "id" UUID NOT NULL,
    "doc_id" UUID,
    "target_ref" TEXT NOT NULL,
    "author_id" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_roles_role_idx" ON "user_roles"("role");

-- CreateIndex
CREATE INDEX "student_profile_level_idx" ON "student_profile"("level");

-- CreateIndex
CREATE INDEX "student_profile_student_group_id_idx" ON "student_profile"("student_group_id");

-- CreateIndex
CREATE INDEX "student_profile_level_student_group_id_idx" ON "student_profile"("level", "student_group_id");

-- CreateIndex
CREATE INDEX "academic_semesters_is_active_idx" ON "academic_semesters"("is_active");

-- CreateIndex
CREATE INDEX "academic_semesters_type_idx" ON "academic_semesters"("type");

-- CreateIndex
CREATE INDEX "academic_semesters_start_date_end_date_idx" ON "academic_semesters"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "semester_timeline_term_code_idx" ON "semester_timeline"("term_code");

-- CreateIndex
CREATE INDEX "semester_timeline_start_date_end_date_idx" ON "semester_timeline"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "semester_timeline_event_type_idx" ON "semester_timeline"("event_type");

-- CreateIndex
CREATE INDEX "semester_timeline_category_idx" ON "semester_timeline"("category");

-- CreateIndex
CREATE INDEX "course_level_idx" ON "course"("level");

-- CreateIndex
CREATE INDEX "course_is_elective_idx" ON "course"("is_elective");

-- CreateIndex
CREATE INDEX "course_elective_group_id_idx" ON "course"("elective_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "elective_group_name_key" ON "elective_group"("name");

-- CreateIndex
CREATE INDEX "elective_group_name_idx" ON "elective_group"("name");

-- CreateIndex
CREATE INDEX "course_prerequisite_course_code_idx" ON "course_prerequisite"("course_code");

-- CreateIndex
CREATE INDEX "course_prerequisite_prerequisite_code_idx" ON "course_prerequisite"("prerequisite_code");

-- CreateIndex
CREATE UNIQUE INDEX "course_prerequisite_course_code_prerequisite_code_key" ON "course_prerequisite"("course_code", "prerequisite_code");

-- CreateIndex
CREATE INDEX "course_offering_semester_code_idx" ON "course_offering"("semester_code");

-- CreateIndex
CREATE INDEX "course_offering_is_active_idx" ON "course_offering"("is_active");

-- CreateIndex
CREATE INDEX "course_offering_course_code_idx" ON "course_offering"("course_code");

-- CreateIndex
CREATE UNIQUE INDEX "course_offering_course_code_semester_code_key" ON "course_offering"("course_code", "semester_code");

-- CreateIndex
CREATE INDEX "student_group_level_idx" ON "student_group"("level");

-- CreateIndex
CREATE INDEX "section_course_code_idx" ON "section"("course_code");

-- CreateIndex
CREATE INDEX "section_instructor_id_idx" ON "section"("instructor_id");

-- CreateIndex
CREATE INDEX "section_state_idx" ON "section"("state");

-- CreateIndex
CREATE INDEX "section_group_level_idx" ON "section"("group_level");

-- CreateIndex
CREATE INDEX "section_is_scheduled_by_algorithm_idx" ON "section"("is_scheduled_by_algorithm");

-- CreateIndex
CREATE INDEX "section_course_offering_id_idx" ON "section"("course_offering_id");

-- CreateIndex
CREATE UNIQUE INDEX "section_course_code_section_no_key" ON "section"("course_code", "section_no");

-- CreateIndex
CREATE INDEX "exam_course_code_idx" ON "exam"("course_code");

-- CreateIndex
CREATE INDEX "exam_date_idx" ON "exam"("date");

-- CreateIndex
CREATE INDEX "exam_student_group_id_idx" ON "exam"("student_group_id");

-- CreateIndex
CREATE INDEX "student_enrollment_student_id_idx" ON "student_enrollment"("student_id");

-- CreateIndex
CREATE INDEX "student_enrollment_section_id_idx" ON "student_enrollment"("section_id");

-- CreateIndex
CREATE INDEX "student_enrollment_status_idx" ON "student_enrollment"("status");

-- CreateIndex
CREATE INDEX "student_enrollment_enrollment_type_idx" ON "student_enrollment"("enrollment_type");

-- CreateIndex
CREATE UNIQUE INDEX "student_enrollment_student_id_section_id_key" ON "student_enrollment"("student_id", "section_id");

-- CreateIndex
CREATE UNIQUE INDEX "irregular_student_student_id_key" ON "irregular_student"("student_id");

-- CreateIndex
CREATE INDEX "irregular_student_student_id_idx" ON "irregular_student"("student_id");

-- CreateIndex
CREATE INDEX "irregular_student_created_by_idx" ON "irregular_student"("created_by");

-- CreateIndex
CREATE INDEX "schedule_comment_author_id_idx" ON "schedule_comment"("author_id");

-- CreateIndex
CREATE INDEX "schedule_comment_section_id_idx" ON "schedule_comment"("section_id");

-- CreateIndex
CREATE INDEX "schedule_comment_is_resolved_idx" ON "schedule_comment"("is_resolved");

-- CreateIndex
CREATE INDEX "notification_user_id_idx" ON "notification"("user_id");

-- CreateIndex
CREATE INDEX "notification_read_at_idx" ON "notification"("read_at");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_doc_release_tag_key" ON "schedule_doc"("release_tag");

-- CreateIndex
CREATE INDEX "schedule_doc_release_tag_idx" ON "schedule_doc"("release_tag");

-- CreateIndex
CREATE INDEX "elective_preference_student_id_idx" ON "elective_preference"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "elective_preference_student_id_course_code_key" ON "elective_preference"("student_id", "course_code");

-- CreateIndex
CREATE INDEX "comment_doc_id_idx" ON "comment"("doc_id");

-- CreateIndex
CREATE INDEX "comment_author_id_idx" ON "comment"("author_id");

-- AddForeignKey
ALTER TABLE "student_profile" ADD CONSTRAINT "student_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_roles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profile" ADD CONSTRAINT "student_profile_student_group_id_fkey" FOREIGN KEY ("student_group_id") REFERENCES "student_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_profile" ADD CONSTRAINT "faculty_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_roles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semester_timeline" ADD CONSTRAINT "semester_timeline_term_code_fkey" FOREIGN KEY ("term_code") REFERENCES "academic_semesters"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semester_timeline" ADD CONSTRAINT "semester_timeline_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user_roles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course" ADD CONSTRAINT "course_elective_group_id_fkey" FOREIGN KEY ("elective_group_id") REFERENCES "elective_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course" ADD CONSTRAINT "course_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user_roles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_prerequisite" ADD CONSTRAINT "course_prerequisite_course_code_fkey" FOREIGN KEY ("course_code") REFERENCES "course"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_prerequisite" ADD CONSTRAINT "course_prerequisite_prerequisite_code_fkey" FOREIGN KEY ("prerequisite_code") REFERENCES "course"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_offering" ADD CONSTRAINT "course_offering_course_code_fkey" FOREIGN KEY ("course_code") REFERENCES "course"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_offering" ADD CONSTRAINT "course_offering_semester_code_fkey" FOREIGN KEY ("semester_code") REFERENCES "academic_semesters"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_offering" ADD CONSTRAINT "course_offering_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user_roles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room" ADD CONSTRAINT "room_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user_roles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section" ADD CONSTRAINT "section_course_code_fkey" FOREIGN KEY ("course_code") REFERENCES "course"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section" ADD CONSTRAINT "section_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "faculty_profile"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section" ADD CONSTRAINT "section_room_code_fkey" FOREIGN KEY ("room_code") REFERENCES "room"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section" ADD CONSTRAINT "section_course_offering_id_fkey" FOREIGN KEY ("course_offering_id") REFERENCES "course_offering"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section" ADD CONSTRAINT "section_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user_roles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam" ADD CONSTRAINT "exam_course_code_fkey" FOREIGN KEY ("course_code") REFERENCES "course"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam" ADD CONSTRAINT "exam_student_group_id_fkey" FOREIGN KEY ("student_group_id") REFERENCES "student_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam" ADD CONSTRAINT "exam_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user_roles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule" ADD CONSTRAINT "rule_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user_roles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_grid_config" ADD CONSTRAINT "time_grid_config_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "user_roles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollment" ADD CONSTRAINT "student_enrollment_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profile"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollment" ADD CONSTRAINT "student_enrollment_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "irregular_student" ADD CONSTRAINT "irregular_student_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "user_roles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "irregular_student" ADD CONSTRAINT "irregular_student_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user_roles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_comment" ADD CONSTRAINT "schedule_comment_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user_roles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_comment" ADD CONSTRAINT "schedule_comment_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "user_roles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_comment" ADD CONSTRAINT "schedule_comment_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_roles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_doc" ADD CONSTRAINT "schedule_doc_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user_roles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "elective_preference" ADD CONSTRAINT "elective_preference_course_code_fkey" FOREIGN KEY ("course_code") REFERENCES "course"("code") ON DELETE CASCADE ON UPDATE CASCADE;
