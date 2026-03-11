// app/global/lib/auth/cookies.ts
import { cookies } from "next/headers";

const IS_PROD = process.env.NODE_ENV === "production";

export const ACCESS_COOKIE  = "cq_access";
export const REFRESH_COOKIE = "cq_refresh";

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const jar = await cookies();

  jar.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure:   IS_PROD,
    sameSite: "lax",
    path:     "/",
    maxAge:   60 * 15,
  });

  jar.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure:   IS_PROD,
    sameSite: "lax",
    path:     "/api/auth",
    maxAge:   60 * 60 * 24 * 30,
  });
}

export async function clearAuthCookies() {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

export async function getAccessToken(): Promise<string | null> {
  return (await cookies()).get(ACCESS_COOKIE)?.value ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
  return (await cookies()).get(REFRESH_COOKIE)?.value ?? null;
}