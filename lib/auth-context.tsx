"use client";

import { createClient } from "@/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";
import type { UserRoleRow } from "@/lib/types/database";

const supabase = createClient();

interface AuthContextType {
  user: User | null;
  userRole: UserRoleRow | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: ["user", "userRole"],
    queryFn: async () => {
      const { data: authData, error } = await supabase.auth.getUser();
      
      // Handle 403 or other auth errors gracefully
      if (error || !authData?.user) {
        return { user: null, userRole: null };
      }
      
      const user = authData.user;

      // Fetch user role from user_roles table
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      return {
        user,
        userRole: roleData as UserRoleRow | null,
      };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes instead of 0
    retry: false, // Don't retry on 403 errors
  });

  return (
    <AuthContext.Provider value={{ 
      user: data?.user ?? null, 
      userRole: data?.userRole ?? null,
      loading: isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
