// Auth Store - User authentication and role management
// Note: Primary auth is now handled by auth-context.tsx
// This store can be used for additional role-based state management if needed
import { create } from 'zustand';
import { UserRole, UserRoleRow } from '@/lib/types/database';

interface AuthState {
  userRole: UserRoleRow | null;
  isLoading: boolean;
  setUserRole: (user: UserRoleRow | null) => void;
  setLoading: (loading: boolean) => void;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  userRole: null,
  isLoading: true,
  
  setUserRole: (userRole) => set({ userRole, isLoading: false }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  hasRole: (role) => {
    const { userRole } = get();
    return userRole?.role === role;
  },
  
  hasAnyRole: (roles) => {
    const { userRole } = get();
    return userRole ? roles.includes(userRole.role) : false;
  },
  
  clear: () => set({ userRole: null, isLoading: false }),
}));

