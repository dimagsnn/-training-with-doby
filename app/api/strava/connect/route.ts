import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRedirectUri, STRAVA_AUTH_URL } from "@/lib/strava/config";

export async function GET() {
  const supabase = await createClient();

  let {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    user = data.user;
  }

  const state = randomBytes(32).toString("hex");
  const cookieStore = await cookies();

  cookieStore.set("strava_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    redirect_uri: getRedirectUri(),
    response_type: "code",
    approval_prompt: "auto",
    scope: "read,activity:read_all",
    state,
  });

  return NextResponse.redirect(`${STRAVA_AUTH_URL}?${params.toString()}`);
}
