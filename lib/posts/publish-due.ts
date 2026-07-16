import type { SupabaseClient } from "@supabase/supabase-js";

export type PublishDueResult = {
  published: string[];
  count: number;
  now: string;
};

/**
 * Publish blog posts whose status is `scheduled` and whose `scheduled_at`
 * is at or before now. Sets status to published, uses scheduled_at as
 * published_at (intended go-live time), and clears scheduled_at.
 */
export async function publishDueScheduledPosts(
  db: SupabaseClient,
  options?: { limit?: number },
): Promise<PublishDueResult> {
  const limit = Math.min(Math.max(options?.limit ?? 50, 1), 100);
  const now = new Date().toISOString();

  const { data: due, error } = await db
    .from("posts")
    .select("id, scheduled_at")
    .eq("status", "scheduled")
    .not("scheduled_at", "is", null)
    .lte("scheduled_at", now)
    .order("scheduled_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  if (!due?.length) {
    return { published: [], count: 0, now };
  }

  const published: string[] = [];

  await Promise.all(
    due.map(async (row) => {
      const publishedAt =
        typeof row.scheduled_at === "string" && row.scheduled_at
          ? row.scheduled_at
          : now;

      const { data, error: updateError } = await db
        .from("posts")
        .update({
          status: "published",
          published_at: publishedAt,
          scheduled_at: null,
          updated_at: now,
        })
        .eq("id", row.id)
        // Only flip if still scheduled (avoids races with manual edits)
        .eq("status", "scheduled")
        .select("id")
        .maybeSingle();

      if (!updateError && data?.id) {
        published.push(data.id as string);
      }
    }),
  );

  return { published, count: published.length, now };
}
