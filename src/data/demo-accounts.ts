/**
 * Demo Accounts
 * Centralized demo accounts for testing and demonstration
 */

import type { UserRole } from "@/lib/auth/constants";

export interface DemoAccount {
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    full_name: "Ahmed",
    email: "064d6c9dac@webxios.pro",
    password: "064d6c9dac@webxios.proL",
    role: "student",
  },
  {
    full_name: "Ali",
    email: "77539b2fb6@webxios.pro",
    password: "77539b2fb6@webxios.proL",
    role: "faculty",
  },
  {
    full_name: "Abdullah",
    email: "7acde56893@webxios.pro",
    password: "7acde56893@webxios.proL",
    role: "registrar",
  },
  {
    full_name: "Abdulaziz",
    email: "e1680ded34@webxios.pro",
    password: "e1680ded34@webxios.proL",
    role: "scheduling_committee",
  }
];
