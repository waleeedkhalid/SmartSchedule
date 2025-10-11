#!/usr/bin/env node

// Demo accounts seeding script
// Run with: node scripts/seed-demo-accounts.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const DEMO_ACCOUNTS = [
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

async function seedDemoAccounts() {
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
            gpa: 3.5,
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

async function clearDemoAccounts() {
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

// Main execution
const command = process.argv[2];

if (command === "clear") {
  clearDemoAccounts().catch(console.error);
} else {
  seedDemoAccounts().catch(console.error);
}
