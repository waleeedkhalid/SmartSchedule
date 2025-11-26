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
          created_by: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: Database["public"]["Enums"]["schedule_status"]
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["schedule_status"]
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["schedule_status"]
          updated_at?: string | null
        }
        Relationships: []
      }
      committee_profile: {
        Row: {
          committee_role: string | null
          created_at: string | null
          department: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          committee_role?: string | null
          created_at?: string | null
          department?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          committee_role?: string | null
          created_at?: string | null
          department?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      course: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          credits: number
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
          is_elective?: boolean
          level?: number
          title?: string
          updated_at?: string | null
          weekly_hours?: number
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
      faculty_profile: {
        Row: {
          created_at: string | null
          department: string
          instructor_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          department?: string
          instructor_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          department?: string
          instructor_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "faculty_profile_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructor"
            referencedColumns: ["id"]
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
        }
        Relationships: []
      }
      room: {
        Row: {
          capacity: number | null
          code: string
          created_at: string | null
          created_by: string | null
          type: Database["public"]["Enums"]["room_type"]
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          code: string
          created_at?: string | null
          created_by?: string | null
          type: Database["public"]["Enums"]["room_type"]
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          type?: Database["public"]["Enums"]["room_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      schedule: {
        Row: {
          created_at: string | null
          id: string
          section_id: string
          term_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          section_id: string
          term_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          section_id?: string
          term_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "section"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "academic_term"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_comment: {
        Row: {
          author_id: string
          comment_text: string
          created_at: string | null
          id: string
          is_resolved: boolean | null
          rating: number | null
          resolved_at: string | null
          resolved_by: string | null
          schedule_id: string | null
          section_id: string | null
          updated_at: string | null
        }
        Insert: {
          author_id: string
          comment_text: string
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          rating?: number | null
          resolved_at?: string | null
          resolved_by?: string | null
          schedule_id?: string | null
          section_id?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          comment_text?: string
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          rating?: number | null
          resolved_at?: string | null
          resolved_by?: string | null
          schedule_id?: string | null
          section_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_comment_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedule"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_comment_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "section"
            referencedColumns: ["id"]
          },
        ]
      }
      section: {
        Row: {
          activity: string | null
          capacity: number
          course_code: string
          created_at: string | null
          created_by: string | null
          group_level: number
          id: string
          instructor_id: string | null
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
          created_at?: string | null
          created_by?: string | null
          group_level: number
          id?: string
          instructor_id?: string | null
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
          created_at?: string | null
          created_by?: string | null
          group_level?: number
          id?: string
          instructor_id?: string | null
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
            foreignKeyName: "section_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructor"
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
      student_enrollment: {
        Row: {
          dropped_at: string | null
          enrolled_at: string | null
          id: string
          section_id: string
          status: Database["public"]["Enums"]["enrollment_status"]
          student_id: string
        }
        Insert: {
          dropped_at?: string | null
          enrolled_at?: string | null
          id?: string
          section_id: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_id: string
        }
        Update: {
          dropped_at?: string | null
          enrolled_at?: string | null
          id?: string
          section_id?: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_enrollment_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "section"
            referencedColumns: ["id"]
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
          size?: number
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
      student_profile: {
        Row: {
          created_at: string | null
          department: string
          level: number
          student_group_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          department?: string
          level: number
          student_group_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          department?: string
          level?: number
          student_group_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_profile_student_group_id_fkey"
            columns: ["student_group_id"]
            isOneToOne: false
            referencedRelation: "student_group"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          email: string
          level: number | null
          name: string
          onboarding_completed: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          level?: number | null
          name: string
          onboarding_completed?: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          level?: number | null
          name?: string
          onboarding_completed?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_assign_student_to_group: {
        Args: { p_level: number; p_student_id: string }
        Returns: string
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
      create_instructor_for_user: {
        Args: {
          p_email: string
          p_max_load_per_week?: number
          p_name: string
          p_user_id: string
        }
        Returns: string
      }
      get_level_statistics: { Args: { p_level: number }; Returns: Json }
      get_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_any_role: {
        Args: { check_roles: Database["public"]["Enums"]["user_role"][] }
        Returns: boolean
      }
      has_role: {
        Args: { check_role: Database["public"]["Enums"]["user_role"] }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_registrar_or_admin: { Args: never; Returns: boolean }
      time_ranges_overlap: {
        Args: {
          duration1: number
          duration2: number
          start1: string
          start2: string
        }
        Returns: boolean
      }
    }
    Enums: {
      enrollment_status: "registered" | "dropped"
      room_type: "Lecture" | "Lab"
      schedule_status:
        | "draft"
        | "submitted_to_teaching_load"
        | "submitted_to_students_faculty"
        | "released"
        | "cancelled"
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
    | { schema: keyof DatabaseWithoutInternals }
    | keyof DefaultSchema["Tables"],
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
      enrollment_status: ["registered", "dropped"],
      room_type: ["Lecture", "Lab"],
      schedule_status: [
        "draft",
        "submitted_to_teaching_load",
        "submitted_to_students_faculty",
        "released",
        "cancelled",
      ],
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
