"use server";

import { findUser } from "../user/queries";
import { refreshToken } from "@/lib/fetch";
import { updateIntegration } from "./queries";
import { expiresAtFromExpiresIn } from "@/lib/instagram-meta";

/**
 * Proactively refresh Instagram long-lived token when expiry is within 5 days.
 * Safe to call from dashboard layout / getProfilePosts; failures are logged only.
 */
export async function ensureFreshInstagramToken(clerkId: string): Promise<void> {
  try {
    const found = await findUser(clerkId);
    if (!found?.integrations?.length) return;

    const ig = found.integrations[0];
    if (!ig.token) return;

    const now = Date.now();
    const expiresMs = ig.expiresAt?.getTime();
    const daysLeft =
      expiresMs === undefined
        ? 0
        : Math.round((expiresMs - now) / (1000 * 3600 * 24));

    if (daysLeft >= 5) return;

    const refresh = await refreshToken(ig.token);
    if (!refresh?.access_token) {
      console.log("ensureFreshInstagramToken: refresh returned no access_token");
      return;
    }

    const newExpires = expiresAtFromExpiresIn(refresh);
    await updateIntegration(refresh.access_token, newExpires, ig.id);
  } catch (e) {
    console.log("ensureFreshInstagramToken failed", e);
  }
}
