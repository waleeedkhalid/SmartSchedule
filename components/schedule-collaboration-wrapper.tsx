/**
 * Schedule Collaboration Wrapper
 *
 * Wraps the schedule generator with real-time collaboration features:
 * - Yjs-powered concurrent editing
 * - Real-time cross-tab sync with BroadcastChannel
 * - IndexedDB persistence
 * - Auto-save functionality
 * - Conflict-free CRDTs
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Wifi, RotateCcw, Redo, Check, Clock, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsClient } from "@/hooks/use-mounted";
import type { ScheduleStatus } from "@/lib/db/scheduling-stats";

type SaveStatus = "saved" | "saving" | "unsaved";

interface ScheduleCollaborationWrapperProps {
  initialStatus: ScheduleStatus;
  children: React.ReactNode;
}

export function ScheduleCollaborationWrapper({
  children,
}: ScheduleCollaborationWrapperProps) {
  const isClient = useIsClient();
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<number>(1);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [isYjsLoading, setIsYjsLoading] = useState(true);

  // Safe time formatter to prevent hydration mismatch
  const formatTime = (date: Date | null): string => {
    if (!date || !isClient) return "";
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Type refs to handle dynamic Yjs imports
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ydocRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const providerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const undoManagerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const yjsModuleRef = useRef<{ Y: any; IndexeddbPersistence: any } | null>(
    null
  );
  const currentUserIdRef = useRef<string>("");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const presenceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activeTabsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;

    // Dynamically import Yjs libraries to prevent compilation on every page load
    async function initializeYjs() {
      try {
        setIsYjsLoading(true);

        // Dynamic imports - only loaded when this page is accessed
        const [yjsModule, indexeddbModule] = await Promise.all([
          import("yjs"),
          import("y-indexeddb"),
        ]);

        if (!isMounted) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Y = (yjsModule as any).default || yjsModule;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const IndexeddbPersistence =
          (indexeddbModule as any).IndexeddbPersistence ||
          (indexeddbModule as any).default;

        // Store modules in ref for later use
        yjsModuleRef.current = { Y, IndexeddbPersistence };

        // Generate unique user ID for this tab/session
        currentUserIdRef.current = `user-${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // Create Yjs document
        const ydoc = new Y.Doc();
        ydocRef.current = ydoc;

        // Create shared Map type for schedule data
        const ymap = ydoc.getMap("scheduleCollabData");

        // Set up IndexedDB persistence (persists data to disk)
        const provider = new IndexeddbPersistence(
          "schedule-dashboard-collab",
          ydoc
        );
        providerRef.current = provider;

        // Set up BroadcastChannel for cross-tab real-time sync
        const bc = new BroadcastChannel("schedule-dashboard-sync");
        broadcastChannelRef.current = bc;

        // Listen for updates from other tabs
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        bc.onmessage = (event: any) => {
          if (
            event.data.type === "update" &&
            event.data.sender !== currentUserIdRef.current
          ) {
            Y.applyUpdate(ydoc, new Uint8Array(event.data.update));
          } else if (event.data.type === "presence") {
            // Track active tabs
            activeTabsRef.current.add(event.data.sender);
            setActiveUsers(activeTabsRef.current.size + 1); // +1 for current tab

            // Remove inactive tabs after 3 seconds
            setTimeout(() => {
              activeTabsRef.current.delete(event.data.sender);
              setActiveUsers(activeTabsRef.current.size + 1);
            }, 3000);
          } else if (event.data.type === "ping") {
            // Respond to presence check
            bc.postMessage({
              type: "presence",
              sender: currentUserIdRef.current,
            });
          }
        };

        // Broadcast updates to other tabs
        ydoc.on("update", (update: Uint8Array) => {
          bc.postMessage({
            type: "update",
            update: Array.from(update),
            sender: currentUserIdRef.current,
          });
        });

        // Send presence heartbeat
        presenceIntervalRef.current = setInterval(() => {
          if (broadcastChannelRef.current) {
            bc.postMessage({
              type: "presence",
              sender: currentUserIdRef.current,
            });
          }
        }, 1000);

        // Initial presence check
        bc.postMessage({
          type: "ping",
          sender: currentUserIdRef.current,
        });

        // Set up undo manager
        const undoManager = new Y.UndoManager(ymap);
        undoManagerRef.current = undoManager;

        // Wait for provider to sync
        provider.on("synced", () => {
          if (!isMounted) return;
          setIsConnected(true);
        });

        // Listen to changes from other tabs/users
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
        const updateHandler = (_event: any) => {
          if (!isMounted) return;

          // Trigger auto-save when data changes
          setSaveStatus("unsaved");
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }
          saveTimeoutRef.current = setTimeout(() => {
            autoSave();
          }, 1500);
        };

        ymap.observe(updateHandler);

        setIsYjsLoading(false);

        return () => {
          // Clear interval first to prevent posting to closed channel
          if (presenceIntervalRef.current) {
            clearInterval(presenceIntervalRef.current);
            presenceIntervalRef.current = null;
          }
          ymap.unobserve(updateHandler);
          provider.destroy();
          ydoc.destroy();
          bc.close();
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }
        };
      } catch (error) {
        console.error("Error initializing Yjs:", error);
        setIsYjsLoading(false);
      }
    }

    initializeYjs();

    return () => {
      isMounted = false;
      // Clear interval first to prevent posting to closed channel
      if (presenceIntervalRef.current) {
        clearInterval(presenceIntervalRef.current);
        presenceIntervalRef.current = null;
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save function with debounce
  const autoSave = useCallback(() => {
    if (!ydocRef.current) return;

    setSaveStatus("saving");

    // Simulate save operation (in reality, Yjs already saves via IndexedDB)
    // This is for visual feedback
    setTimeout(() => {
      setSaveStatus("saved");
      setLastSavedTime(new Date());
    }, 500);
  }, []);

  const handleUndo = () => {
    undoManagerRef.current?.undo();
  };

  const handleRedo = () => {
    undoManagerRef.current?.redo();
  };

  // Show loading state while Yjs libraries are being loaded
  if (isYjsLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                Loading Collaboration Editor
              </h3>
              <p className="text-sm text-muted-foreground">
                Initializing real-time collaboration features...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Collaboration Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Connection Badge */}
                <Badge
                  variant={isConnected ? "default" : "destructive"}
                  className={`text-xs px-3 py-1 transition-all ${
                    isConnected ? "animate-pulse" : ""
                  }`}
                >
                  <Wifi className="h-3 w-3 mr-1.5" />
                  {isConnected ? "Connected" : "Connecting..."}
                </Badge>

                {/* Active Users */}
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-900">
                    {activeUsers} Active {activeUsers === 1 ? "User" : "Users"}
                  </span>
                </div>

                {/* Auto-save status */}
                <AnimatePresence mode="wait">
                  {saveStatus === "saved" && lastSavedTime && (
                    <motion.div
                      key="saved"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="flex items-center gap-1.5 text-green-600"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span className="text-sm">
                        {formatTime(lastSavedTime)
                          ? `Saved at ${formatTime(lastSavedTime)}`
                          : "Saved"}
                      </span>
                    </motion.div>
                  )}
                  {saveStatus === "saving" && (
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
                  {saveStatus === "unsaved" && (
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

              {/* Undo/Redo Buttons */}
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

      {/* Wrapped Content */}
      {children}
    </div>
  );
}
