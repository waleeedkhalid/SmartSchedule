// Centralized, static demo accounts used across the app

export type DemoAccount = {
  full_name: string;
  email: string;
  password: string;
  role:
    | "student"
    | "faculty"
    | "scheduling_committee"
    | "teaching_load_committee"
    | "registrar";
};

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    full_name: "Ahmed",
    email: "3ee8fcc8d8@webxios.pro",
    password: "3ee8fcc8d8@webxios.pro",
    role: "student",
  },
  {
    full_name: "Elliott",
    email: "394e3da6b0@webxios.pro",
    password: "394e3da6b0@webxios.pro",
    role: "scheduling_committee",
  },
  {
    full_name: "Doe",
    email: "f5545f4c5d@webxios.pro",
    password: "f5545f4c5d@webxios.pro",
    role: "registrar",
  },
  {
    full_name: "John Doe",
    email: "d05e85a298@webxios.pro",
    password: "d05e85a298@webxios.pro",
    role: "faculty",
  },
];
