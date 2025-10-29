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
      comment: {
        Row: {
          author_id: string
          created_at: string | null
          doc_id: string | null
          id: string
          is_resolved: boolean | null
          target_ref: string
          text: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          created_at?: string | null
          doc_id?: string | null
          id?: string
          is_resolved?: boolean | null
          target_ref: string
          text: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          created_at?: string | null
          doc_id?: string | null
          id?: string
          is_resolved?: boolean | null
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
      exam: {
        Row: {
          academic_semester_id: string
          course_code: string
          created_at: string | null
          created_by: string | null
          date: string
          duration_minutes: number
          exam_type: string
          id: string
          room_codes: string[]
          start_time: string
          updated_at: string | null
        }
        Insert: {
          academic_semester_id: string
          course_code: string
          created_at?: string | null
          created_by?: string | null
          date: string
          duration_minutes: number
          exam_type: string
          id?: string
          room_codes?: string[]
          start_time: string
          updated_at?: string | null
        }
        Update: {
          academic_semester_id?: string
          course_code?: string
          created_at?: string | null
          created_by?: string | null
          date?: string
          duration_minutes?: number
          exam_type?: string
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
          academic_semester_id: string
          activity: string | null
          capacity: number
          course_code: string
          created_at: string | null
          created_by: string | null
          current_enrollment: number
          group_level: number
          id: string
          instructor_id: string | null
          meeting_pattern: Json
          room_code: string | null
          section_no: string
          section_type: string
          state: Database["public"]["Enums"]["section_state"]
          updated_at: string | null
        }
        Insert: {
          academic_semester_id: string
          activity?: string | null
          capacity: number
          course_code: string
          created_at?: string | null
          created_by?: string | null
          current_enrollment?: number
          group_level: number
          id?: string
          instructor_id?: string | null
          meeting_pattern?: Json
          room_code?: string | null
          section_no: string
          section_type?: string
          state?: Database["public"]["Enums"]["section_state"]
          updated_at?: string | null
        }
        Update: {
          academic_semester_id?: string
          activity?: string | null
          capacity?: number
          course_code?: string
          created_at?: string | null
          created_by?: string | null
          current_enrollment?: number
          group_level?: number
          id?: string
          instructor_id?: string | null
          meeting_pattern?: Json
          room_code?: string | null
          section_no?: string
          section_type?: string
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
      user_roles: {
        Row: {
          created_at: string | null
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
      create_notification: {
        Args: { p_payload: Json; p_type: string; p_user_id: string }
        Returns: string
      }
      get_all_schedule_conflicts: { Args: never; Returns: Json }
      get_instructor_load: { Args: { p_instructor_id: string }; Returns: Json }
      get_level_statistics: { Args: { p_level: number }; Returns: Json }
      get_section_conflicts: { Args: { p_section_id: string }; Returns: Json }
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
  public: {
    Enums: {
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

// Convenience type exports
export type UserRoleRow = Database['public']['Tables']['user_roles']['Row']
export type Course = Database['public']['Tables']['course']['Row']
export type Exam = Database['public']['Tables']['exam']['Row']
export type Instructor = Database['public']['Tables']['instructor']['Row']
export type Room = Database['public']['Tables']['room']['Row']
export type Section = Database['public']['Tables']['section']['Row']
export type StudentGroup = Database['public']['Tables']['student_group']['Row']

// Input types for database operations
export type CourseInput = Database['public']['Tables']['course']['Insert']
export type ExamInput = Database['public']['Tables']['exam']['Insert']
export type SectionInput = Database['public']['Tables']['section']['Insert']

// Custom types for RPC function returns
export type SectionConflicts = {
  instructor_conflicts?: Array<{ conflict_section_id: string; conflict_course_code: string; conflict_section_no: string }>;
  room_conflicts?: Array<{ conflict_section_id: string; conflict_course_code: string; conflict_section_no: string }>;
  student_conflicts?: Array<{ conflict_section_id: string; conflict_course_code: string; conflict_section_no: string }>;
}
