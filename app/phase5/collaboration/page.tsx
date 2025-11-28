/**
 * Phase 5 - Real-time Collaboration Demo (Yjs)
 * 
 * Schedule Editor with Real-time Collaboration
 * - Yjs-powered concurrent editing
 * - Real-time cross-tab sync with BroadcastChannel
 * - IndexedDB persistence
 * - SWE courses editable, external courses read-only
 * - Auto-save functionality
 * - Conflict-free CRDTs
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Users, Wifi, GitMerge, Activity, RotateCcw, Redo, Save, Check, Clock, Edit, Lock, Calendar, MapPin, User, BookOpen, Trash2, Plus, Copy, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// Yjs libraries are dynamically imported to prevent compilation on every page load
// This fixes the 65ms bubble_compiled.js compilation delay
import externalData from '@/external_departments_courses_sections.json';
import swePlan from '@/swe_plan.json';
import sweSections from '@/swe_departments_sections.json';

type SaveStatus = 'saved' | 'saving' | 'unsaved';

// Types for our data structures
interface Section {
  section_no: string;
  section_type: string;
  instructor: {
    name: string;
    email: string;
  };
  room_code: string;
  meeting_pattern: {
    days: string[];
    start_time: string;
    duration_minutes: number;
  };
}

interface SectionGroup {
  group_id: string | number;
  group_level: number;
  capacity: number;
  sections: Section[];
}

interface Course {
  code: string;
  title: string;
  credits?: number;
  credit_hours?: number;
  weekly_hours?: number;
  level?: number;
  is_elective?: boolean;
  prerequisite?: string;
  section_groups?: SectionGroup[];
}

interface ScheduleData {
  [courseCode: string]: {
    sections: Section[];
    notes?: string;
  };
}

export default function CollaborationPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<number>(1);
  const [scheduleData, setScheduleData] = useState<ScheduleData>({});
  const [editHistory, setEditHistory] = useState<Array<{ user: string, action: string, time: string, course: string }>>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number>(4);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [showReadOnly, setShowReadOnly] = useState<boolean>(true);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isYjsLoading, setIsYjsLoading] = useState(true);
  // Type refs to handle dynamic Yjs imports
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ydocRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const providerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const undoManagerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const yjsModuleRef = useRef<{ Y: any; IndexeddbPersistence: any } | null>(null);
  const currentUserIdRef = useRef<string>('');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const activeTabsRef = useRef<Set<string>>(new Set());

  // Helper function to check if a course is SWE course (editable)
  const isSWECourse = (courseCode: string): boolean => {
    return courseCode.startsWith('SWE');
  };

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateTime = (time: string): boolean => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const validateDuration = (duration: number): boolean => {
    return duration > 0 && duration <= 300;
  };

  const validateRequired = (value: string): boolean => {
    return value.trim().length > 0;
  };

  // Get all courses for a level from both sources
  const getCoursesForLevel = useCallback((level: number): Course[] => {
    const courses: Course[] = [];

    // Get SWE plan courses for this level
    const sweLevelData = swePlan.study_plan.find(l => l.level === level);
    if (sweLevelData) {
      sweLevelData.courses.forEach(course => {
        let foundCourse = false;

        // First, try to find section data from SWE sections
        if (course.code.startsWith('SWE')) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sweCourse = (sweSections as any).courses.find(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (c: any) => c.code === course.code
          );
          if (sweCourse) {
            courses.push({
              ...course,
              ...sweCourse
            });
            foundCourse = true;
            return;
          }
        }

        // If not SWE course or not found in SWE sections, try external departments
        if (!foundCourse) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          for (const dept of (externalData as any).external_departments) {
            const externalCourse = dept.courses.find(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (c: any) => c.code === course.code
            );
            if (externalCourse) {
              courses.push({
                ...course,
                ...externalCourse
              });
              foundCourse = true;
              return;
            }
          }
        }

        // If not found in any source, add without section groups
        if (!foundCourse) {
          courses.push(course as Course);
        }
      });
    }

    return courses;
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Dynamically import Yjs libraries to prevent compilation on every page load
    // This fixes the 65ms bubble_compiled.js compilation delay
    async function initializeYjs() {
      try {
        setIsYjsLoading(true);

        // Dynamic imports - only loaded when this page is accessed
        const [yjsModule, indexeddbModule] = await Promise.all([
          import('yjs'),
          import('y-indexeddb')
        ]);

        if (!isMounted) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Y = (yjsModule as any).default || yjsModule;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const IndexeddbPersistence = (indexeddbModule as any).IndexeddbPersistence || (indexeddbModule as any).default;

        // Store modules in ref for later use
        yjsModuleRef.current = { Y, IndexeddbPersistence };

        // Generate unique user ID for this tab/session
        currentUserIdRef.current = `user-${Math.random().toString(36).substr(2, 9)}`;

        // Load courses for selected level
        const courses = getCoursesForLevel(selectedLevel);
        setAllCourses(courses);

        // Create Yjs document
        const ydoc = new Y.Doc();
        ydocRef.current = ydoc;

        // Create shared Map type for schedule data
        const ymap = ydoc.getMap('scheduleData');

        // Set up IndexedDB persistence (persists data to disk)
        const provider = new IndexeddbPersistence('phase5-schedule-collab', ydoc);
        providerRef.current = provider;

        // Set up BroadcastChannel for cross-tab real-time sync
        const bc = new BroadcastChannel('phase5-schedule-sync');
        broadcastChannelRef.current = bc;

        // Listen for updates from other tabs
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        bc.onmessage = (event: any) => {
          if (event.data.type === 'update' && event.data.sender !== currentUserIdRef.current) {
            Y.applyUpdate(ydoc, new Uint8Array(event.data.update));
          } else if (event.data.type === 'presence') {
            // Track active tabs
            activeTabsRef.current.add(event.data.sender);
            setActiveUsers(activeTabsRef.current.size + 1); // +1 for current tab

            // Remove inactive tabs after 3 seconds
            setTimeout(() => {
              activeTabsRef.current.delete(event.data.sender);
              setActiveUsers(activeTabsRef.current.size + 1);
            }, 3000);
          } else if (event.data.type === 'ping') {
            // Respond to presence check
            bc.postMessage({
              type: 'presence',
              sender: currentUserIdRef.current
            });
          }
        };

        // Broadcast updates to other tabs
        ydoc.on('update', (update: Uint8Array) => {
          bc.postMessage({
            type: 'update',
            update: Array.from(update),
            sender: currentUserIdRef.current
          });
        });

        // Send presence heartbeat
        const presenceInterval = setInterval(() => {
          bc.postMessage({
            type: 'presence',
            sender: currentUserIdRef.current
          });
        }, 1000);

        // Initial presence check
        bc.postMessage({
          type: 'ping',
          sender: currentUserIdRef.current
        });

        // Set up undo manager
        const undoManager = new Y.UndoManager(ymap);
        undoManagerRef.current = undoManager;

        // Wait for provider to sync
        provider.on('synced', () => {
          if (!isMounted) return;
          setIsConnected(true);

          // Load schedule data from Yjs
          const loadedData: ScheduleData = {};
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ymap.forEach((value: any, key: any) => {
            try {
              loadedData[key] = JSON.parse(value as string);
            } catch (e) {
              console.error('Error parsing schedule data:', e);
            }
          });
          setScheduleData(loadedData);
        });

        // Listen to changes from other tabs/users
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateHandler = (event: any) => {
          if (!isMounted) return;

          const newData: ScheduleData = {};
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ymap.forEach((value: any, key: any) => {
            try {
              newData[key] = JSON.parse(value as string);
            } catch (e) {
              console.error('Error parsing schedule data:', e);
            }
          });
          setScheduleData(newData);

          // Add to edit history
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          event.changes.keys.forEach((change: any, key: string) => {
            if (change.action === 'update' || change.action === 'add') {
              const now = new Date();
              const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
              setEditHistory(prev => [
                {
                  user: 'Collaborator',
                  action: change.action === 'add' ? 'Added section' : 'Updated section',
                  time: timeStr,
                  course: key
                },
                ...prev.slice(0, 9) // Keep last 10 edits
              ]);
            }
          });
        };

        ymap.observe(updateHandler);

        setIsYjsLoading(false);

        return () => {
          clearInterval(presenceInterval);
          ymap.unobserve(updateHandler);
          provider.destroy();
          ydoc.destroy();
          bc.close();
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }
        };
      } catch (error) {
        console.error('Error initializing Yjs:', error);
        setIsYjsLoading(false);
      }
    }

    initializeYjs();

    return () => {
      isMounted = false;
      if (providerRef.current) {
        providerRef.current.destroy();
      }
      if (ydocRef.current) {
        ydocRef.current.destroy();
      }
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [selectedLevel, getCoursesForLevel]);

  // Auto-save function with debounce
  const autoSave = useCallback(() => {
    if (!ydocRef.current) return;

    setSaveStatus('saving');

    // Simulate save operation (in reality, Yjs already saves via IndexedDB)
    // This is for visual feedback
    setTimeout(() => {
      setSaveStatus('saved');
      setLastSavedTime(new Date());
    }, 500);
  }, []);

  // Update section data for a course
  const updateSectionField = useCallback((courseCode: string, sectionNo: string, field: string, value: string | string[] | number) => {
    if (!ydocRef.current || !isSWECourse(courseCode)) return;

    // Validation based on field type
    const errorKey = `${courseCode}-${sectionNo}-${field}`;
    let isValid = true;
    let errorMsg = '';

    if (field === 'instructor.email' && typeof value === 'string') {
      isValid = validateEmail(value);
      errorMsg = 'Invalid email format';
    } else if (field === 'meeting_pattern.start_time' && typeof value === 'string') {
      isValid = validateTime(value);
      errorMsg = 'Invalid time format (HH:MM)';
    } else if (field === 'meeting_pattern.duration_minutes' && typeof value === 'number') {
      isValid = validateDuration(value);
      errorMsg = 'Duration must be between 1-300 minutes';
    } else if ((field === 'instructor.name' || field === 'room_code') && typeof value === 'string') {
      isValid = validateRequired(value);
      errorMsg = 'This field is required';
    }

    // Update error state
    if (!isValid) {
      setFieldErrors(prev => ({ ...prev, [errorKey]: errorMsg }));
      return;
    } else {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }

    setSaveStatus('unsaved');

    const ymap = ydocRef.current.getMap('scheduleData');

    // Get current data or fall back to original sections from course
    let currentData = scheduleData[courseCode];
    if (!currentData) {
      // Find the course to get its original sections
      const course = allCourses.find(c => c.code === courseCode);
      const originalSections = course?.section_groups?.[0]?.sections || [];
      currentData = { sections: originalSections };
    }

    // Update the specific section
    const updatedSections = currentData.sections.map(section => {
      if (section.section_no === sectionNo) {
        if (field.includes('.')) {
          // Nested field update
          const [parent, child] = field.split('.');
          return {
            ...section,
            [parent]: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...(section as any)[parent],
              [child]: value
            }
          };
        }
        return {
          ...section,
          [field]: value
        };
      }
      return section;
    });

    const updatedData = {
      ...currentData,
      sections: updatedSections
    };

    ymap.set(courseCode, JSON.stringify(updatedData));

    // Debounced auto-save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 1500);
  }, [scheduleData, autoSave, allCourses]);

  // Update course notes
  const updateCourseNotes = useCallback((courseCode: string, notes: string) => {
    if (!ydocRef.current || !isSWECourse(courseCode)) return;

    setSaveStatus('unsaved');

    const ymap = ydocRef.current.getMap('scheduleData');

    // Get current data or fall back to original sections from course
    let currentData = scheduleData[courseCode];
    if (!currentData) {
      const course = allCourses.find(c => c.code === courseCode);
      const originalSections = course?.section_groups?.[0]?.sections || [];
      currentData = { sections: originalSections };
    }

    const updatedData = {
      ...currentData,
      notes
    };

    ymap.set(courseCode, JSON.stringify(updatedData));

    // Debounced auto-save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 1500);
  }, [scheduleData, autoSave, allCourses]);

  // Add new section to a course
  const addSection = useCallback((courseCode: string) => {
    if (!ydocRef.current || !isSWECourse(courseCode)) return;

    setSaveStatus('unsaved');

    const ymap = ydocRef.current.getMap('scheduleData');

    // Get current data or fall back to original sections from course
    let currentData = scheduleData[courseCode];
    if (!currentData) {
      const course = allCourses.find(c => c.code === courseCode);
      const originalSections = course?.section_groups?.[0]?.sections || [];
      currentData = { sections: originalSections };
    }

    // Generate new section number
    const existingSections = currentData.sections || [];
    const maxSectionNum = existingSections.length > 0
      ? Math.max(...existingSections.map(s => parseInt(s.section_no) || 0))
      : 0;

    const newSection: Section = {
      section_no: `${String(maxSectionNum + 1).padStart(2, '0')}L`,
      section_type: 'lecture',
      instructor: {
        name: 'TBA',
        email: 'tba@university.edu'
      },
      room_code: 'TBA',
      meeting_pattern: {
        days: ['Sunday'],
        start_time: '08:00',
        duration_minutes: 90
      }
    };

    const updatedData = {
      ...currentData,
      sections: [...existingSections, newSection]
    };

    ymap.set(courseCode, JSON.stringify(updatedData));
    autoSave();
  }, [scheduleData, autoSave, allCourses]);

  // Remove section from a course
  const removeSection = useCallback((courseCode: string, sectionNo: string) => {
    if (!ydocRef.current || !isSWECourse(courseCode)) return;

    setSaveStatus('unsaved');

    const ymap = ydocRef.current.getMap('scheduleData');

    // Get current data or fall back to original sections from course
    let currentData = scheduleData[courseCode];
    if (!currentData) {
      const course = allCourses.find(c => c.code === courseCode);
      const originalSections = course?.section_groups?.[0]?.sections || [];
      currentData = { sections: originalSections };
    }

    const updatedSections = currentData.sections.filter(s => s.section_no !== sectionNo);

    const updatedData = {
      ...currentData,
      sections: updatedSections
    };

    ymap.set(courseCode, JSON.stringify(updatedData));
    autoSave();
  }, [scheduleData, autoSave, allCourses]);

  // Duplicate section
  const duplicateSection = useCallback((courseCode: string, sectionNo: string) => {
    if (!ydocRef.current || !isSWECourse(courseCode)) return;

    setSaveStatus('unsaved');

    const ymap = ydocRef.current.getMap('scheduleData');

    // Get current data or fall back to original sections from course
    let currentData = scheduleData[courseCode];
    if (!currentData) {
      const course = allCourses.find(c => c.code === courseCode);
      const originalSections = course?.section_groups?.[0]?.sections || [];
      currentData = { sections: originalSections };
    }

    const sectionToDuplicate = currentData.sections.find(s => s.section_no === sectionNo);
    if (!sectionToDuplicate) return;

    // Generate new section number
    const maxSectionNum = Math.max(...currentData.sections.map(s => parseInt(s.section_no) || 0));

    const newSection: Section = {
      ...sectionToDuplicate,
      section_no: `${String(maxSectionNum + 1).padStart(2, '0')}${sectionToDuplicate.section_type.charAt(0).toUpperCase()}`
    };

    const updatedData = {
      ...currentData,
      sections: [...currentData.sections, newSection]
    };

    ymap.set(courseCode, JSON.stringify(updatedData));
    autoSave();
  }, [scheduleData, autoSave, allCourses]);

  const handleUndo = () => {
    undoManagerRef.current?.undo();
  };

  const handleRedo = () => {
    undoManagerRef.current?.redo();
  };

  // Show loading state while Yjs libraries are being loaded
  // This prevents the 65ms compilation delay on other pages
  if (isYjsLoading) {
    return (
      <div className="container mx-auto p-8 space-y-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Loading Collaboration Editor</h3>
                  <p className="text-sm text-muted-foreground">
                    Initializing Yjs libraries for real-time collaboration...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <Link href="/phase5">
            <Button variant="ghost" size="sm" className="mb-2 hover:bg-muted transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Phase 5
            </Button>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Schedule Collaboration Editor
          </h1>
          <p className="text-muted-foreground">
            Real-time schedule editing for SWE courses with Yjs and auto-save
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={isConnected ? 'default' : 'destructive'}
            className={`text-lg px-4 py-2 transition-all ${isConnected ? 'animate-pulse' : ''}`}
          >
            <Wifi className="h-4 w-4 mr-2" />
            {isConnected ? 'Connected' : 'Connecting...'}
          </Badge>
        </div>
      </motion.div>

      {/* Toolbar with Level Selector and Action Buttons */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-900">
                    {activeUsers} Active {activeUsers === 1 ? 'User' : 'Users'}
                  </span>
                </div>

                {/* Level Selector */}
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-muted-foreground">Level:</span>
                  <div className="flex gap-1">
                    {[4, 5, 6, 7, 8].map((level) => (
                      <Button
                        key={level}
                        size="sm"
                        variant={selectedLevel === level ? 'default' : 'outline'}
                        onClick={() => setSelectedLevel(level)}
                        className="h-8 w-8 p-0"
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Toggle Read-Only Courses */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={showReadOnly ? 'default' : 'outline'}
                    onClick={() => setShowReadOnly(!showReadOnly)}
                    className="h-8 gap-2"
                  >
                    {showReadOnly ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    <span className="text-xs">
                      {showReadOnly ? 'Hide' : 'Show'} External
                    </span>
                  </Button>
                </div>

                {/* Auto-save status */}
                <AnimatePresence mode="wait">
                  {saveStatus === 'saved' && lastSavedTime && (
                    <motion.div
                      key="saved"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="flex items-center gap-1.5 text-green-600"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span className="text-sm">Saved at {lastSavedTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    </motion.div>
                  )}
                  {saveStatus === 'saving' && (
                    <motion.div
                      key="saving"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="flex items-center gap-1.5 text-blue-600"
                    >
                      <Save className="h-3.5 w-3.5 animate-pulse" />
                      <span className="text-sm">Saving...</span>
                    </motion.div>
                  )}
                  {saveStatus === 'unsaved' && (
                    <motion.div
                      key="unsaved"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="flex items-center gap-1.5 text-orange-600"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-sm">Unsaved changes</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUndo}
                  disabled={!isConnected}
                  className="hover:bg-muted transition-colors"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Undo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRedo}
                  disabled={!isConnected}
                  className="hover:bg-muted transition-colors"
                >
                  <Redo className="h-4 w-4 mr-2" />
                  Redo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Course Schedule Cards */}
      <div className="grid gap-6">
        {allCourses
          .filter(course => showReadOnly || isSWECourse(course.code))
          .map((course, idx) => {
            const isEditable = isSWECourse(course.code);
            const courseData = scheduleData[course.code];
            const sections = courseData?.sections || course.section_groups?.[0]?.sections || [];

            return (
              <motion.div
                key={course.code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card className={`shadow-xl border-2 ${isEditable ? 'border-green-200 bg-green-50/30' : 'border-gray-200 bg-gray-50/30'}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-xl">{course.code}</CardTitle>
                          {isEditable ? (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              <Edit className="h-3 w-3 mr-1" />
                              Editable
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Lock className="h-3 w-3 mr-1" />
                              Read-only
                            </Badge>
                          )}
                          <Badge variant="outline">
                            {course.credits || course.credit_hours} Credits
                          </Badge>
                        </div>
                        <CardDescription className="text-base font-medium">{course.title}</CardDescription>
                        {course.prerequisite && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Prerequisites: {course.prerequisite}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {sections.length > 0 ? (
                      <div className="space-y-4">
                        {sections.map((section) => {
                          const errorKeyPrefix = `${course.code}-${section.section_no}`;
                          return (
                            <div
                              key={section.section_no}
                              className={`p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow ${isEditable ? 'hover:border-green-300' : ''}`}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <Badge variant="default" className="font-mono">
                                    {section.section_no}
                                  </Badge>
                                  {isEditable ? (
                                    <Select
                                      value={section.section_type}
                                      onValueChange={(value) => updateSectionField(course.code, section.section_no, 'section_type', value)}
                                    >
                                      <SelectTrigger className="w-28 h-7 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="lecture">Lecture</SelectItem>
                                        <SelectItem value="tutorial">Tutorial</SelectItem>
                                        <SelectItem value="lab">Lab</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <Badge variant="outline">{section.section_type}</Badge>
                                  )}
                                </div>

                                {isEditable && (
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => duplicateSection(course.code, section.section_no)}
                                      className="h-7 w-7 p-0"
                                      title="Duplicate section"
                                    >
                                      <Copy className="h-3.5 w-3.5" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                                          title="Delete section"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete Section?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete section {section.section_no}? This action cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => removeSection(course.code, section.section_no)}
                                            className="bg-red-600 hover:bg-red-700"
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                )}
                              </div>

                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  {/* Instructor Name */}
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-blue-600" />
                                      <Label className="text-sm font-medium">Instructor Name:</Label>
                                    </div>
                                    {isEditable ? (
                                      <>
                                        <Input
                                          value={section.instructor.name}
                                          onChange={(e) => updateSectionField(course.code, section.section_no, 'instructor.name', e.target.value)}
                                          className={`text-sm transition-all ${fieldErrors[`${errorKeyPrefix}-instructor.name`] ? 'border-red-500 focus:ring-red-500' : ''}`}
                                          placeholder="Instructor name"
                                        />
                                        {fieldErrors[`${errorKeyPrefix}-instructor.name`] && (
                                          <p className="text-xs text-red-600">{fieldErrors[`${errorKeyPrefix}-instructor.name`]}</p>
                                        )}
                                      </>
                                    ) : (
                                      <p className="text-sm text-gray-700">{section.instructor.name}</p>
                                    )}
                                  </div>

                                  {/* Instructor Email */}
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-blue-600" />
                                      <Label className="text-sm font-medium">Instructor Email:</Label>
                                    </div>
                                    {isEditable ? (
                                      <>
                                        <Input
                                          type="email"
                                          value={section.instructor.email}
                                          onChange={(e) => updateSectionField(course.code, section.section_no, 'instructor.email', e.target.value)}
                                          className={`text-sm transition-all ${fieldErrors[`${errorKeyPrefix}-instructor.email`] ? 'border-red-500 focus:ring-red-500' : ''}`}
                                          placeholder="email@university.edu"
                                        />
                                        {fieldErrors[`${errorKeyPrefix}-instructor.email`] && (
                                          <p className="text-xs text-red-600">{fieldErrors[`${errorKeyPrefix}-instructor.email`]}</p>
                                        )}
                                      </>
                                    ) : (
                                      <p className="text-xs text-muted-foreground">{section.instructor.email}</p>
                                    )}
                                  </div>

                                  {/* Room Code */}
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4 text-purple-600" />
                                      <Label className="text-sm font-medium">Room:</Label>
                                    </div>
                                    {isEditable ? (
                                      <>
                                        <Input
                                          value={section.room_code}
                                          onChange={(e) => updateSectionField(course.code, section.section_no, 'room_code', e.target.value)}
                                          className={`text-sm transition-all ${fieldErrors[`${errorKeyPrefix}-room_code`] ? 'border-red-500 focus:ring-red-500' : ''}`}
                                          placeholder="Room code"
                                        />
                                        {fieldErrors[`${errorKeyPrefix}-room_code`] && (
                                          <p className="text-xs text-red-600">{fieldErrors[`${errorKeyPrefix}-room_code`]}</p>
                                        )}
                                      </>
                                    ) : (
                                      <p className="text-sm text-gray-700">{section.room_code}</p>
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  {/* Meeting Days */}
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-green-600" />
                                      <Label className="text-sm font-medium">Meeting Days:</Label>
                                    </div>
                                    {isEditable ? (
                                      <div className="flex flex-wrap gap-2">
                                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'].map((day) => (
                                          <div key={day} className="flex items-center space-x-1">
                                            <Checkbox
                                              id={`${section.section_no}-${day}`}
                                              checked={section.meeting_pattern.days.includes(day)}
                                              onCheckedChange={(checked) => {
                                                const newDays = checked
                                                  ? [...section.meeting_pattern.days, day]
                                                  : section.meeting_pattern.days.filter(d => d !== day);
                                                updateSectionField(course.code, section.section_no, 'meeting_pattern.days', newDays);
                                              }}
                                            />
                                            <label
                                              htmlFor={`${section.section_no}-${day}`}
                                              className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                            >
                                              {day.slice(0, 3)}
                                            </label>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="flex flex-wrap gap-1">
                                        {section.meeting_pattern.days.map((day) => (
                                          <Badge key={day} variant="secondary" className="text-xs">
                                            {day}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {/* Start Time */}
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-orange-600" />
                                      <Label className="text-sm font-medium">Start Time:</Label>
                                    </div>
                                    {isEditable ? (
                                      <>
                                        <Input
                                          type="time"
                                          value={section.meeting_pattern.start_time}
                                          onChange={(e) => updateSectionField(course.code, section.section_no, 'meeting_pattern.start_time', e.target.value)}
                                          className={`text-sm w-32 transition-all ${fieldErrors[`${errorKeyPrefix}-meeting_pattern.start_time`] ? 'border-red-500 focus:ring-red-500' : ''}`}
                                        />
                                        {fieldErrors[`${errorKeyPrefix}-meeting_pattern.start_time`] && (
                                          <p className="text-xs text-red-600">{fieldErrors[`${errorKeyPrefix}-meeting_pattern.start_time`]}</p>
                                        )}
                                      </>
                                    ) : (
                                      <p className="text-sm text-gray-700">{section.meeting_pattern.start_time}</p>
                                    )}
                                  </div>

                                  {/* Duration */}
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-orange-600" />
                                      <Label className="text-sm font-medium">Duration (minutes):</Label>
                                    </div>
                                    {isEditable ? (
                                      <>
                                        <Input
                                          type="number"
                                          value={section.meeting_pattern.duration_minutes}
                                          onChange={(e) => updateSectionField(course.code, section.section_no, 'meeting_pattern.duration_minutes', parseInt(e.target.value))}
                                          className={`text-sm w-24 transition-all ${fieldErrors[`${errorKeyPrefix}-meeting_pattern.duration_minutes`] ? 'border-red-500 focus:ring-red-500' : ''}`}
                                          min="1"
                                          max="300"
                                        />
                                        {fieldErrors[`${errorKeyPrefix}-meeting_pattern.duration_minutes`] && (
                                          <p className="text-xs text-red-600">{fieldErrors[`${errorKeyPrefix}-meeting_pattern.duration_minutes`]}</p>
                                        )}
                                      </>
                                    ) : (
                                      <p className="text-sm text-gray-700">{section.meeting_pattern.duration_minutes} min</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}

                        {/* Add Section Button */}
                        {isEditable && (
                          <Button
                            onClick={() => addSection(course.code)}
                            variant="outline"
                            className="w-full border-dashed border-2 hover:border-green-500 hover:bg-green-50 transition-colors"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Section
                          </Button>
                        )}

                        {/* Course Notes */}
                        {isEditable && (
                          <div className="mt-4 space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <Activity className="h-4 w-4 text-purple-600" />
                              Course Notes:
                            </label>
                            <Textarea
                              value={courseData?.notes || ''}
                              onChange={(e) => updateCourseNotes(course.code, e.target.value)}
                              placeholder="Add notes about this course (schedule changes, assignments, etc.)"
                              className="min-h-[80px]"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No sections available for this course</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
      </div>

      {/* Recent Activity Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>Live edit history across all collaborators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {editHistory.length > 0 ? (
                editHistory.map((edit, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100"
                  >
                    <Avatar className="h-8 w-8 bg-blue-500">
                      <AvatarFallback className="text-xs text-white font-semibold">
                        {edit.user.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold text-blue-900">{edit.user}</span>
                        <span className="text-muted-foreground"> {edit.action}</span>
                      </p>
                      <p className="text-xs text-blue-600 font-mono">{edit.course}</p>
                      <p className="text-xs text-muted-foreground">{edit.time}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No recent edits yet</p>
                  <p className="text-xs">Start editing to see activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Features Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-2">
              <GitMerge className="h-5 w-5" />
              Collaboration Features
            </CardTitle>
            <CardDescription>
              Real-time schedule editing with conflict-free CRDTs
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Edit className="h-4 w-4 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-green-900">SWE Courses</h4>
                </div>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span>Fully editable sections</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span>Update instructors</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span>Change rooms & times</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span>Add course notes</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-blue-900">Real-time Sync</h4>
                </div>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>Cross-tab updates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>BroadcastChannel API</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>Instant updates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>Zero conflicts</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Save className="h-4 w-4 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-purple-900">Auto-save</h4>
                </div>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <span>IndexedDB storage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <span>Persists across sessions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <span>Undo/redo support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <span>Debounced saves</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Demo Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="border-dashed border-2 border-purple-300 bg-purple-50/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-purple-900">
                <BookOpen className="h-5 w-5" />
                <h3 className="font-semibold">Try it yourself!</h3>
              </div>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                Open this page in multiple browser tabs and edit SWE course sections (marked with green badge).
                Watch changes sync instantly across all tabs! External courses are read-only.
                All changes are saved automatically via IndexedDB and persist across sessions.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
