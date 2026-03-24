"use server";

import { redirect } from "next/navigation";
import { onCurrentUser } from "../user";
import { createIntegration, getIntegration, updateIntegration } from "./queries";
import { findUser } from "../user/queries";
import {
  buildInstagramAuthorizeUrl,
  generateTokens,
  INSTAGRAM_GRAPH_API_VERSION,
} from "@/lib/fetch";
import axios from "axios";

export const onOAuthInstagram = (strategy: "INSTAGRAM" | "CRM") => {
  if (strategy === "INSTAGRAM") {
    return redirect(buildInstagramAuthorizeUrl());
  } else {
    console.log("CRM Auth");
  }
};

const igMeUrl = (accessToken: string) =>
  `${process.env.INSTAGRAM_BASE_URL}/${INSTAGRAM_GRAPH_API_VERSION}/me?fields=user_id&access_token=${accessToken}`;

export const onIntegrate = async (code: string) => {
  const user = await onCurrentUser();

  try {
    const integration = await getIntegration(user.id);

    if (!integration) {
      return { status: 404, data: null };
    }

    const token = await generateTokens(code);

    if (!token?.access_token) {
      return { status: 401, data: null };
    }

    const insta_id = await axios.get(igMeUrl(token.access_token));

    const today = new Date();
    const expire_date = today.setDate(today.getDate() + 60);
    const expiresAt = new Date(expire_date);

    if (integration.integrations.length === 0) {
      const create = await createIntegration(
        user.id,
        token.access_token,
        expiresAt,
        insta_id.data.user_id
      );
      return { status: 200, data: create };
    }

    const existing = integration.integrations[0];
    await updateIntegration(token.access_token, expiresAt, existing.id);

    const profile = await findUser(user.id);
    return {
      status: 200,
      data: {
        firstname: profile?.firstname ?? undefined,
        lastname: profile?.lastname ?? undefined,
      },
    };
  } catch (error) {
    console.log("🔴 500", error);
    return { status: 500, data: null };
  }
};
