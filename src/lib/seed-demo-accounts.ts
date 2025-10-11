// Demo accounts seeding script for SmartSchedule
// Creates demo users with different roles for testing

import { getSupabaseAdminOrThrow } from "./supabase-admin";

export interface DemoAccount {
  email: string;
  password: string;
  role: string;
  name: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: "student_demo@smartschedule.app",
    password: "demo1234",
    role: "student",
    name: "Demo Student",
  },
  {
    email: "faculty_demo@smartschedule.app",
    password: "demo1234",
    role: "faculty",
    name: "Demo Faculty",
  },
  {
    email: "scheduler_demo@smartschedule.app",
    password: "demo1234",
    role: "scheduling_committee",
    name: "Demo Scheduler",
  },
  {
    email: "load_demo@smartschedule.app",
    password: "demo1234",
    role: "teaching_load_committee",
    name: "Demo Load Manager",
  },
  {
    email: "registrar_demo@smartschedule.app",
    password: "demo1234",
    role: "registrar",
    name: "Demo Registrar",
  },
];

export async function seedDemoAccounts(): Promise<void> {
  const supabase = getSupabaseAdminOrThrow();
  
  console.log("🌱 Seeding demo accounts...");
  
  for (const account of DEMO_ACCOUNTS) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
      });
      
      if (authError) {
        console.warn(`⚠️  Auth user creation failed for ${account.email}:`, authError.message);
        continue;
      }
      
      // Create user profile
      const { error: userError } = await supabase
        .from("user")
        .insert({
          id: authData.user.id,
          name: account.name,
          email: account.email,
          role: account.role,
        });
      
      if (userError) {
        console.warn(`⚠️  User profile creation failed for ${account.email}:`, userError.message);
        continue;
      }
      
      // Create student profile if role is student
      if (account.role === "student") {
        const { error: studentError } = await supabase
          .from("students")
          .insert({
            user_id: authData.user.id,
            student_id: `STU${Date.now()}`,
            name: account.name,
            email: account.email,
            level: 6,
            major: "Software Engineering",
            gpa: "3.5",
            completed_credits: 90,
            total_credits: 132,
          });
        
        if (studentError) {
          console.warn(`⚠️  Student profile creation failed for ${account.email}:`, studentError.message);
        }
      }
      
      console.log(`✅ Created demo account: ${account.email} (${account.role})`);
    } catch (error) {
      console.error(`❌ Failed to create demo account ${account.email}:`, error);
    }
  }
  
  console.log("🎉 Demo accounts seeding completed!");
}

export async function clearDemoAccounts(): Promise<void> {
  const supabase = getSupabaseAdminOrThrow();
  
  console.log("🧹 Clearing demo accounts...");
  
  for (const account of DEMO_ACCOUNTS) {
    try {
      // Get user by email
      const { data: userData } = await supabase
        .from("user")
        .select("id")
        .eq("email", account.email)
        .single();
      
      if (userData) {
        // Delete from auth
        await supabase.auth.admin.deleteUser(userData.id);
        console.log(`✅ Deleted demo account: ${account.email}`);
      }
    } catch (error) {
      console.warn(`⚠️  Failed to delete demo account ${account.email}:`, error);
    }
  }
  
  console.log("🎉 Demo accounts clearing completed!");
}
