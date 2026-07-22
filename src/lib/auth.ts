import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import type { Role } from "@/generated/prisma/client";
import { HttpError } from "./http";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-me",
);
const COOKIE = "bg_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionUser {
  id: string;
  mobile: string;
  role: Role;
}

// ── password ──
export const hashPassword = (pw: string) => bcrypt.hash(pw, 10);
export const verifyPassword = (pw: string, hash: string) =>
  bcrypt.compare(pw, hash);

// ── session (httpOnly JWT cookie) ──
export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ mobile: user.mobile, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      id: payload.sub as string,
      mobile: payload.mobile as string,
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new HttpError(401, "Not authenticated");
  // Re-check the account is still active — deactivation must revoke live sessions,
  // not just block fresh logins. (Dynamic import avoids a client-bundle cycle.)
  const { default: prisma } = await import("./prisma");
  const account = await prisma.user.findUnique({
    where: { id: session.id },
    select: { isActive: true },
  });
  if (!account || !account.isActive) {
    throw new HttpError(401, "Your account is no longer active");
  }
  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireUser();
  if (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
    throw new HttpError(403, "Admin access required");
  }
  return session;
}

export async function requireSuperAdmin(): Promise<SessionUser> {
  const session = await requireUser();
  if (session.role !== "SUPER_ADMIN") {
    throw new HttpError(403, "Super-admin access required");
  }
  return session;
}
