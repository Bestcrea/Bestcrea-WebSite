import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export function getSession() {
  return getServerSession(authOptions);
}

export async function requireClientSession() {
  const session = await getSession();
  if (!session?.user?.id) {
    return null;
  }
  if (session.user.role !== "client" && session.user.role !== "admin") {
    return null;
  }
  return session;
}
