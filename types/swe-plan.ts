export interface SWEPlan {
  id: string;
  course_code: string;
  course_name: string;
  credits: number;
  level: number;
  type: "REQUIRED" | "ELECTIVE";
  prerequisites: string[];
  is_active: boolean;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}
