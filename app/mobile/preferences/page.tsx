/**
 * Elective Preferences Page (Mobile)
 * 
 * Allows students to select and rank their preferred elective courses.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/mobile/lib/stores/auth.store";
import {
  electivePreferencesRepository,
  type ElectivePreference,
  type AvailableElective,
} from "@/app/mobile/lib/repositories/elective-preferences.repository";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, BookOpen, Plus, X, ArrowLeft, Save, RotateCcw, GripVertical } from "lucide-react";
import { toast } from "sonner";

export default function PreferencesPage() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [preferences, setPreferences] = useState<ElectivePreference[]>([]);
  const [availableElectives, setAvailableElectives] = useState<AvailableElective[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [initialPreferences, setInitialPreferences] = useState<ElectivePreference[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      checkAuth();
    }
  }, [isAuthenticated, checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/mobile/login");
      return;
    }

    if (user?.role !== "student") {
      router.push("/mobile/schedule");
      return;
    }

    loadPreferences();
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    const changed =
      JSON.stringify(preferences.map((p) => ({ course_code: p.course_code, rank: p.rank }))) !==
      JSON.stringify(initialPreferences.map((p) => ({ course_code: p.course_code, rank: p.rank })));
    setHasChanges(changed);
  }, [preferences, initialPreferences]);

  const loadPreferences = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await electivePreferencesRepository.getPreferences();
      setPreferences(data.preferences || []);
      setInitialPreferences(data.preferences || []);
      setAvailableElectives(data.availableElectives || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load preferences";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const addPreference = (course: AvailableElective) => {
    if (preferences.some((p) => p.course_code === course.code)) {
      toast.error("Course already in your preferences");
      return;
    }

    const newRank = preferences.length + 1;
    setPreferences([
      ...preferences,
      {
        id: `temp-${Date.now()}`,
        course_code: course.code,
        rank: newRank,
        course: {
          code: course.code,
          title: course.title,
          recommended_level: course.recommended_level,
          credits: course.credits,
          is_elective: course.is_elective,
        },
      },
    ]);
    toast.success(`${course.code} added to preferences!`);
  };

  const removePreference = (courseCode: string) => {
    const filtered = preferences
      .filter((p) => p.course_code !== courseCode)
      .map((p, index) => ({ ...p, rank: index + 1 }));
    setPreferences(filtered);
    toast.info("Course removed from preferences");
  };

  const resetChanges = () => {
    setPreferences(initialPreferences);
    toast.info("Changes reset");
  };

  const savePreferences = async () => {
    setIsSaving(true);
    try {
      await electivePreferencesRepository.updatePreferences(
        preferences.map((p) => ({
          course_code: p.course_code,
          rank: p.rank,
        }))
      );
      toast.success("Preferences saved successfully!");
      setHasChanges(false);
      // Reload to get updated data
      await loadPreferences();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save preferences";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCodes = new Set(preferences.map((p) => p.course_code));
  const filteredElectives = availableElectives.filter(
    (course) =>
      !selectedCodes.has(course.code) &&
      (searchQuery === "" ||
        course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isAuthenticated || !user || user.role !== "student") {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/mobile/schedule")}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Heart className="h-6 w-6 text-pink-600" />
                <div>
                  <CardTitle>Elective Preferences</CardTitle>
                  <CardDescription>
                    Select and rank your preferred elective courses
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline">
                {preferences.length} selected
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="py-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button variant="outline" onClick={loadPreferences}>
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Preferences Content */}
        {!isLoading && !error && (
          <div className="space-y-4">
            {/* My Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-500" />
                  My Preferences (Ranked)
                </CardTitle>
                <CardDescription>
                  Drag to reorder. Your top choice is #1.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {preferences.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Heart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No preferences yet</p>
                    <p className="text-sm mt-1">Add courses from below</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {preferences.map((pref, index) => (
                        <div
                          key={pref.course_code}
                          className="flex items-center gap-2 p-3 border rounded-lg bg-card"
                        >
                          <div className="flex-shrink-0">
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 text-white flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">
                              {pref.course?.code || pref.course_code}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {pref.course?.title}
                            </p>
                            <div className="flex gap-2 mt-1">
                              {pref.course?.recommended_level && (
                                <Badge variant="outline" className="text-xs">
                                  Level {pref.course.recommended_level}
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {pref.course?.credits} cr
                              </Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removePreference(pref.course_code)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    {preferences.length > 0 && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={savePreferences}
                          disabled={!hasChanges || isSaving}
                          className="flex-1"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          {isSaving ? "Saving..." : "Save Preferences"}
                        </Button>
                        {hasChanges && (
                          <Button
                            onClick={resetChanges}
                            variant="outline"
                            disabled={isSaving}
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reset
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Available Electives */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  Available Electives
                </CardTitle>
                <CardDescription>
                  Search and add courses to your preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />

                {filteredElectives.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>
                      {searchQuery ? "No courses found" : "All electives added!"}
                    </p>
                    <p className="text-sm mt-1">
                      {searchQuery
                        ? "Try a different search"
                        : "You've selected all available courses"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {filteredElectives.map((course) => (
                      <div
                        key={course.code}
                        className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-all"
                      >
                        <div className="flex-1 min-w-0 mr-3">
                          <p className="font-semibold text-sm truncate">
                            {course.code}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {course.title}
                          </p>
                          <div className="flex gap-2 mt-1">
                            {course.recommended_level && (
                              <Badge variant="secondary" className="text-xs">
                                Level {course.recommended_level}
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {course.credits} cr
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addPreference(course)}
                          className="flex-shrink-0"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/mobile/schedule")}
            className="flex-1"
          >
            Back to Schedule
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/mobile/academic-plan")}
            className="flex-1"
          >
            Academic Plan
          </Button>
        </div>
      </div>
    </div>
  );
}

