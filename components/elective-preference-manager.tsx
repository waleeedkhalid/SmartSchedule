"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Course } from "@/lib/types/database";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  GripVertical,
  X, 
  Plus, 
  Heart,
  BookOpen,
  Save,
  RotateCcw,
  Info,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { CourseDetailDialog } from "./course-detail-dialog";

interface PreferenceItem {
  course_code: string;
  rank: number;
  course?: Course;
}

interface ElectivePreferenceManagerProps {
  initialPreferences: PreferenceItem[];
  availableElectives: Course[];
}

interface SortablePreferenceItemProps {
  pref: PreferenceItem;
  index: number;
  onRemove: (courseCode: string) => void;
  onShowDetails: (course: Course) => void;
}

function SortablePreferenceItem({ pref, index, onRemove, onShowDetails }: SortablePreferenceItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pref.course_code });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center gap-2 p-3 border rounded-lg bg-white dark:bg-gray-900 hover:shadow-md transition-all ${
        isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center font-bold text-lg shadow-md">
        {index + 1}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{pref.course?.code || pref.course_code}</p>
        <p className="text-sm text-muted-foreground truncate">
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
          <Badge variant="outline" className="text-xs">
            {pref.course?.weekly_hours}h/wk
          </Badge>
        </div>
      </div>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={() => pref.course && onShowDetails(pref.course)}
        className="h-8 w-8 p-0"
      >
        <Info className="h-4 w-4" />
      </Button>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onRemove(pref.course_code)}
        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
      >
        <X className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}

export function ElectivePreferenceManager({
  initialPreferences,
  availableElectives,
}: ElectivePreferenceManagerProps) {
  const [preferences, setPreferences] = useState<PreferenceItem[]>(initialPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const changed = JSON.stringify(preferences) !== JSON.stringify(initialPreferences);
    setHasChanges(changed);
  }, [preferences, initialPreferences]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPreferences((items) => {
        const oldIndex = items.findIndex(item => item.course_code === active.id);
        const newIndex = items.findIndex(item => item.course_code === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update ranks
        return newItems.map((item, index) => ({
          ...item,
          rank: index + 1
        }));
      });
    }
  };

  const addPreference = (course: Course) => {
    if (preferences.some(p => p.course_code === course.code)) {
      toast.error("Course already in your preferences");
      return;
    }

    const newRank = preferences.length + 1;
    setPreferences([
      ...preferences,
      {
        course_code: course.code,
        rank: newRank,
        course,
      },
    ]);
    toast.success(`${course.code} added to preferences!`, {
      icon: <Sparkles className="h-4 w-4" />,
    });
  };

  const removePreference = (courseCode: string) => {
    const filtered = preferences
      .filter(p => p.course_code !== courseCode)
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
      // Get auth header for the request
      const { getAuthHeader } = await import("@/lib/utils/client-auth");
      const authHeader = await getAuthHeader();

      const response = await fetch("/api/elective-preferences", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": authHeader,
        },
        body: JSON.stringify({
          preferences: preferences.map(p => ({
            course_code: p.course_code,
            rank: p.rank,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save preferences");
      }

      const result = await response.json();
      
      toast.success(result.data?.message || "Preferences saved successfully!", {
        icon: <CheckCircle2 className="h-4 w-4" />,
      });
      setHasChanges(false);
      
      // Refresh the page to get updated data
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save preferences";
      toast.error(errorMessage);
      console.error("Error saving preferences:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const showCourseDetails = (course: Course) => {
    setSelectedCourse(course);
    setShowCourseDialog(true);
  };

  const selectedCodes = new Set(preferences.map(p => p.course_code));
  const filteredCourses = availableElectives.filter(
    course => !selectedCodes.has(course.code) && 
      (searchQuery === "" || 
       course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
       course.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const completionPercentage = Math.min((preferences.length / 3) * 100, 100);

  return (
    <>
      <div className="space-y-6">
        {/* Progress Section */}
        {preferences.length < 3 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">Preference Completion</h3>
              <span className="text-sm font-medium">{preferences.length}/3+</span>
            </div>
            <Progress value={completionPercentage} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">
              Add at least 3 preferences to increase your chances of getting enrolled in an elective!
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Preferences List */}
          <Card className="lg:sticky lg:top-6 lg:self-start">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" />
                My Preferences (Ranked)
              </CardTitle>
              <CardDescription>
                Drag to reorder. Your top choice is #1.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {preferences.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-muted-foreground"
                >
                  <Heart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No preferences yet</p>
                  <p className="text-sm mt-1">Add courses from the right panel</p>
                </motion.div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={preferences.map(p => p.course_code)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      <AnimatePresence>
                        {preferences.map((pref, index) => (
                          <SortablePreferenceItem
                            key={pref.course_code}
                            pref={pref}
                            index={index}
                            onRemove={removePreference}
                            onShowDetails={showCourseDetails}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </SortableContext>
                </DndContext>
              )}
              
              {preferences.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 flex gap-2"
                >
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
                </motion.div>
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
                Click to view details, then add to your preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {filteredCourses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>{searchQuery ? "No courses found" : "All electives added!"}</p>
                  <p className="text-sm mt-1">
                    {searchQuery ? "Try a different search" : "You've selected all available courses"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                  <AnimatePresence>
                    {filteredCourses.map((course) => (
                      <motion.div
                        key={course.code}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer"
                        onClick={() => showCourseDetails(course)}
                      >
                        <div className="flex-1 min-w-0 mr-3">
                          <p className="font-semibold truncate">{course.code}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {course.title}
                          </p>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            {course.recommended_level && (
                              <Badge variant="secondary" className="text-xs">
                                Level {course.recommended_level}
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {course.credits} cr
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {course.weekly_hours}h/wk
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            addPreference(course);
                          }}
                          className="flex-shrink-0"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <CourseDetailDialog
        course={selectedCourse}
        open={showCourseDialog}
        onOpenChange={setShowCourseDialog}
        onAdd={addPreference}
        isAdded={selectedCourse ? selectedCodes.has(selectedCourse.code) : false}
      />
    </>
  );
}
