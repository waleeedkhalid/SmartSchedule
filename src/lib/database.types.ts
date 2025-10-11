// Auto-generated via Supabase MCP generate types (trimmed to public schema)
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      user: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          role: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["user"]["Insert"]>;
        Relationships: [];
      };
      students: {
        Row: {
          id: string;
          user_id: string;
          student_id: string;
          name: string;
          email: string;
          level: number;
          major: string;
          gpa: string | null;
          completed_credits: number | null;
          total_credits: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          student_id: string;
          name: string;
          email: string;
          level?: number;
          major?: string;
          gpa?: string | null;
          completed_credits?: number | null;
          total_credits?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["students"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "students_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "user";
            referencedColumns: ["id"];
          }
        ];
      };
      course: {
        Row: {
          code: string;
          name: string;
          credits: number;
          level: number;
          type: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          code: string;
          name: string;
          credits: number;
          level: number;
          type: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["course"]["Insert"]>;
        Relationships: [];
      };
      time_slot: {
        Row: {
          id: string;
          day_of_week: string;
          start_time: string;
          end_time: string;
          kind: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          day_of_week: string;
          start_time: string;
          end_time: string;
          kind: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["time_slot"]["Insert"]>;
        Relationships: [];
      };
      section: {
        Row: {
          id: string;
          course_code: string;
          instructor_id: string;
          capacity: number;
          time_slot_id: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          course_code: string;
          instructor_id: string;
          capacity: number;
          time_slot_id: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["section"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "section_course_code_fkey";
            columns: ["course_code"];
            isOneToOne: false;
            referencedRelation: "course";
            referencedColumns: ["code"];
          },
          {
            foreignKeyName: "section_time_slot_id_fkey";
            columns: ["time_slot_id"];
            isOneToOne: false;
            referencedRelation: "time_slot";
            referencedColumns: ["id"];
          }
        ];
      };
      schedule: {
        Row: {
          id: string;
          semester: string;
          version: number | null;
          created_by: string;
          status: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          semester: string;
          version?: number | null;
          created_by: string;
          status?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["schedule"]["Insert"]>;
        Relationships: [];
      };
      schedule_item: {
        Row: {
          id: string;
          schedule_id: string;
          course_code: string;
          section_id: string | null;
          instructor_id: string | null;
          time_slot_id: string;
          kind: string;
          room: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          schedule_id: string;
          course_code: string;
          section_id?: string | null;
          instructor_id?: string | null;
          time_slot_id: string;
          kind: string;
          room?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["schedule_item"]["Insert"]
        >;
        Relationships: [];
      };
      rule: {
        Row: {
          id: string;
          rule_name: string;
          description: string;
          active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          rule_name: string;
          description: string;
          active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["rule"]["Insert"]>;
        Relationships: [];
      };
      rule_activation: {
        Row: {
          id: string;
          rule_id: string;
          value_json: Json | null;
          modified_by: string;
          modified_at: string | null;
        };
        Insert: {
          id?: string;
          rule_id: string;
          value_json?: Json | null;
          modified_by: string;
          modified_at?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["rule_activation"]["Insert"]
        >;
        Relationships: [];
      };
      feedback: {
        Row: {
          id: string;
          user_id: string;
          schedule_id: string;
          comment: string | null;
          rating: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          schedule_id: string;
          comment?: string | null;
          rating?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["feedback"]["Insert"]>;
        Relationships: [];
      };
      elective_preferences: {
        Row: {
          id: string;
          student_id: string;
          elective_choices: Json;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          student_id: string;
          elective_choices: Json;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["elective_preferences"]["Insert"]
        >;
        Relationships: [];
      };
      registration: {
        Row: {
          id: string;
          student_id: string;
          section_id: string;
          status: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          student_id: string;
          section_id: string;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["registration"]["Insert"]>;
        Relationships: [];
      };
      notification: {
        Row: {
          id: string;
          user_id: string;
          message: string;
          read: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          message: string;
          read?: boolean | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["notification"]["Insert"]>;
        Relationships: [];
      };
      load_assignment: {
        Row: {
          id: string;
          faculty_id: string;
          course_code: string;
          hours: number;
          approved_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          faculty_id: string;
          course_code: string;
          hours: number;
          approved_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["load_assignment"]["Insert"]
        >;
        Relationships: [];
      };
      external_course: {
        Row: {
          id: string;
          code: string;
          name: string;
          department: string;
          time_slot_id: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          department: string;
          time_slot_id: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["external_course"]["Insert"]
        >;
        Relationships: [];
      };
      irregular_student: {
        Row: {
          id: string;
          student_id: string;
          remaining_courses: Json;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          student_id: string;
          remaining_courses: Json;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["irregular_student"]["Insert"]
        >;
        Relationships: [];
      };
      version_history: {
        Row: {
          id: string;
          schedule_id: string;
          diff_json: Json;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          schedule_id: string;
          diff_json: Json;
          created_at?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["version_history"]["Insert"]
        >;
        Relationships: [];
      };
      faculty_availability: {
        Row: {
          id: string;
          faculty_id: string;
          day_of_week: string | null;
          start_time: string;
          end_time: string;
          available: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          faculty_id: string;
          day_of_week?: string | null;
          start_time: string;
          end_time: string;
          available?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["faculty_availability"]["Insert"]
        >;
        Relationships: [];
      };
      student_preferences: {
        Row: {
          id: string;
          student_id: string;
          preferred_times: Json | null;
          disliked_times: Json | null;
          elective_choices: Json | null;
          instructor_preferences: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          student_id: string;
          preferred_times?: Json | null;
          disliked_times?: Json | null;
          elective_choices?: Json | null;
          instructor_preferences?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["student_preferences"]["Insert"]
        >;
        Relationships: [];
      };
      scheduling_task: {
        Row: {
          id: string;
          schedule_id: string | null;
          initiated_by: string | null;
          status: string | null;
          parameters: Json | null;
          result_summary: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          schedule_id?: string | null;
          initiated_by?: string | null;
          status?: string | null;
          parameters?: Json | null;
          result_summary?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["scheduling_task"]["Insert"]
        >;
        Relationships: [];
      };
      swe_plan: {
        Row: {
          id: string;
          course_code: string;
          course_name: string;
          credits: number;
          level: number;
          type: string; // 'REQUIRED' | 'ELECTIVE'
          prerequisites: string[] | null;
          is_active: boolean | null;
          updated_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          course_code: string;
          course_name: string;
          credits: number;
          level: number;
          type: string;
          prerequisites?: string[] | null;
          is_active?: boolean | null;
          updated_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["swe_plan"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "swe_plan_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type PublicTables = Database["public"]["Tables"];
export type TableRow<T extends keyof PublicTables> = PublicTables[T]["Row"];
export type TableInsert<T extends keyof PublicTables> =
  PublicTables[T]["Insert"];
export type TableUpdate<T extends keyof PublicTables> =
  PublicTables[T]["Update"];
