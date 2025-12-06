"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { Database } from "@/lib/types/database";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Lazy load form component - heavy with many form fields
const SectionForm = dynamic(
  () => import("@/components/section-form").then((mod) => mod.SectionForm),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

type Section = Database["public"]["Tables"]["section"]["Row"] & {
  meeting_pattern: {
    days: string[];
    start: string;
    duration: number;
  };
};

interface SectionDialogContextType {
  openCreateDialog: () => void;
  openEditDialog: (section: Section) => void;
}

const SectionDialogContext = createContext<
  SectionDialogContextType | undefined
>(undefined);

export function useSectionDialog() {
  const context = useContext(SectionDialogContext);
  if (!context) {
    throw new Error(
      "useSectionDialog must be used within SectionDialogProvider"
    );
  }
  return context;
}

interface SectionDialogProviderProps {
  children: ReactNode;
  courses: Array<{ code: string; title: string }>;
  instructors: Array<{ id: string; name: string }>;
  rooms: Array<{ code: string; type: string }>;
}

export function SectionDialogProvider({
  children,
  courses,
  instructors,
  rooms,
}: SectionDialogProviderProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  const openCreateDialog = useCallback(() => {
    setSelectedSection(null);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((section: Section) => {
    setSelectedSection(section);
    setDialogOpen(true);
  }, []);

  const handleSuccess = useCallback(() => {
    setDialogOpen(false);
    setSelectedSection(null);
    router.refresh();
  }, [router]);

  const handleCancel = useCallback(() => {
    setDialogOpen(false);
    setSelectedSection(null);
  }, []);

  const isEditing = selectedSection !== null;

  return (
    <SectionDialogContext.Provider value={{ openCreateDialog, openEditDialog }}>
      {children}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Section" : "Add New Section"}
            </DialogTitle>
          </DialogHeader>
          <SectionForm
            section={selectedSection || undefined}
            courses={courses}
            instructors={instructors}
            rooms={rooms}
            isEditing={isEditing}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </SectionDialogContext.Provider>
  );
}
