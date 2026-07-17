import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeCodeForToken } from "@/lib/strava/oauth";

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const baseUrl = getBaseUrl();

  if (error) {
    return NextResponse.redirect(
      `${baseUrl}/?error=${encodeURIComponent(error)}`
    );
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get("strava_oauth_state")?.value;

  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(`${baseUrl}/?error=invalid_state`);
  }

  cookieStore.delete("strava_oauth_state");

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/?error=no_code`);
  }

  try {
    const tokenData = await exchangeCodeForToken(code);
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`${baseUrl}/?error=not_authenticated`);
    }

    const expiresAt = new Date(tokenData.expires_at * 1000).toISOString();

    const { error: upsertError } = await supabase
      .from("strava_connections")
      .upsert(
        {
          user_id: user.id,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          athlete_id: tokenData.athlete.id,
          expires_at: expiresAt,
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      return NextResponse.redirect(
        `${baseUrl}/?error=${encodeURIComponent(upsertError.message)}`
      );
    }

    return NextResponse.redirect(`${baseUrl}/?connected=1`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error";
    return NextResponse.redirect(
      `${baseUrl}/?error=${encodeURIComponent(message)}`
    );
  }
}
