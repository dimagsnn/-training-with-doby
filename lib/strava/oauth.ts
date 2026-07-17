import { getRedirectUri, STRAVA_TOKEN_URL } from "./config";

export interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: {
    id: number;
  };
}

export async function exchangeCodeForToken(
  code: string
): Promise<StravaTokenResponse> {
  const response = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.STRAVA_CLIENT_ID!,
      client_secret: process.env.STRAVA_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: getRedirectUri(),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Strava token exchange failed: ${error}`);
  }

  return response.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<StravaTokenResponse> {
  const response = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.STRAVA_CLIENT_ID!,
      client_secret: process.env.STRAVA_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Strava token refresh failed: ${error}`);
  }

  return response.json();
}