/**
 * Custom Hook: Student Management
 * Reusable hook for fetching and managing student data
 * Follows patterns from data-fetching.mdc
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import type { StudentsByLevel, ApiResponse } from "@/types/scheduler";

interface UseStudentManagementOptions {
  termCode: string;
  autoLoad?: boolean;
}

interface UseStudentManagementReturn {
  data: StudentsByLevel[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  loadStudents: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useStudentManagement({
  termCode,
  autoLoad = true,
}: UseStudentManagementOptions): UseStudentManagementReturn {
  const [data, setData] = useState<StudentsByLevel[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    if (!termCode) {
      setError("Term code is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/committee/students?term_code=${encodeURIComponent(termCode)}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to load students");
      }

      const result: ApiResponse<{
        byLevel: StudentsByLevel[];
        total: number;
      }> = await response.json();

      setData(result.data?.byLevel || []);
      setTotalCount(result.data?.total || 0);
    } catch (err) {
      console.error("Error loading students:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load students";
      setError(errorMessage);
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [termCode]);

  // Auto-load on mount and when termCode changes
  useEffect(() => {
    if (autoLoad) {
      loadStudents();
    }
  }, [autoLoad, loadStudents]);

  return {
    data,
    totalCount,
    loading,
    error,
    loadStudents,
    refetch: loadStudents,
  };
}

