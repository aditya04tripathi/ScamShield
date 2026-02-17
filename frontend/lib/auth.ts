import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export interface Session {
  user: {
    id: string;
    email: string;
    role: "user" | "admin" | "analyst";
  };
  expires: Date;
}

const SECRET_KEY =
  process.env.JWT_SECRET_KEY || "your-secret-key-at-least-32-chars-long";
const key = new TextEncoder().encode(SECRET_KEY);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

export async function createSession(user: {
  id: string;
  email: string;
  role: string;
}) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = await encrypt({ user, expires });

  (await cookies()).set("session", session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession(): Promise<Session | null> {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  try {
    return (await decrypt(session)) as Session;
  } catch (error) {
    return null;
  }
}

export async function updateSession() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return;

  const parsed = await decrypt(session);
  parsed.expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const res = NextResponse.next();
  res.cookies.set({
    name: "session",
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  });
  return res;
}

export async function deleteSession() {
  (await cookies()).delete("session");
}

export async function getUser() {
  const session = await getSession();
  return session?.user;
}
