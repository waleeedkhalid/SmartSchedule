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
        }
        Relationships: []
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
          id: string
          status: string
          student_id: string
          term_code: string
          updated_at: string | null
        }
        Insert: {
          course_code: string
          created_at?: string | null
          id?: string
          status?: string
          student_id: string
          term_code: string
          updated_at?: string | null
        }
        Update: {
          course_code?: string
          created_at?: string | null
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
      faculty: {
        Row: {
          created_at: string | null
          faculty_number: string
          id: string
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          faculty_number: string
          id: string
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          faculty_number?: string
          id?: string
          status?: string | null
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
          status: string | null
          student_number: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_term?: string | null
          id: string
          level: number
          setup_completed?: boolean | null
          status?: string | null
          student_number: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_term?: string | null
          id?: string
          level?: number
          setup_completed?: boolean | null
          status?: string | null
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
      refresh_student_package_progress: {
        Args: { p_student_id: string }
        Returns: undefined
      }
    }
    Enums: {
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
    },
  },
} as const

// Custom type exports for convenience
export type AcademicTerm = Tables<"academic_term">
export type FacultyAvailability = Tables<"faculty_availability">
export type TermEvent = Tables<"term_events">
export type DayOfWeek = "SUNDAY" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY"