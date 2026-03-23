"use server";

import { redirect } from "next/navigation";
import { onCurrentUser } from "../user";
import {
  createIntegration,
  getIntegration,
  updateIntegration,
} from "./queries";
import { findUser } from "../user/queries";
import { generateTokens } from "@/lib/fetch";
import { expiresAtFromExpiresIn } from "@/lib/instagram-meta";
import axios from "axios";

export const onOAuthInstagram = (strategy: "INSTAGRAM" | "CRM") => {
  if (strategy === "INSTAGRAM") {
    return redirect(process.env.INSTAGRAM_EMBEDDED_OAUTH_URL as string);
  } else {
    console.log("CRM Auth");
  }
};

/** OAuth callback: create integration on first connect, or update tokens on reconnect. */
export const onIntegrate = async (code: string) => {
  const user = await onCurrentUser();

  try {
    const integration = await getIntegration(user.id);
    if (!integration) {
      return { status: 404 };
    }

    const tokenData = await generateTokens(code);
    if (!tokenData?.access_token) {
      console.log("🔴 401 no long-lived token");
      return { status: 401 };
    }

    const expiresAt = expiresAtFromExpiresIn(tokenData);

    const insta_id = await axios.get(
      `${process.env.INSTAGRAM_BASE_URL}/me?fields=user_id&access_token=${tokenData.access_token}`
    );

    const igUserId = insta_id.data?.user_id as string | undefined;

    if (integration.integrations.length === 0) {
      await createIntegration(
        user.id,
        tokenData.access_token,
        expiresAt,
        igUserId
      );
    } else {
      const existing = integration.integrations[0];
      await updateIntegration(
        tokenData.access_token,
        expiresAt,
        existing.id,
        igUserId
      );
    }

    const profile = await findUser(user.id);
    if (!profile?.firstname || !profile?.lastname) {
      return { status: 200, data: { firstname: "", lastname: "" } };
    }

    return {
      status: 200,
      data: {
        firstname: profile.firstname,
        lastname: profile.lastname,
      },
    };
  } catch (error) {
    console.log("🔴 500", error);
    return { status: 500 };
  }
};
