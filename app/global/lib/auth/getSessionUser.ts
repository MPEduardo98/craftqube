// app/global/lib/auth/getSessionUser.ts
import { getAccessToken }                    from "./cookies";
import { verifyAccessToken, type AccessPayload } from "./jwt";

export async function getSessionUser(): Promise<AccessPayload | null> {
  const token = await getAccessToken();
  if (!token) return null;
  return verifyAccessToken(token);
}