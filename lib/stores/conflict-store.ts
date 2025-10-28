// Conflict Store - Track scheduling conflicts
import { create } from 'zustand';
import { SectionConflicts } from '@/lib/types/database';

interface ConflictState {
  conflicts: SectionConflicts[];
  isChecking: boolean;
  
  // Actions
  setConflicts: (conflicts: SectionConflicts[]) => void;
  addConflict: (conflict: SectionConflicts) => void;
  removeConflict: (sectionId: string) => void;
  setChecking: (checking: boolean) => void;
  hasConflicts: () => boolean;
  getConflictsForSection: (sectionId: string) => SectionConflicts | undefined;
  getTotalConflictCount: () => number;
  clear: () => void;
}

export const useConflictStore = create<ConflictState>((set, get) => ({
  conflicts: [],
  isChecking: false,
  
  setConflicts: (conflicts) => set({ conflicts }),
  
  addConflict: (conflict) => set((state) => {
    const existing = state.conflicts.find((c) => c.section_id === conflict.section_id);
    if (existing) {
      return {
        conflicts: state.conflicts.map((c) =>
          c.section_id === conflict.section_id ? conflict : c
        ),
      };
    }
    return { conflicts: [...state.conflicts, conflict] };
  }),
  
  removeConflict: (sectionId) => set((state) => ({
    conflicts: state.conflicts.filter((c) => c.section_id !== sectionId),
  })),
  
  setChecking: (checking) => set({ isChecking: checking }),
  
  hasConflicts: () => {
    const { conflicts } = get();
    return conflicts.some((c) => c.has_conflicts);
  },
  
  getConflictsForSection: (sectionId) => {
    const { conflicts } = get();
    return conflicts.find((c) => c.section_id === sectionId);
  },
  
  getTotalConflictCount: () => {
    const { conflicts } = get();
    return conflicts.reduce((total, c) => {
      return total +
        c.room_conflicts.length +
        c.instructor_conflicts.length +
        c.student_conflicts.length;
    }, 0);
  },
  
  clear: () => set({ conflicts: [], isChecking: false }),
}));

