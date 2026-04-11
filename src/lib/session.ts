import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  apiKey: string;
}

const SESSION_TTL = 60 * 60 * 4; // 4 hours = 14400 seconds

export const sessionOptions = {
  password: process.env.SESSION_SECRET ?? "complex_password_at_least_32_characters_long_default",
  cookieName: "sg_admin_session",
  ttl: SESSION_TTL,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: SESSION_TTL,
    path: "/",
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
