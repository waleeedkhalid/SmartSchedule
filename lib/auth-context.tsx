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
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user ?? null;
      
      if (!user) {
        return { user: null, userRole: null };
      }

      // Fetch user role from user_roles table
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      return {
        user,
        userRole: roleData as UserRoleRow | null,
      };
    },
    staleTime: 0,
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
