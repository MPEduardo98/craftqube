// app/global/lib/auth/jwt.ts
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const ACCESS_SECRET  = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET  ?? "dev-access-secret-change-me");
const REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret-change-me");

export interface AccessPayload extends JWTPayload {
  sub:   string;
  email: string;
  rol:   string;
}

export async function signAccessToken(payload: Omit<AccessPayload, "iat" | "exp">) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(ACCESS_SECRET);
}

export async function signRefreshToken(usuarioId: number) {
  return new SignJWT({ sub: String(usuarioId) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(REFRESH_SECRET);
}

export async function verifyAccessToken(token: string): Promise<AccessPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    return payload as AccessPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return payload;
  } catch {
    return null;
  }
}