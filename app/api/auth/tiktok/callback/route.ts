import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");
  const returnedState = requestUrl.searchParams.get("state");
  const tiktokError = requestUrl.searchParams.get("error");
  const tiktokErrorDescription =
    requestUrl.searchParams.get("error_description");

  const redirectToScheduler = (status: string) => {
    return NextResponse.redirect(
      new URL(`/scheduler?tiktok=${status}`, requestUrl.origin)
    );
  };

  // 1. Handle authorization errors returned by TikTok.
  if (tiktokError) {
    console.error("TikTok authorization failed:", {
      error: tiktokError,
      description: tiktokErrorDescription,
    });

    return redirectToScheduler("error");
  }

  // 2. Make sure TikTok returned the required parameters.
  if (!code || !returnedState) {
    console.error(
      "TikTok callback is missing the authorization code or state."
    );

    return redirectToScheduler("missing_parameters");
  }

  // 3. Validate the OAuth state against the cookie created by
  // app/api/tiktok/connect/route.ts.
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error(
      "Supabase user session was unavailable during TikTok callback:",
      userError?.message
    );

    return redirectToScheduler("auth_error");
  }

  const stateCookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("tiktok_oauth_state="));

  const storedState = stateCookie
    ? decodeURIComponent(
        stateCookie.slice("tiktok_oauth_state=".length)
      )
    : null;

  if (!storedState || storedState !== returnedState) {
    console.error("TikTok OAuth state validation failed.");

    return redirectToScheduler("state_error");
  }

  // 4. Read server-side OAuth configuration.
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;

  if (!clientKey || !clientSecret || !redirectUri) {
    console.error("TikTok OAuth configuration is incomplete.");

    return redirectToScheduler("config_error");
  }

  // 5. Exchange the authorization code for TikTok tokens.
  let tokenResponse: Response;
  let tokenData: Record<string, unknown>;

  try {
    tokenResponse = await fetch(
      "https://open.tiktokapis.com/v2/oauth/token/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Cache-Control": "no-cache",
        },
        body: new URLSearchParams({
          client_key: clientKey,
          client_secret: clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }).toString(),
        cache: "no-store",
      }
    );

    tokenData = await tokenResponse.json();
  } catch (error) {
    console.error("TikTok token exchange request failed:", error);

    return redirectToScheduler("token_error");
  }

  if (!tokenResponse.ok) {
    console.error("TikTok token exchange returned an error:", {
      httpStatus: tokenResponse.status,
      error: tokenData.error,
      errorDescription: tokenData.error_description,
      logId: tokenData.log_id,
    });

    return redirectToScheduler("token_error");
  }

  // TikTok's token endpoint returns token data inside "data"
  // when the request succeeds.
  const tokenPayload =
    tokenData.data &&
    typeof tokenData.data === "object"
      ? (tokenData.data as Record<string, unknown>)
      : tokenData;

  const openId = tokenPayload.open_id;
  const accessToken = tokenPayload.access_token;
  const refreshToken = tokenPayload.refresh_token;
  const expiresIn = tokenPayload.expires_in;
  const refreshExpiresIn = tokenPayload.refresh_expires_in;
  const scope = tokenPayload.scope;

  if (
    typeof openId !== "string" ||
    typeof accessToken !== "string" ||
    typeof refreshToken !== "string" ||
    typeof expiresIn !== "number"
  ) {
    console.error(
      "TikTok token response did not contain the required fields."
    );

    return redirectToScheduler("token_error");
  }

  // 6. Calculate token expiration times.
  const now = Date.now();

  const accessTokenExpiresAt = new Date(
    now + expiresIn * 1000
  ).toISOString();

  const refreshTokenExpiresAt =
    typeof refreshExpiresIn === "number"
      ? new Date(now + refreshExpiresIn * 1000).toISOString()
      : null;

  // 7. Store the tokens server-side in Supabase.
  const { error: databaseError } = await supabase
    .from("tiktok_connections")
    .upsert(
      {
        user_id: user.id,
        open_id: openId,
        access_token: accessToken,
        refresh_token: refreshToken,
        access_token_expires_at: accessTokenExpiresAt,
        refresh_token_expires_at: refreshTokenExpiresAt,
        scope: typeof scope === "string" ? scope : null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

  if (databaseError) {
    console.error(
      "Failed to save TikTok connection:",
      databaseError.message
    );

    return redirectToScheduler("database_error");
  }

  // 8. Return to the scheduler and clear the one-time state cookie.
  console.log("TikTok account connected successfully.");

  const response = redirectToScheduler("connected");

  response.cookies.set({
    name: "tiktok_oauth_state",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
