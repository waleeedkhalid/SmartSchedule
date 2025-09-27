import { prisma } from "./prisma";
// import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { Role } from "@prisma/client";

const SESSION_COOKIE = "smartschedule_session";

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  // const valid = await bcrypt.compare(password, user.password);
  // if (!valid) return null;
  if (password !== user.password) return null;

  (await cookies()).set(SESSION_COOKIE, user.id, { httpOnly: true });
  return { id: user.id, role: user.role as Role };
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function currentUser() {
  const id = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!id) return null;

  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true },
  });
}
