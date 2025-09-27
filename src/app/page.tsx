import { redirect } from "next/navigation";

import { defaultRole, getDefaultPath } from "@/data/dashboard";

export default function App() {
  redirect(getDefaultPath(defaultRole));
}
