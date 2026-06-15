import { cookies } from "next/headers";
import { getSessionById, createSession, deleteSession } from "@/db/queries/sessions";

const SESSION_COOKIE = "session_id";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const session = await getSessionById(sessionId);
  if (!session) return null;

  return {
    id: session.user_id,
    email: session.email,
    name: session.name,
    image: session.image,
  };
}

export async function setSessionCookie(userId: string) {
  const session = await createSession(userId);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: session.expiresAt,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    await deleteSession(sessionId);
  }
  cookieStore.delete(SESSION_COOKIE);
}
