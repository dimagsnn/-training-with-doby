export const STRAVA_AUTH_URL = "https://www.strava.com/oauth/authorize";
export const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";
export const STRAVA_API_URL = "https://www.strava.com/api/v3";

export function getRedirectUri(): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${baseUrl}/api/strava/callback`;
}
