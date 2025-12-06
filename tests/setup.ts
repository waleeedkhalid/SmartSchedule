import "@testing-library/jest-dom";

// Mock environment variables
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
process.env.SUPABASE_URL = "https://nfdxuxvlhsdbkcleogoe.supabase.co";
process.env.SUPABASE_ANON_KEY =
  "sb_publishable_2lUbsqSExeEPQj5Ti1bpcQ_pmoxHtms";
// Global test utilities
global.fetch = jest.fn();
