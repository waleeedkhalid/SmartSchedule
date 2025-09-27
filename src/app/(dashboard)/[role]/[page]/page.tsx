import { notFound } from "next/navigation";

import { rolePageRegistry } from "@/components/dashboard/page-registry";
import { allPages } from "@/data/dashboard";
import { isRoleKey, type RoleKey } from "@/types/dashboard";

export async function generateStaticParams() {
  return allPages.map((entry) => ({ role: entry.role, page: entry.page }));
}

type PageProps = {
  params: Promise<{
    role: string;
    page: string;
  }>;
};

export default async function RoleDashboardPage({ params }: PageProps) {
  const { role, page } = await params;

  if (!isRoleKey(role)) {
    notFound();
  }

  const componentMap = rolePageRegistry[role as RoleKey];
  const Component = componentMap?.[page];

  if (!Component) {
    notFound();
  }

  return <Component />;
}
