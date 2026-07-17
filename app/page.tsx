import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  fetchRecentActivities,
  type StravaActivity,
} from "@/lib/strava/activities";
import { refreshAccessToken } from "@/lib/strava/oauth";

interface HomeProps {
  searchParams: Promise<{ connected?: string; error?: string }>;
}

function formatActivityDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let connection: {
    athlete_id: number;
    access_token: string;
    refresh_token: string;
    expires_at: string;
  } | null = null;

  if (user) {
    const { data } = await supabase
      .from("strava_connections")
      .select("athlete_id, access_token, refresh_token, expires_at")
      .eq("user_id", user.id)
      .single();
    connection = data;
  }

  let activities: StravaActivity[] = [];
  let activitiesError: string | null = null;

  if (connection?.access_token) {
    const isExpired = new Date(connection.expires_at) <= new Date();

    if (isExpired) {
      try {
        const refreshed = await refreshAccessToken(connection.refresh_token);
        const newExpiresAt = new Date(refreshed.expires_at * 1000).toISOString();

        await supabase
          .from("strava_connections")
          .update({
            access_token: refreshed.access_token,
            refresh_token: refreshed.refresh_token,
            expires_at: newExpiresAt,
          })
          .eq("user_id", user!.id);

        connection.access_token = refreshed.access_token;
      } catch (err) {
        activitiesError =
          err instanceof Error
            ? `Bağlantı yenilenemedi: ${err.message}`
            : "Strava bağlantısı yenilenemedi, lütfen tekrar bağlan.";
      }
    }

    if (!activitiesError) {
      try {
        activities = await fetchRecentActivities(connection.access_token);
      } catch (err) {
        activitiesError =
          err instanceof Error ? err.message : "Aktiviteler yüklenemedi.";
      }
    }
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col gap-8 py-32 px-16 bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
          Training with DOBY
        </h1>

        {params.connected === "1" && (
          <p className="rounded-lg bg-green-100 p-4 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            Strava bağlantısı başarıyla kuruldu!
          </p>
        )}

        {params.error && (
          <p className="rounded-lg bg-red-100 p-4 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            Hata: {decodeURIComponent(params.error)}
          </p>
        )}

        {!connection ? (
          <Link
            href="/api/strava/connect"
            className="inline-flex h-12 w-fit items-center justify-center rounded-full bg-orange-600 px-8 text-white transition-colors hover:bg-orange-700"
          >
            Strava&apos;ya Bağlan
          </Link>
        ) : (
          <div className="flex flex-col gap-6">
            <p className="text-zinc-700 dark:text-zinc-300">
              Strava Athlete ID:{" "}
              <span className="font-medium">{connection.athlete_id}</span>
            </p>

            <div>
              <h2 className="mb-4 text-xl font-medium text-black dark:text-zinc-50">
                Son Aktiviteler
              </h2>

              {activitiesError && (
                <p className="text-red-600 dark:text-red-400">
                  {activitiesError}
                </p>
              )}

              {!activitiesError && activities.length === 0 && (
                <p className="text-zinc-600 dark:text-zinc-400">
                  Henüz aktivite bulunamadı.
                </p>
              )}

              {activities.length > 0 && (
                <ul className="flex flex-col gap-3">
                  {activities.map((activity) => (
                    <li
                      key={activity.id}
                      className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
                    >
                      <p className="font-medium text-black dark:text-zinc-50">
                        {activity.name}
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {activity.type} •{" "}
                        {(activity.distance / 1000).toFixed(2)} km
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-500">
                        {formatActivityDate(activity.start_date)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}