import axios from "axios";

/** Graph API version for Instagram Platform requests (keep in sync across media, messaging, etc.). */
export const INSTAGRAM_GRAPH_API_VERSION = "v21.0";

/** Must match exactly what you add under Meta app → Instagram → OAuth redirect URIs. */
export const instagramOAuthRedirectUri = () => {
  const base = (process.env.NEXT_PUBLIC_HOST_URL ?? "").replace(/\/$/, "");
  return `${base}/callback/instagram`;
};

const INSTAGRAM_OAUTH_SCOPES =
  "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights";

/** Authorize URL: redirect_uri always matches token exchange (generateTokens). */
export const buildInstagramAuthorizeUrl = () => {
  const params = new URLSearchParams({
    enable_fb_login: "0",
    force_authentication: "1",
    client_id: process.env.INSTAGRAM_CLIENT_ID as string,
    redirect_uri: instagramOAuthRedirectUri(),
    response_type: "code",
    scope: INSTAGRAM_OAUTH_SCOPES,
  });
  return `https://www.instagram.com/oauth/authorize?${params.toString()}`;
};

/* 

1. Short Lived Access Token
  - Initial Token received from Instagram after authentication
  - Obtained through the OAuthflow in the `generateTokens` function
  - Validity: 1 hour
  - Exchanged for Long Lived Token

2. Long Lived Access Token
  - Validity: 60 days
  - Used to make requests to the Instagram API
  - Used for making API calls over an extended period without requiring the user to re-authenticate.


3. Refresh Access Token
  - Used to refresh the long-lived access token
  - Validity: Called Periodically
  - Used to maintain access to the Instagram API

*/

//Refresh Instagram access token to maintain access
export const refreshToken = async (token: string) => {
  const refresh_token = await axios.get(
    `${process.env.INSTAGRAM_BASE_URL}/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`
  );

  return refresh_token.data;
};

//Sending Direct Messages
export const sendDM = async (
  userId: string,
  recieverId: string,
  prompt: string,
  token: string
) => {
  console.log("sending message");
  return await axios.post(
    `${process.env.INSTAGRAM_BASE_URL}/${INSTAGRAM_GRAPH_API_VERSION}/${userId}/messages`,
    {
      recipient: {
        id: recieverId,
      },
      message: {
        text: prompt,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
};

//Sending Private replies to comments
export const sendPrivateMessage = async (
  userId: string,
  recieverId: string,
  prompt: string,
  token: string
) => {
  console.log("sending message");
  return await axios.post(
    `${process.env.INSTAGRAM_BASE_URL}/${INSTAGRAM_GRAPH_API_VERSION}/${userId}/messages`,
    {
      recipient: {
        comment_id: recieverId,
      },
      message: {
        text: prompt,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
};

//exchange a short-lived access token for a long-lived one during the authentication process
export const generateTokens = async (code: string) => {
  const insta_form = new FormData();
  insta_form.append("client_id", process.env.INSTAGRAM_CLIENT_ID as string);

  insta_form.append(
    "client_secret",
    process.env.INSTAGRAM_CLIENT_SECRET as string
  );
  insta_form.append("grant_type", "authorization_code");
  insta_form.append("redirect_uri", instagramOAuthRedirectUri());
  insta_form.append("code", code);

  const shortTokenRes = await fetch(process.env.INSTAGRAM_TOKEN_URL as string, {
    method: "POST",
    body: insta_form,
  });

  const token = await shortTokenRes.json();
  if (token.permissions.length > 0) {
    console.log(token, "got permissions");
    const long_token = await axios.get(
      `${process.env.INSTAGRAM_BASE_URL}/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_CLIENT_SECRET}&access_token=${token.access_token}`
    );

    return long_token.data;
  }
};
