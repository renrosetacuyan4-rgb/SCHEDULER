import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import crypto from "node:crypto";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: "You must be signed in before connecting TikTok.",
      },
      { status: 401 }
    );
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;

  if (!clientKey || !redirectUri) {
  console.error("TikTok OAuth configuration check failed.", {
    hasClientKey: Boolean(clientKey),
    hasRedirectUri: Boolean(redirectUri),
    nodeEnv: process.env.NODE_ENV,
  });

  return NextResponse.json(
    {
      success: false,
      error: "TikTok OAuth is not configured.",
      diagnostics: {
        hasClientKey: Boolean(clientKey),
        hasRedirectUri: Boolean(redirectUri),
        nodeEnv: process.env.NODE_ENV,
      },
    },
    { status: 500 }
  );
}

  // Generate a cryptographically random OAuth state value.
  const state = crypto.randomBytes(32).toString("hex");

  const authorizeUrl = new URL(
    "https://www.tiktok.com/v2/auth/authorize/"
  );

  authorizeUrl.searchParams.set(
    "client_key",
    clientKey
  );

  authorizeUrl.searchParams.set(
    "response_type",
    "code"
  );

  authorizeUrl.searchParams.set(
    "scope",
    "user.info.basic,video.publish"
  );

  authorizeUrl.searchParams.set(
    "redirect_uri",
    redirectUri
  );

  authorizeUrl.searchParams.set(
    "state",
    state
  );

  const response = NextResponse.redirect(
    authorizeUrl.toString()
  );

  // Store the same state in a short-lived,
  // HTTP-only cookie so the callback can verify it.
  response.cookies.set({
    name: "tiktok_oauth_state",
    value: state,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  return response;
}
