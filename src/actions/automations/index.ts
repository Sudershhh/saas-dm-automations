"use server";

import { onCurrentUser } from "../user";
import {
  createAutomation,
  findAutomation,
  getAutomations,
  updateAutomation,
  addListener,
  addTrigger,
  addKeyword,
  deleteKeywordQuery,
  addPost,
} from "./queries";

import { INSTAGRAM_GRAPH_API_VERSION } from "@/lib/fetch";
import { findUser } from "../user/queries";

export const createAutomations = async (id?: string) => {
  const user = await onCurrentUser();
  try {
    const create = await createAutomation(user.id, id);
    if (create) {
      return {
        status: 200,
        data: "Automation Created",
      };
    }
  } catch (error) {
    return { status: 500, data: "Internal Server Error" };
  }
};

export const getAllAutomations = async () => {
  const user = await onCurrentUser();
  try {
    const automations = await getAutomations(user.id);

    if (automations) return { status: 200, data: automations.automations };

    return { status: 404, data: [] };
  } catch (error) {
    return { status: 500, data: [] };
  }
};

export const getAutomationInfo = async (id: string) => {
  await onCurrentUser();
  try {
    const automation = await findAutomation(id);
    if (automation) return { status: 200, data: automation };

    return { status: 404 };
  } catch (error) {
    return { status: 500 };
  }
};

export const updateAutomationName = async (
  automationId: string,
  data: {
    name?: string;
    active?: boolean;
    automation?: string;
  }
) => {
  await onCurrentUser();
  try {
    const update = await updateAutomation(automationId, data);
    if (update) {
      return { status: 200, data: "Automation successfully updated" };
    }
    return { status: 404, data: "Oops! could not find automation" };
  } catch (error) {
    return { status: 500, data: "Oops! something went wrong" };
  }
};

export const activateAutomation = async (id: string, state: boolean) => {
  await onCurrentUser();
  try {
    const update = await updateAutomation(id, { active: state });
    if (update)
      return {
        status: 200,
        data: `Automation ${state ? "activated" : "disabled"}`,
      };
    return { status: 404, data: "Automation not found" };
  } catch (error) {
    return { status: 500, data: "Oops! something went wrong" };
  }
};

export const saveListener = async (
  automationId: string,
  listener: "SMARTAI" | "MESSAGE",
  prompt: string,
  reply?: string
) => {
  await onCurrentUser();
  try {
    const create = await addListener(automationId, listener, prompt, reply);
    if (create) {
      return { status: 200, data: "Listener saved" };
    }
    return { status: 404, data: "Oops! could not save listener" };
  } catch (error) {
    return { status: 500, data: "Oops! something went wrong" };
  }
};

export const saveTrigger = async (automationId: string, trigger: string[]) => {
  await onCurrentUser();
  try {
    const create = await addTrigger(automationId, trigger);
    if (create) {
      return { status: 200, data: "Trigger saved" };
    }
    return { status: 404, data: "Oops! could not save trigger" };
  } catch (error) {
    return { status: 500, data: "Oops! something went wrong" };
  }
};
export const saveKeyword = async (automationId: string, keyword: string) => {
  await onCurrentUser();
  try {
    const create = await addKeyword(automationId, keyword);
    if (create) {
      return { status: 200, data: "Keyword saved" };
    }
    return { status: 404, data: "Oops! could not save keywords" };
  } catch (error) {
    return { status: 500, data: "Oops! something went wrong" };
  }
};

export const deleteKeyword = async (id: string) => {
  await onCurrentUser();
  try {
    const deleted = await deleteKeywordQuery(id);
    if (deleted) {
      return { status: 200, data: "Keyword deleted" };
    }
    return { status: 404, data: "Oops! could not delete keyword" };
  } catch (error) {
    return { status: 500, data: "Oops! something went wrong" };
  }
};

const IG_MEDIA_PATH = `${INSTAGRAM_GRAPH_API_VERSION}/me/media`;

export const getProfilePosts = async () => {
  const user = await onCurrentUser();
  try {
    const profile = await findUser(user.id);
    const token = profile?.integrations?.[0]?.token;

    if (!token) {
      return {
        status: 404,
        data: { message: "Connect Instagram in Integrations to load posts." },
      };
    }

    const url = `${process.env.INSTAGRAM_BASE_URL}/${IG_MEDIA_PATH}?fields=id,caption,media_url,media_type,timestamp&limit=10&access_token=${encodeURIComponent(token)}`;
    const posts = await fetch(url);
    let parsed: unknown;
    try {
      parsed = await posts.json();
    } catch {
      return { status: 502, data: { message: "Invalid response from Instagram." } };
    }

    if (parsed && typeof parsed === "object" && "error" in parsed) {
      const err = (parsed as { error: { code?: number; message?: string; type?: string } })
        .error;
      return {
        status: 401,
        data: {
          code: err.code,
          message: err.message ?? "Instagram rejected the access token.",
          type: err.type,
          needsReconnect: err.code === 190,
        },
      };
    }

    if (!posts.ok) {
      return {
        status: posts.status >= 400 && posts.status < 600 ? posts.status : 502,
        data: { message: "Could not load posts from Instagram." },
      };
    }

    const body = parsed as { data?: unknown };
    if (!Array.isArray(body.data)) {
      return { status: 502, data: { message: "Unexpected response from Instagram." } };
    }

    return { status: 200, data: parsed as { data: unknown[]; paging?: unknown } };
  } catch (error) {
    console.log(" server side Error in getting posts ", error);
    return { status: 500, data: { message: "Something went wrong loading posts." } };
  }
};

export const savePosts = async (
  autmationId: string,
  posts: {
    postid: string;
    caption?: string;
    media: string;
    mediaType: "IMAGE" | "VIDEO" | "CAROSEL_ALBUM";
  }[]
) => {
  await onCurrentUser();
  try {
    const create = await addPost(autmationId, posts);

    if (create) return { status: 200, data: "Posts attached" };

    return { status: 404, data: "Automation not found" };
  } catch (error) {
    return { status: 500, data: "Oops! something went wrong" };
  }
};
