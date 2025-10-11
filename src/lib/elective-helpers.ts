import {
  electiveSubmissionPayloadSchema,
  dbElectivePreferenceSchema,
  dbElectiveSubmissionSchema,
} from "@/lib/validators/electives";

export type ElectiveSubmissionPayload = {
  studentId: string;
  selections: { packageId: string; courseCode: string; priority: number }[];
};

export function validateElectiveSubmissionPayload(
  payload: unknown
): ElectiveSubmissionPayload {
  return electiveSubmissionPayloadSchema.parse(payload);
}

export function buildSubmissionRow(
  studentUuid: string,
  submissionId: string,
  timestampISO: string
) {
  const candidate = {
    id: "00000000-0000-0000-0000-000000000000", // placeholder, ignored by DB default
    student_id: studentUuid,
    submission_id: submissionId,
    submitted_at: timestampISO,
    status: "submitted",
    created_at: timestampISO,
    updated_at: timestampISO,
  };
  // Validate shape (ignores id default at insert time)
  dbElectiveSubmissionSchema.partial({ id: true }).parse(candidate);
  return {
    student_id: candidate.student_id,
    submission_id: candidate.submission_id,
    submitted_at: candidate.submitted_at,
    status: candidate.status,
    created_at: candidate.created_at,
    updated_at: candidate.updated_at,
  };
}

export function buildPreferenceRows(
  submissionUuid: string,
  studentUuid: string,
  selections: ElectiveSubmissionPayload["selections"]
) {
  const rows = selections.map((s) => ({
    submission_id: submissionUuid,
    student_id: studentUuid,
    course_code: s.courseCode,
    package_id: s.packageId,
    priority: s.priority,
    created_at: new Date().toISOString(),
  }));
  // Validate each row shape
  rows.forEach((r) =>
    dbElectivePreferenceSchema.partial({ id: true }).parse(r)
  );
  return rows;
}

export function groupSelectionsByPackage(
  selections: ElectiveSubmissionPayload["selections"]
): Record<string, { courseCode: string; priority: number }[]> {
  return selections.reduce((acc, s) => {
    if (!acc[s.packageId]) acc[s.packageId] = [];
    acc[s.packageId].push({ courseCode: s.courseCode, priority: s.priority });
    return acc;
  }, {} as Record<string, { courseCode: string; priority: number }[]>);
}
