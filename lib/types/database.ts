export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      academic_semesters: {
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
      comment: {
        Row: {
          author_id: string
          created_at: string | null
          doc_id: string | null
          id: string
          target_ref: string
          text: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          created_at?: string | null
          doc_id?: string | null
          id?: string
          target_ref: string
          text: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          created_at?: string | null
          doc_id?: string | null
          id?: string
          target_ref?: string
          text?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_doc_id_fkey"
            columns: ["doc_id"]
            isOneToOne: false
            referencedRelation: "schedule_doc"
            referencedColumns: ["id"]
          },
        ]
      }
      course: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          credits: number
          elective_group_id: string | null
          is_elective: boolean
          level: number
          title: string
          updated_at: string | null
          weekly_hours: number
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          credits: number
          elective_group_id?: string | null
          is_elective?: boolean
          level: number
          title: string
          updated_at?: string | null
          weekly_hours: number
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          credits?: number
          elective_group_id?: string | null
          is_elective?: boolean
          level?: number
          title?: string
          updated_at?: string | null
          weekly_hours?: number
        }
        Relationships: [
          {
            foreignKeyName: "course_elective_group_id_fkey"
            columns: ["elective_group_id"]
            isOneToOne: false
            referencedRelation: "elective_group"
            referencedColumns: ["id"]
          },
        ]
      }
      course_offering: {
        Row: {
          course_code: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          max_sections: number | null
          notes: string | null
          semester_code: string
          updated_at: string | null
        }
        Insert: {
          course_code: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          max_sections?: number | null
          notes?: string | null
          semester_code: string
          updated_at?: string | null
        }
        Update: {
          course_code?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          max_sections?: number | null
          notes?: string | null
          semester_code?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_offering_course_code_fkey"
            columns: ["course_code"]
            isOneToOne: false
            referencedRelation: "course"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "course_offering_semester_code_fkey"
            columns: ["semester_code"]
            isOneToOne: false
            referencedRelation: "academic_semesters"
            referencedColumns: ["code"]
          },
        ]
      }
      course_prerequisite: {
        Row: {
          course_code: string
          created_at: string | null
          id: string
          prerequisite_code: string
        }
        Insert: {
          course_code: string
          created_at?: string | null
          id?: string
          prerequisite_code: string
        }
        Update: {
          course_code?: string
          created_at?: string | null
          id?: string
          prerequisite_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_prerequisite_course_code_fkey"
            columns: ["course_code"]
            isOneToOne: false
            referencedRelation: "course"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "course_prerequisite_prerequisite_code_fkey"
            columns: ["prerequisite_code"]
            isOneToOne: false
            referencedRelation: "course"
            referencedColumns: ["code"]
          },
        ]
      }
      elective_comment: {
        Row: {
          comment: string
          course_code: string
          created_at: string | null
          id: string
          is_resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          comment: string
          course_code: string
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          comment?: string
          course_code?: string
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "elective_comment_course_code_fkey"
            columns: ["course_code"]
            isOneToOne: false
            referencedRelation: "course"
            referencedColumns: ["code"]
          },
        ]
      }
      elective_group: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          required_credit_hours: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          required_credit_hours: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          required_credit_hours?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      elective_preference: {
        Row: {
          course_code: string
          created_at: string | null
          id: string
          rank: number
          student_id: string
          updated_at: string | null
        }
        Insert: {
          course_code: string
          created_at?: string | null
          id?: string
          rank: number
          student_id: string
          updated_at?: string | null
        }
        Update: {
          course_code?: string
          created_at?: string | null
          id?: string
          rank?: number
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "elective_preference_course_code_fkey"
            columns: ["course_code"]
            isOneToOne: false
            referencedRelation: "course"
            referencedColumns: ["code"]
          },
        ]
      }
      exam: {
        Row: {
          course_code: string
          created_at: string | null
          created_by: string | null
          date: string
          duration_minutes: number
          id: string
          room_codes: string[]
          start_time: string
          updated_at: string | null
        }
        Insert: {
          course_code: string
          created_at?: string | null
          created_by?: string | null
          date: string
          duration_minutes: number
          id?: string
          room_codes?: string[]
          start_time: string
          updated_at?: string | null
        }
        Update: {
          course_code?: string
          created_at?: string | null
          created_by?: string | null
          date?: string
          duration_minutes?: number
          id?: string
          room_codes?: string[]
          start_time?: string
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
        ]
      }
      instructor: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          max_load_per_week: number | null
          name: string
          preferred_times: Json | null
          unavailable_times: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          max_load_per_week?: number | null
          name: string
          preferred_times?: Json | null
          unavailable_times?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          max_load_per_week?: number | null
          name?: string
          preferred_times?: Json | null
          unavailable_times?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      irregular_student: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          required_course_codes: string[]
          student_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          required_course_codes?: string[]
          student_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          required_course_codes?: string[]
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "irregular_student_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "user_roles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notification: {
        Row: {
          created_at: string | null
          id: string
          payload: Json
          read_at: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          payload?: Json
          read_at?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          payload?: Json
          read_at?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      room: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          type: Database["public"]["Enums"]["room_type"]
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          type: Database["public"]["Enums"]["room_type"]
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          type?: Database["public"]["Enums"]["room_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      rule: {
        Row: {
          created_at: string | null
          created_by: string | null
          exam_spacing_mins: number
          forbidden_pairs: Json
          id: string
          max_classes_per_instructor_day: number | null
          max_classes_per_student_day: number | null
          time_blocks: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          exam_spacing_mins?: number
          forbidden_pairs?: Json
          id?: string
          max_classes_per_instructor_day?: number | null
          max_classes_per_student_day?: number | null
          time_blocks?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          exam_spacing_mins?: number
          forbidden_pairs?: Json
          id?: string
          max_classes_per_instructor_day?: number | null
          max_classes_per_student_day?: number | null
          time_blocks?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      schedule_comment: {
        Row: {
          author_id: string
          comment_text: string
          created_at: string | null
          id: string
          is_resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          section_id: string | null
          updated_at: string | null
        }
        Insert: {
          author_id: string
          comment_text: string
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          section_id?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          comment_text?: string
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          section_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_comment_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "schedule_comment_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "schedule_comment_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "section"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_comment_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "section_with_enrollment_count"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_doc: {
        Row: {
          content: Json
          created_at: string | null
          created_by: string | null
          diff_from_previous: Json | null
          id: string
          release_tag: string | null
        }
        Insert: {
          content?: Json
          created_at?: string | null
          created_by?: string | null
          diff_from_previous?: Json | null
          id?: string
          release_tag?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          created_by?: string | null
          diff_from_previous?: Json | null
          id?: string
          release_tag?: string | null
        }
        Relationships: []
      }
      section: {
        Row: {
          activity: string | null
          capacity: number
          course_code: string
          course_offering_id: string | null
          created_at: string | null
          created_by: string | null
          group_level: number
          id: string
          instructor_id: string | null
          is_scheduled_by_algorithm: boolean | null
          meeting_pattern: Json
          room_code: string | null
          section_no: string
          state: Database["public"]["Enums"]["section_state"]
          updated_at: string | null
        }
        Insert: {
          activity?: string | null
          capacity: number
          course_code: string
          course_offering_id?: string | null
          created_at?: string | null
          created_by?: string | null
          group_level: number
          id?: string
          instructor_id?: string | null
          is_scheduled_by_algorithm?: boolean | null
          meeting_pattern?: Json
          room_code?: string | null
          section_no: string
          state?: Database["public"]["Enums"]["section_state"]
          updated_at?: string | null
        }
        Update: {
          activity?: string | null
          capacity?: number
          course_code?: string
          course_offering_id?: string | null
          created_at?: string | null
          created_by?: string | null
          group_level?: number
          id?: string
          instructor_id?: string | null
          is_scheduled_by_algorithm?: boolean | null
          meeting_pattern?: Json
          room_code?: string | null
          section_no?: string
          state?: Database["public"]["Enums"]["section_state"]
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
            foreignKeyName: "section_course_offering_id_fkey"
            columns: ["course_offering_id"]
            isOneToOne: false
            referencedRelation: "course_offering"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructor_workload_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_room_code_fkey"
            columns: ["room_code"]
            isOneToOne: false
            referencedRelation: "room"
            referencedColumns: ["code"]
          },
        ]
      }
      semester_timeline: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          end_date: string
          event_type: string
          id: string
          is_deadline: boolean | null
          is_recurring: boolean | null
          metadata: Json | null
          notification_days_before: number[] | null
          priority: string | null
          requires_action: boolean | null
          start_date: string
          status: string | null
          target_roles: string[] | null
          term_code: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          end_date: string
          event_type: string
          id?: string
          is_deadline?: boolean | null
          is_recurring?: boolean | null
          metadata?: Json | null
          notification_days_before?: number[] | null
          priority?: string | null
          requires_action?: boolean | null
          start_date: string
          status?: string | null
          target_roles?: string[] | null
          term_code: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          end_date?: string
          event_type?: string
          id?: string
          is_deadline?: boolean | null
          is_recurring?: boolean | null
          metadata?: Json | null
          notification_days_before?: number[] | null
          priority?: string | null
          requires_action?: boolean | null
          start_date?: string
          status?: string | null
          target_roles?: string[] | null
          term_code?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "semester_timeline_term_code_fkey"
            columns: ["term_code"]
            isOneToOne: false
            referencedRelation: "academic_semesters"
            referencedColumns: ["code"]
          },
        ]
      }
      student_enrollment: {
        Row: {
          created_at: string | null
          dropped_at: string | null
          enrolled_at: string | null
          enrollment_type: string | null
          id: string
          section_id: string
          status: Database["public"]["Enums"]["enrollment_status"]
          student_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dropped_at?: string | null
          enrolled_at?: string | null
          enrollment_type?: string | null
          id?: string
          section_id: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dropped_at?: string | null
          enrolled_at?: string | null
          enrollment_type?: string | null
          id?: string
          section_id?: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_enrollment_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "section"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrollment_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "section_with_enrollment_count"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrollment_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      student_group: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          level: number
          name: string
          size: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          level: number
          name: string
          size: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          level?: number
          name?: string
          size?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      time_grid_config: {
        Row: {
          break_end_time: string
          break_start_time: string
          created_at: string | null
          daily_end_time: string
          daily_start_time: string
          exam_days: string[]
          exam_end_time: string
          exam_start_time: string
          id: string
          slot_duration_minutes: number
          teaching_days: string[]
          typical_lab_duration_minutes: number
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          break_end_time?: string
          break_start_time?: string
          created_at?: string | null
          daily_end_time?: string
          daily_start_time?: string
          exam_days?: string[]
          exam_end_time?: string
          exam_start_time?: string
          id?: string
          slot_duration_minutes?: number
          teaching_days?: string[]
          typical_lab_duration_minutes?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          break_end_time?: string
          break_start_time?: string
          created_at?: string | null
          daily_end_time?: string
          daily_start_time?: string
          exam_days?: string[]
          exam_end_time?: string
          exam_start_time?: string
          id?: string
          slot_duration_minutes?: number
          teaching_days?: string[]
          typical_lab_duration_minutes?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      timeline_notification_log: {
        Row: {
          created_at: string | null
          days_before: number
          id: string
          notification_id: string | null
          recipient_count: number | null
          recipient_role: string
          sent_at: string | null
          timeline_event_id: string
        }
        Insert: {
          created_at?: string | null
          days_before: number
          id?: string
          notification_id?: string | null
          recipient_count?: number | null
          recipient_role: string
          sent_at?: string | null
          timeline_event_id: string
        }
        Update: {
          created_at?: string | null
          days_before?: number
          id?: string
          notification_id?: string | null
          recipient_count?: number | null
          recipient_role?: string
          sent_at?: string | null
          timeline_event_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_notification_log_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notification"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_notification_log_timeline_event_id_fkey"
            columns: ["timeline_event_id"]
            isOneToOne: false
            referencedRelation: "semester_timeline"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          department: string | null
          email: string
          level: number | null
          name: string
          onboarding_completed: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          student_group_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email: string
          level?: number | null
          name: string
          onboarding_completed?: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          student_group_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string
          level?: number | null
          name?: string
          onboarding_completed?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          student_group_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_student_group_id_fkey"
            columns: ["student_group_id"]
            isOneToOne: false
            referencedRelation: "student_group"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      exam_schedule_conflicts: {
        Row: {
          course1_code: string | null
          course2_code: string | null
          exam_date: string | null
          exam1_id: string | null
          exam1_start: string | null
          exam2_id: string | null
          exam2_start: string | null
          has_student_conflict: boolean | null
          overlap_minutes: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_course_code_fkey"
            columns: ["course1_code"]
            isOneToOne: false
            referencedRelation: "course"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "exam_course_code_fkey"
            columns: ["course2_code"]
            isOneToOne: false
            referencedRelation: "course"
            referencedColumns: ["code"]
          },
        ]
      }
      instructor_workload_summary: {
        Row: {
          email: string | null
          id: string | null
          max_load_per_week: number | null
          name: string | null
          sections: Json | null
          total_sections: number | null
          total_weekly_hours: number | null
          within_load_limit: boolean | null
        }
        Relationships: []
      }
      section_with_enrollment_count: {
        Row: {
          available_seats: number | null
          capacity: number | null
          course_code: string | null
          course_offering_id: string | null
          created_at: string | null
          created_by: string | null
          enrolled_count: number | null
          group_level: number | null
          id: string | null
          instructor_id: string | null
          is_full: boolean | null
          is_scheduled_by_algorithm: boolean | null
          meeting_pattern: Json | null
          room_code: string | null
          section_no: string | null
          state: Database["public"]["Enums"]["section_state"] | null
          updated_at: string | null
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
            foreignKeyName: "section_course_offering_id_fkey"
            columns: ["course_offering_id"]
            isOneToOne: false
            referencedRelation: "course_offering"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructor_workload_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_room_code_fkey"
            columns: ["room_code"]
            isOneToOne: false
            referencedRelation: "room"
            referencedColumns: ["code"]
          },
        ]
      }
    }
    Functions: {
      auto_assign_student_to_group: {
        Args: { p_level: number; p_student_id: string }
        Returns: string
      }
      check_exam_room_conflicts: {
        Args: {
          p_duration: number
          p_exam_date: string
          p_exclude_exam_id?: string
          p_room_codes: string[]
          p_start_time: string
        }
        Returns: {
          conflict_course_code: string
          conflict_exam_id: string
          conflicting_rooms: string[]
        }[]
      }
      check_exam_student_conflicts: {
        Args: {
          p_course_code: string
          p_duration: number
          p_exam_date: string
          p_exclude_exam_id?: string
          p_start_time: string
        }
        Returns: {
          conflict_course_code: string
          conflict_exam_id: string
          conflict_level: number
        }[]
      }
      check_instructor_conflicts: {
        Args: {
          p_days: string[]
          p_duration: number
          p_exclude_section_id?: string
          p_instructor_id: string
          p_start_time: string
        }
        Returns: {
          conflict_course_code: string
          conflict_section_id: string
          conflict_section_no: string
        }[]
      }
      check_room_conflicts: {
        Args: {
          p_days: string[]
          p_duration: number
          p_exclude_section_id?: string
          p_room_code: string
          p_start_time: string
        }
        Returns: {
          conflict_course_code: string
          conflict_section_id: string
          conflict_section_no: string
        }[]
      }
      check_section_capacity: { Args: { p_section_id: string }; Returns: Json }
      check_section_capacity_optimized: {
        Args: { p_section_id: string }
        Returns: Json
      }
      check_student_level_conflicts: {
        Args: {
          p_days: string[]
          p_duration: number
          p_exclude_section_id?: string
          p_group_level: number
          p_start_time: string
        }
        Returns: {
          conflict_course_code: string
          conflict_section_id: string
          conflict_section_no: string
        }[]
      }
      check_student_prerequisites: {
        Args: { p_course_code: string; p_student_id: string }
        Returns: boolean
      }
      complete_onboarding: {
        Args: { p_level?: number; p_user_id: string }
        Returns: Json
      }
      create_instructor_for_user: {
        Args: { p_email: string; p_max_load_per_week?: number; p_name: string }
        Returns: {
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          max_load_per_week: number | null
          name: string
          preferred_times: Json | null
          unavailable_times: Json | null
          updated_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "instructor"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_notification: {
        Args: { p_payload: Json; p_type: string; p_user_id: string }
        Returns: string
      }
      exam_datetime_ranges_overlap: {
        Args: {
          date1: string
          date2: string
          duration1: number
          duration2: number
          start1: string
          start2: string
        }
        Returns: boolean
      }
      get_active_semester: { Args: never; Returns: string }
      get_all_exam_conflicts: {
        Args: never
        Returns: {
          conflicts: Json
          course_code: string
          exam_id: string
        }[]
      }
      get_all_schedule_conflicts: { Args: never; Returns: Json }
      get_available_elective_sections_with_counts: {
        Args: never
        Returns: {
          available_seats: number
          capacity: number
          course_code: string
          course_credits: number
          course_level: number
          course_offering_id: string
          course_title: string
          course_weekly_hours: number
          created_at: string
          enrolled_count: number
          instructor_email: string
          instructor_id: string
          instructor_name: string
          is_full: boolean
          is_scheduled_by_algorithm: boolean
          meeting_pattern: Json
          room_code: string
          section_id: string
          section_no: string
          state: Database["public"]["Enums"]["section_state"]
          updated_at: string
        }[]
      }
      get_cached_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_events_needing_notifications: {
        Args: never
        Returns: {
          category: string
          days_before: number
          description: string
          end_date: string
          event_id: string
          event_type: string
          priority: string
          start_date: string
          target_role: string
          title: string
        }[]
      }
      get_exam_conflicts: { Args: { p_exam_id: string }; Returns: Json }
      get_instructor_by_user_email: {
        Args: { p_user_email: string }
        Returns: {
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          max_load_per_week: number | null
          name: string
          preferred_times: Json | null
          unavailable_times: Json | null
          updated_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "instructor"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_instructor_load: { Args: { p_instructor_id: string }; Returns: Json }
      get_instructor_schedule_with_details: {
        Args: { p_instructor_id: string }
        Returns: {
          capacity: number
          course_code: string
          course_credits: number
          course_title: string
          enrolled_count: number
          exam_date: string
          exam_duration_minutes: number
          exam_start_time: string
          meeting_pattern: Json
          room_code: string
          section_id: string
          section_no: string
          state: Database["public"]["Enums"]["section_state"]
        }[]
      }
      get_level_statistics: { Args: { p_level: number }; Returns: Json }
      get_overdue_events: {
        Args: never
        Returns: {
          days_overdue: number
          description: string
          end_date: string
          event_type: string
          id: string
          priority: string
          target_roles: string[]
          title: string
        }[]
      }
      get_section_conflicts: { Args: { p_section_id: string }; Returns: Json }
      get_student_complete_schedule: {
        Args: { p_student_id: string }
        Returns: {
          course_code: string
          course_credits: number
          course_level: number
          course_title: string
          enrollment_type: string
          exam_date: string
          exam_room_codes: string[]
          exam_start_time: string
          instructor_email: string
          instructor_name: string
          is_elective: boolean
          meeting_pattern: Json
          room_code: string
          section_id: string
          section_no: string
        }[]
      }
      get_student_required_courses: {
        Args: { p_student_id: string }
        Returns: string[]
      }
      get_student_total_credits: {
        Args: { p_student_id: string }
        Returns: Json
      }
      get_timeline_statistics: {
        Args: { semester_code?: string }
        Returns: {
          completed_events: number
          critical_priority_count: number
          high_priority_count: number
          in_progress_events: number
          overdue_events: number
          total_events: number
          upcoming_events: number
        }[]
      }
      get_upcoming_deadlines_for_role: {
        Args: { days_ahead?: number; role_name: string }
        Returns: {
          days_until_end: number
          days_until_start: number
          description: string
          end_date: string
          event_type: string
          id: string
          priority: string
          requires_action: boolean
          start_date: string
          status: string
          title: string
        }[]
      }
      get_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_any_role: {
        Args: { check_roles: Database["public"]["Enums"]["user_role"][] }
        Returns: boolean
      }
      has_any_role_cached: {
        Args: { check_roles: Database["public"]["Enums"]["user_role"][] }
        Returns: boolean
      }
      has_notification_been_sent: {
        Args: { days_before_value: number; event_id: string; role_name: string }
        Returns: boolean
      }
      has_role: {
        Args: { check_role: Database["public"]["Enums"]["user_role"] }
        Returns: boolean
      }
      has_role_cached: {
        Args: { check_role: Database["public"]["Enums"]["user_role"] }
        Returns: boolean
      }
      is_elective_survey_open: { Args: never; Returns: boolean }
      is_irregular_student: { Args: { p_student_id: string }; Returns: boolean }
      is_registration_open: { Args: never; Returns: boolean }
      needs_onboarding: { Args: { p_user_id: string }; Returns: boolean }
      set_user_role_context: { Args: never; Returns: undefined }
      sync_student_groups: { Args: never; Returns: undefined }
      time_ranges_overlap: {
        Args: {
          duration1: number
          duration2: number
          start1: string
          start2: string
        }
        Returns: boolean
      }
      update_timeline_event_statuses: { Args: never; Returns: number }
      user_is_section_instructor: {
        Args: { p_section_id: string; p_user_id: string }
        Returns: boolean
      }
      user_owns_instructor_profile: {
        Args: { p_instructor_id: string }
        Returns: boolean
      }
      validate_enrollment: {
        Args: { p_section_id: string; p_student_id: string }
        Returns: Json
      }
    }
    Enums: {
      enrollment_status: "registered" | "dropped"
      room_type: "Lecture" | "Lab"
      section_state: "draft" | "released"
      user_role:
        | "scheduling"
        | "teaching_load"
        | "faculty"
        | "student"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      enrollment_status: ["registered", "dropped"],
      room_type: ["Lecture", "Lab"],
      section_state: ["draft", "released"],
      user_role: [
        "scheduling",
        "teaching_load",
        "faculty",
        "student",
        "registrar",
      ],
    },
  },
} as const

