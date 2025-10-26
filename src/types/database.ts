export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      academic_term: {
        Row: {
          code: string
          created_at: string | null
          electives_survey_open: boolean | null
          end_date: string
          feedback_open: boolean | null
          is_active: boolean | null
          is_faculty_availability_open: boolean | null
          name: string
          registration_open: boolean | null
          schedule_published: boolean | null
          start_date: string
          type: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          electives_survey_open?: boolean | null
          end_date: string
          feedback_open?: boolean | null
          is_active?: boolean | null
          is_faculty_availability_open?: boolean | null
          name: string
          registration_open?: boolean | null
          schedule_published?: boolean | null
          start_date: string
          type: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          electives_survey_open?: boolean | null
          end_date?: string
          feedback_open?: boolean | null
          is_active?: boolean | null
          is_faculty_availability_open?: boolean | null
          name?: string
          registration_open?: boolean | null
          schedule_published?: boolean | null
          start_date?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      capacity_thresholds: {
        Row: {
          base_capacity: number
          course_code: string
          created_at: string | null
          id: string
          is_swe_course: boolean
          term_code: string
          threshold_percentage: number
          updated_at: string | null
          updated_by: string
        }
        Insert: {
          base_capacity?: number
          course_code: string
          created_at?: string | null
          id?: string
          is_swe_course?: boolean
          term_code: string
          threshold_percentage?: number
          updated_at?: string | null
          updated_by: string
        }
        Update: {
          base_capacity?: number
          course_code?: string
          created_at?: string | null
          id?: string
          is_swe_course?: boolean
          term_code?: string
          threshold_percentage?: number
          updated_at?: string | null
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "capacity_thresholds_course_code_fkey"
            columns: ["course_code"]
            isOneToOne: false
            referencedRelation: "course"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "capacity_thresholds_term_code_fkey"
            columns: ["term_code"]
            isOneToOne: false
            referencedRelation: "academic_term"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "capacity_thresholds_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      committee_members: {
        Row: {
          committee_type: string
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          committee_type: string
          created_at?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          committee_type?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "committee_members_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      course: {
        Row: {
          code: string
          created_at: string | null
          credits: number
          department: string
          description: string | null
          is_swe_managed: boolean | null
          level: number | null
          name: string
          prerequisites: string[] | null
          type: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          credits: number
          department: string
          description?: string | null
          is_swe_managed?: boolean | null
          level?: number | null
          name: string
          prerequisites?: string[] | null
          type: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          credits?: number
          department?: string
          description?: string | null
          is_swe_managed?: boolean | null
          level?: number | null
          name?: string
          prerequisites?: string[] | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      elective_package: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          max_credits: number
          min_credits: number
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id: string
          is_active?: boolean | null
          max_credits: number
          min_credits: number
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          max_credits?: number
          min_credits?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      elective_preferences: {
        Row: {
          course_code: string
          created_at: string | null
          id: string
          preference_order: number
          status: string | null
          student_id: string
          submitted_at: string | null
          term_code: string
          updated_at: string | null
        }
        Insert: {
          course_code: string
          created_at?: string | null
          id?: string
          preference_order: number
          status?: string | null
          student_id: string
          submitted_at?: string | null
          term_code: string
          updated_at?: string | null
        }
        Update: {
          course_code?: string
          created_at?: string | null
          id?: string
          preference_order?: number
          status?: string | null
          student_id?: string
          submitted_at?: string | null
          term_code?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "elective_preferences_course_code_fkey"
            columns: ["course_code"]
            isOneToOne: false
            referencedRelation: "course"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "elective_preferences_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "elective_preferences_term_code_fkey"
            columns: ["term_code"]
            isOneToOne: false
            referencedRelation: "academic_term"
            referencedColumns: ["code"]
          },
        ]
      }
      enrollment: {
        Row: {
          course_code: string
          created_at: string | null
          grade: number | null
          grade_letter: string | null
          id: string
          status: string
          student_id: string
          term_code: string
          updated_at: string | null
        }
        Insert: {
          course_code: string
          created_at?: string | null
          grade?: number | null
          grade_letter?: string | null
          id?: string
          status: string
          student_id: string
          term_code: string
          updated_at?: string | null
        }
        Update: {
          course_code?: string
          created_at?: string | null
          grade?: number | null
          grade_letter?: string | null
          id?: string
          status?: string
          student_id?: string
          term_code?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_course_code_fkey"
            columns: ["course_code"]
            isOneToOne: false
            referencedRelation: "course"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "enrollment_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollment_term_code_fkey"
            columns: ["term_code"]
            isOneToOne: false
            referencedRelation: "academic_term"
            referencedColumns: ["code"]
          },
        ]
      }
      exam: {
        Row: {
          course_code: string
          created_at: string | null
          duration: number
          exam_date: string
          exam_type: string
          id: string
          room_id: string | null
          start_time: string
          term_code: string
          updated_at: string | null
        }
        Insert: {
          course_code: string
          created_at?: string | null
          duration: number
          exam_date: string
          exam_type: string
          id?: string
          room_id?: string | null
          start_time: string
          term_code: string
          updated_at?: string | null
        }
        Update: {
          course_code?: string
          created_at?: string | null
          duration?: number
          exam_date?: string
          exam_type?: string
          id?: string
          room_id?: string | null
          start_time?: string
          term_code?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_course_code_fkey"
            columns: ["course_code"]
            isOneToOne: false
            referencedRelation: "course"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "exam_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_term_code_fkey"
            columns: ["term_code"]
            isOneToOne: false
            referencedRelation: "academic_term"
            referencedColumns: ["code"]
          },
        ]
      }
      faculty: {
        Row: {
          created_at: string | null
          faculty_id: string
          id: string
          status: Database["public"]["Enums"]["faculty_status"]
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          faculty_id: string
          id: string
          status?: Database["public"]["Enums"]["faculty_status"]
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          faculty_id?: string
          id?: string
          status?: Database["public"]["Enums"]["faculty_status"]
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faculty_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty_availability: {
        Row: {
          availability_data: Json
          created_at: string
          faculty_id: string
          id: string
          term_code: string
          updated_at: string | null
        }
        Insert: {
          availability_data: Json
          created_at?: string
          faculty_id: string
          id?: string
          term_code: string
          updated_at?: string | null
        }
        Update: {
          availability_data?: Json
          created_at?: string
          faculty_id?: string
          id?: string
          term_code?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faculty_availability_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faculty_availability_term_code_fkey"
            columns: ["term_code"]
            isOneToOne: false
            referencedRelation: "academic_term"
            referencedColumns: ["code"]
          },
        ]
      }
      feedback: {
        Row: {
          created_at: string
          feedback_text: string
          id: string
          rating: number
          schedule_id: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          feedback_text: string
          id?: string
          rating: number
          schedule_id?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          feedback_text?: string
          id?: string
          rating?: number
          schedule_id?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      irregular_students: {
        Row: {
          courses_needed: string[] | null
          created_at: string | null
          id: string
          notes: string | null
          notified_at: string | null
          reason: string
          reported_by: string
          resolved_at: string | null
          status: string
          student_id: string
          term_code: string
          updated_at: string | null
        }
        Insert: {
          courses_needed?: string[] | null
          created_at?: string | null
          id?: string
          notes?: string | null
          notified_at?: string | null
          reason: string
          reported_by: string
          resolved_at?: string | null
          status: string
          student_id: string
          term_code: string
          updated_at?: string | null
        }
        Update: {
          courses_needed?: string[] | null
          created_at?: string | null
          id?: string
          notes?: string | null
          notified_at?: string | null
          reason?: string
          reported_by?: string
          resolved_at?: string | null
          status?: string
          student_id?: string
          term_code?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "irregular_students_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "irregular_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "irregular_students_term_code_fkey"
            columns: ["term_code"]
            isOneToOne: false
            referencedRelation: "academic_term"
            referencedColumns: ["code"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          read: boolean | null
          read_at: string | null
          recipient_id: string
          sender_id: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          read_at?: string | null
          recipient_id: string
          sender_id?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      package_course: {
        Row: {
          course_code: string
          created_at: string | null
          id: string
          package_id: string
        }
        Insert: {
          course_code: string
          created_at?: string | null
          id?: string
          package_id: string
        }
        Update: {
          course_code?: string
          created_at?: string | null
          id?: string
          package_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_course_course_code_fkey"
            columns: ["course_code"]
            isOneToOne: false
            referencedRelation: "course"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "package_course_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "elective_package"
            referencedColumns: ["id"]
          },
        ]
      }
      room: {
        Row: {
          created_at: string | null
          id: string
          number: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          number: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          number?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      schedule_conflicts: {
        Row: {
          affected_entities: Json
          auto_resolvable: boolean | null
          conflict_type: string
          created_at: string | null
          description: string
          id: string
          resolution_suggestions: Json | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          schedule_id: string | null
          severity: string
          title: string
        }
        Insert: {
          affected_entities: Json
          auto_resolvable?: boolean | null
          conflict_type: string
          created_at?: string | null
          description: string
          id?: string
          resolution_suggestions?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          schedule_id?: string | null
          severity: string
          title: string
        }
        Update: {
          affected_entities?: Json
          auto_resolvable?: boolean | null
          conflict_type?: string
          created_at?: string | null
          description?: string
          id?: string
          resolution_suggestions?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          schedule_id?: string | null
          severity?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_conflicts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_conflicts_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          created_at: string
          data: Json
          id: string
          is_published: boolean | null
          student_id: string
          term_code: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          is_published?: boolean | null
          student_id: string
          term_code?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          is_published?: boolean | null
          student_id?: string
          term_code?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "schedules_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_term_code_fkey"
            columns: ["term_code"]
            isOneToOne: false
            referencedRelation: "academic_term"
            referencedColumns: ["code"]
          },
        ]
      }
      scheduling_rule_schemas: {
        Row: {
          created_at: string
          example_config: Json
          rule_type: Database["public"]["Enums"]["scheduling_rule_type"]
          schema_description: string
        }
        Insert: {
          created_at?: string
          example_config: Json
          rule_type: Database["public"]["Enums"]["scheduling_rule_type"]
          schema_description: string
        }
        Update: {
          created_at?: string
          example_config?: Json
          rule_type?: Database["public"]["Enums"]["scheduling_rule_type"]
          schema_description?: string
        }
        Relationships: []
      }
      scheduling_rules: {
        Row: {
          config: Json
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          is_hard_constraint: boolean
          priority: number
          rule_name: string
          rule_type: Database["public"]["Enums"]["scheduling_rule_type"]
          term_code: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_hard_constraint?: boolean
          priority?: number
          rule_name: string
          rule_type: Database["public"]["Enums"]["scheduling_rule_type"]
          term_code: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_hard_constraint?: boolean
          priority?: number
          rule_name?: string
          rule_type?: Database["public"]["Enums"]["scheduling_rule_type"]
          term_code?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduling_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduling_rules_term_code_fkey"
            columns: ["term_code"]
            isOneToOne: false
            referencedRelation: "academic_term"
            referencedColumns: ["code"]
          },
        ]
      }
      section: {
        Row: {
          capacity: number | null
          course_code: string
          created_at: string | null
          enrolled_count: number | null
          id: string
          instructor_id: string | null
          room_id: string | null
          section_type: string | null
          status: string | null
          term_code: string
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          course_code: string
          created_at?: string | null
          enrolled_count?: number | null
          id: string
          instructor_id?: string | null
          room_id?: string | null
          section_type?: string | null
          status?: string | null
          term_code: string
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          course_code?: string
          created_at?: string | null
          enrolled_count?: number | null
          id?: string
          instructor_id?: string | null
          room_id?: string | null
          section_type?: string | null
          status?: string | null
          term_code?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "section_course_code_fkey"
            columns: ["course_code"]
            isOneToOne: false
            referencedRelation: "course"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "section_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_term_code_fkey"
            columns: ["term_code"]
            isOneToOne: false
            referencedRelation: "academic_term"
            referencedColumns: ["code"]
          },
        ]
      }
      section_enrollment: {
        Row: {
          dropped_at: string | null
          enrolled_at: string | null
          enrollment_status: string | null
          id: string
          section_id: string
          student_id: string
        }
        Insert: {
          dropped_at?: string | null
          enrolled_at?: string | null
          enrollment_status?: string | null
          id?: string
          section_id: string
          student_id: string
        }
        Update: {
          dropped_at?: string | null
          enrolled_at?: string | null
          enrollment_status?: string | null
          id?: string
          section_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "section_enrollment_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "section"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_enrollment_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      section_time: {
        Row: {
          created_at: string | null
          day: string
          end_time: string
          id: string
          section_id: string
          start_time: string
        }
        Insert: {
          created_at?: string | null
          day: string
          end_time: string
          id?: string
          section_id: string
          start_time: string
        }
        Update: {
          created_at?: string | null
          day?: string
          end_time?: string
          id?: string
          section_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "section_time_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "section"
            referencedColumns: ["id"]
          },
        ]
      }
      student_package_progress: {
        Row: {
          credits_completed: number | null
          credits_enrolled: number | null
          id: string
          is_fulfilled: boolean | null
          package_id: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          credits_completed?: number | null
          credits_enrolled?: number | null
          id?: string
          is_fulfilled?: boolean | null
          package_id: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          credits_completed?: number | null
          credits_enrolled?: number | null
          id?: string
          is_fulfilled?: boolean | null
          package_id?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_package_progress_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "elective_package"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_package_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string | null
          current_term: string | null
          id: string
          level: number
          setup_completed: boolean | null
          status: Database["public"]["Enums"]["student_status"]
          student_number: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_term?: string | null
          id: string
          level: number
          setup_completed?: boolean | null
          status?: Database["public"]["Enums"]["student_status"]
          student_number: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_term?: string | null
          id?: string
          level?: number
          setup_completed?: boolean | null
          status?: Database["public"]["Enums"]["student_status"]
          student_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_current_term_fkey"
            columns: ["current_term"]
            isOneToOne: false
            referencedRelation: "academic_term"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "students_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      term_events: {
        Row: {
          category: Database["public"]["Enums"]["event_category"]
          created_at: string
          description: string | null
          end_date: string
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          is_recurring: boolean | null
          metadata: Json | null
          start_date: string
          term_code: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["event_category"]
          created_at?: string
          description?: string | null
          end_date: string
          event_type: Database["public"]["Enums"]["event_type"]
          id?: string
          is_recurring?: boolean | null
          metadata?: Json | null
          start_date: string
          term_code: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["event_category"]
          created_at?: string
          description?: string | null
          end_date?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          is_recurring?: boolean | null
          metadata?: Json | null
          start_date?: string
          term_code?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "term_events_term_code_fkey"
            columns: ["term_code"]
            isOneToOne: false
            referencedRelation: "academic_term"
            referencedColumns: ["code"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          role: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_student_gpa: { Args: { p_student_id: string }; Returns: number }
      calculate_student_package_progress: {
        Args: { p_student_id: string }
        Returns: {
          credits_completed: number
          credits_enrolled: number
          is_fulfilled: boolean
          min_credits: number
          package_id: string
          package_name: string
        }[]
      }
      check_prerequisites: {
        Args: { p_course_code: string; p_student_id: string }
        Returns: boolean
      }
      get_active_events: {
        Args: { p_term_code?: string }
        Returns: {
          category: Database["public"]["Enums"]["event_category"]
          description: string
          end_date: string
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          metadata: Json
          start_date: string
          term_code: string
          title: string
        }[]
      }
      get_active_scheduling_rules: {
        Args: { p_term_code: string }
        Returns: {
          config: Json
          id: string
          is_hard_constraint: boolean
          priority: number
          rule_name: string
          rule_type: Database["public"]["Enums"]["scheduling_rule_type"]
        }[]
      }
      get_course_enrollment_stats: {
        Args: { p_term_code: string }
        Returns: {
          course_code: string
          course_name: string
          course_type: string
          enrolled_students: number
          level: number
          sections_needed: number
          total_students: number
        }[]
      }
      get_published_schedule: {
        Args: { p_student_id: string; p_term_code: string }
        Returns: Json
      }
      get_scheduling_rules_by_type: {
        Args: {
          p_rule_type: Database["public"]["Enums"]["scheduling_rule_type"]
          p_term_code: string
        }
        Returns: {
          config: Json
          id: string
          is_hard_constraint: boolean
          priority: number
          rule_name: string
        }[]
      }
      get_section_max_capacity: {
        Args: {
          p_base_capacity: number
          p_course_code: string
          p_term_code: string
        }
        Returns: number
      }
      get_upcoming_events: {
        Args: { p_days_ahead?: number; p_term_code: string }
        Returns: {
          category: Database["public"]["Enums"]["event_category"]
          days_until: number
          description: string
          end_date: string
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          start_date: string
          term_code: string
          title: string
        }[]
      }
      has_submitted_preferences: {
        Args: { p_student_id: string; p_term_code: string }
        Returns: boolean
      }
      refresh_student_package_progress: {
        Args: { p_student_id: string }
        Returns: undefined
      }
      validate_scheduling_rule_config: {
        Args: {
          p_config: Json
          p_rule_type: Database["public"]["Enums"]["scheduling_rule_type"]
        }
        Returns: boolean
      }
    }
    Enums: {
      conflict_severity_enum: "low" | "medium" | "high" | "critical"
      enrollment_status_enum: "enrolled" | "completed" | "dropped" | "failed"
      event_category: "academic" | "registration" | "exam" | "administrative"
      event_type:
        | "registration"
        | "add_drop"
        | "elective_survey"
        | "midterm_exam"
        | "final_exam"
        | "break"
        | "grade_submission"
        | "feedback_period"
        | "schedule_publish"
        | "academic_milestone"
        | "other"
      faculty_status: "active" | "inactive"
      irregular_status_enum:
        | "pending"
        | "notified"
        | "in_progress"
        | "resolved"
        | "dismissed"
      preference_status_enum: "draft" | "submitted"
      scheduling_rule_type:
        | "BREAK_TIME"
        | "MIDTERM_BLOCK"
        | "ELECTIVES_ACROSS_LEVELS"
        | "PREREQUISITE_GROUPING"
        | "BALANCED_ELECTIVES"
        | "CONTINUOUS_LABS"
      section_status: "draft" | "reserved" | "confirmed" | "cancelled"
      section_type_enum: "lecture" | "lab" | "tutorial"
      student_status: "active" | "inactive"
      user_role_enum:
        | "student"
        | "faculty"
        | "scheduling_committee"
        | "teaching_load_committee"
        | "registrar"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      conflict_severity_enum: ["low", "medium", "high", "critical"],
      enrollment_status_enum: ["enrolled", "completed", "dropped", "failed"],
      event_category: ["academic", "registration", "exam", "administrative"],
      event_type: [
        "registration",
        "add_drop",
        "elective_survey",
        "midterm_exam",
        "final_exam",
        "break",
        "grade_submission",
        "feedback_period",
        "schedule_publish",
        "academic_milestone",
        "other",
      ],
      faculty_status: ["active", "inactive"],
      irregular_status_enum: [
        "pending",
        "notified",
        "in_progress",
        "resolved",
        "dismissed",
      ],
      preference_status_enum: ["draft", "submitted"],
      scheduling_rule_type: [
        "BREAK_TIME",
        "MIDTERM_BLOCK",
        "ELECTIVES_ACROSS_LEVELS",
        "PREREQUISITE_GROUPING",
        "BALANCED_ELECTIVES",
        "CONTINUOUS_LABS",
      ],
      section_status: ["draft", "reserved", "confirmed", "cancelled"],
      section_type_enum: ["lecture", "lab", "tutorial"],
      student_status: ["active", "inactive"],
      user_role_enum: [
        "student",
        "faculty",
        "scheduling_committee",
        "teaching_load_committee",
        "registrar",
      ],
    },
  },
} as const
