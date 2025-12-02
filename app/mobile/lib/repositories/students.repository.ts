/**
 * Students Repository
 * 
 * Handles student-related API calls for registrars.
 */

import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type { AcademicPlanCourse } from "../api/types";

export interface Student {
    id: string;
    name: string;
    email: string;
    student_id_number?: string;
    level?: number;
    program?: string;
}

export class StudentsRepository {
    /**
     * Search students
     */
    async searchStudents(query: string): Promise<Student[]> {
        const url = `${API_ENDPOINTS.STUDENTS.LIST}?query=${encodeURIComponent(query)}`;
        return apiClient.get<Student[]>(url);
    }

    /**
     * Get student details
     */
    async getStudent(id: string): Promise<Student> {
        return apiClient.get<Student>(API_ENDPOINTS.STUDENTS.DETAIL(id));
    }

    /**
     * Get student's academic plan
     */
    async getStudentAcademicPlan(id: string): Promise<AcademicPlanCourse[]> {
        return apiClient.get<AcademicPlanCourse[]>(API_ENDPOINTS.STUDENTS.ACADEMIC_PLAN(id));
    }
}

export const studentsRepository = new StudentsRepository();
