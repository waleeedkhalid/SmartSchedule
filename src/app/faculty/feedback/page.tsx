/**
 * Faculty Feedback Page (Optimized)
 * 
 * Performance Optimizations:
 * - Server-side data fetching with React.cache()
 * - Check feedback availability on server
 * - Pass data as props (no client-side useEffect)
 */

import { redirect } from "next/navigation";
import { cache } from "react";
import { redirectByRole, type UserRole } from "@/lib/auth/redirect-by-role";
import { createServerClient } from "@/lib/supabase/server";
import { getAuthenticatedUser, getUserProfile } from "@/lib/auth/cached-auth";
import FacultyFeedbackClient from "./FacultyFeedbackClient";

// ✅ OPTIMIZED: Cached server-side data fetching
const getFacultyFeedback = cache(async (userId: string) => {
  const supabase = await createServerClient();

  // Check if feedback is open
  const { data: activeTerm } = await supabase
    .from("academic_term")
    .select("is_faculty_feedback_visible, is_active")
    .eq("is_active", true)
    .maybeSingle();

  if (!activeTerm?.is_faculty_feedback_visible) {
    return {
      feedbackData: null,
      feedbackLocked: true,
      error: "Student feedback is currently being collected. Results will be available once the feedback period closes.",
    };
  }

  // Fetch sections taught by this faculty
  const { data: sections } = await supabase
    .from("section")
    .select(`
      section_id,
      course_code,
      capacity,
      course:course_code (
        course_code,
        course_name,
        credits
      )
    `)
    .eq("instructor_id", userId);

  if (!sections || sections.length === 0) {
    return {
      feedbackData: {
        courseFeedback: [],
        overallStats: {
          totalCourses: 0,
          totalEnrolled: 0,
          totalResponses: 0,
          averageRating: 0,
          responseRate: 0,
        },
      },
      feedbackLocked: false,
      error: null,
    };
  }

  // Get feedback for these sections
  const sectionIds = sections.map(s => s.section_id);
  const { data: feedback } = await supabase
    .from("feedback")
    .select("section_id, rating, text_feedback, submitted_at")
    .in("section_id", sectionIds);

  // Get enrollment counts
  const { data: enrollments } = await supabase
    .from("enrollment")
    .select("section_id")
    .in("section_id", sectionIds);

  const enrollmentCounts = enrollments?.reduce((acc, e) => {
    acc[e.section_id] = (acc[e.section_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Organize feedback by section
  const courseFeedback = sections.map((section: any) => {
    const sectionFeedback = feedback?.filter(f => f.section_id === section.section_id) || [];
    const enrolledCount = enrollmentCounts[section.section_id] || 0;
    const responseCount = sectionFeedback.length;
    const responseRate = enrolledCount > 0 ? Math.round((responseCount / enrolledCount) * 100) : 0;

    const ratings = sectionFeedback.map(f => f.rating).filter(Boolean);
    const averageRating = ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach(r => {
      if (r >= 1 && r <= 5) {
        ratingDistribution[r as keyof typeof ratingDistribution]++;
      }
    });

    const textFeedback = sectionFeedback
      .filter(f => f.text_feedback)
      .map(f => ({
        text: f.text_feedback,
        rating: f.rating,
        submittedAt: f.submitted_at,
      }));

    return {
      courseCode: section.course_code,
      courseName: section.course?.course_name || "",
      credits: section.course?.credits || 0,
      sectionId: section.section_id,
      enrolledCount,
      responseCount,
      responseRate,
      averageRating: Number(averageRating.toFixed(1)),
      ratingDistribution,
      textFeedback,
    };
  });

  // Calculate overall stats
  const totalEnrolled = Object.values(enrollmentCounts).reduce((a, b) => a + b, 0);
  const totalResponses = courseFeedback.reduce((a, c) => a + c.responseCount, 0);
  const avgRating = courseFeedback.length > 0
    ? courseFeedback.reduce((a, c) => a + c.averageRating, 0) / courseFeedback.length
    : 0;
  const overallResponseRate = totalEnrolled > 0
    ? Math.round((totalResponses / totalEnrolled) * 100)
    : 0;

  return {
    feedbackData: {
      courseFeedback,
      overallStats: {
        totalCourses: sections.length,
        totalEnrolled,
        totalResponses,
        averageRating: Number(avgRating.toFixed(1)),
        responseRate: overallResponseRate,
      },
    },
    feedbackLocked: false,
    error: null,
  };
});

export default async function FacultyFeedbackPage() {
  // Use cached auth functions
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const profile = await getUserProfile();
  const role = profile?.role as UserRole | undefined;

  if (role !== "faculty") {
    redirect(redirectByRole(role));
  }

  // ✅ OPTIMIZED: Fetch data server-side
  const { feedbackData, feedbackLocked, error } = await getFacultyFeedback(user.id);

  return (
    <FacultyFeedbackClient
      feedbackData={feedbackData}
      feedbackLocked={feedbackLocked}
      error={error}
    />
  );
}
