import { auth } from "@/lib/auth";

export function getApiSession(request) {
  return auth.api.getSession({ headers: request.headers });
}

export function isAdminSession(session) {
  return session?.user?.role === "admin";
}
