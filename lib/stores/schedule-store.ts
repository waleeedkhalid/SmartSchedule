// Schedule Store - Manage schedule state and operations
import { create } from 'zustand';
import { Section, ScheduleDoc } from '@/lib/types/database';

interface ScheduleState {
  currentScheduleDoc: ScheduleDoc | null;
  sections: Section[];
  selectedSectionId: string | null;
  isLoading: boolean;
  
  // Actions
  setScheduleDoc: (doc: ScheduleDoc) => void;
  setSections: (sections: Section[]) => void;
  addSection: (section: Section) => void;
  updateSection: (id: string, updates: Partial<Section>) => void;
  deleteSection: (id: string) => void;
  setSelectedSection: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  currentScheduleDoc: null,
  sections: [],
  selectedSectionId: null,
  isLoading: false,
  
  setScheduleDoc: (doc) => set({ currentScheduleDoc: doc }),
  
  setSections: (sections) => set({ sections }),
  
  addSection: (section) => set((state) => ({
    sections: [...state.sections, section],
  })),
  
  updateSection: (id, updates) => set((state) => ({
    sections: state.sections.map((s) =>
      s.id === id ? { ...s, ...updates } : s
    ),
  })),
  
  deleteSection: (id) => set((state) => ({
    sections: state.sections.filter((s) => s.id !== id),
    selectedSectionId: state.selectedSectionId === id ? null : state.selectedSectionId,
  })),
  
  setSelectedSection: (id) => set({ selectedSectionId: id }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  clear: () => set({
    currentScheduleDoc: null,
    sections: [],
    selectedSectionId: null,
    isLoading: false,
  }),
}));

