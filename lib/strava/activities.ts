import { STRAVA_API_URL } from "./config";

export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  distance: number;
  moving_time: number;
  start_date: string;
}

export async function fetchRecentActivities(
  accessToken: string,
  perPage = 10
): Promise<StravaActivity[]> {
  const response = await fetch(
    `${STRAVA_API_URL}/athlete/activities?per_page=${perPage}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch activities: ${response.statusText}`);
  }

  return response.json();
}
