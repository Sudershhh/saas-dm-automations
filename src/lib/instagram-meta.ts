/**
 * Meta long-lived token exchange and refresh responses include `expires_in` (seconds).
 * Use this for DB `expiresAt` instead of a fixed +60 day guess when the API provides it.
 */
export function expiresAtFromExpiresIn(data: {
  expires_in?: number;
}): Date {
  const seconds = data.expires_in;
  if (typeof seconds === "number" && Number.isFinite(seconds) && seconds > 0) {
    return new Date(Date.now() + seconds * 1000);
  }
  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 60);
  return fallback;
}
