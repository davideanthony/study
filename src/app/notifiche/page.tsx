import Link from "next/link";
import { requireCachedUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  markAllNotificationsRead,
  markNotificationReadForm,
} from "@/app/social/actions";
import { formatCommentDate } from "@/lib/notes";
import type { Notification } from "@/types/database";

export const metadata = { title: "Notifiche" };

export default async function NotifichePage() {
  const user = await requireCachedUser("/notifiche");
  const supabase = await createClient();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const items = (notifications ?? []) as Notification[];
  const unread = items.filter((n) => !n.read_at).length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Notifiche</h1>
        {unread > 0 && (
          <form action={markAllNotificationsRead}>
            <button
              type="submit"
              className="text-sm font-medium text-sage hover:underline"
            >
              Segna tutte come lette
            </button>
          </form>
        )}
      </div>

      {items.length === 0 ? (
        <p className="mt-12 text-muted">Nessuna notifica per ora.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {items.map((n) => (
            <li
              key={n.id}
              className={`card rounded-xl p-4 ${!n.read_at ? "border-sage/30 bg-mint-light/20" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">{n.title}</p>
                  {n.body && <p className="mt-1 text-sm text-muted">{n.body}</p>}
                  <time className="mt-2 block text-xs text-muted">
                    {formatCommentDate(n.created_at)}
                  </time>
                </div>
                {!n.read_at && (
                  <form action={markNotificationReadForm}>
                    <input type="hidden" name="notification_id" value={n.id} />
                    <button type="submit" className="text-xs text-sage hover:underline">
                      Letta
                    </button>
                  </form>
                )}
              </div>
              {n.link && (
                <Link
                  href={n.link}
                  className="mt-3 inline-block text-sm font-medium text-sage hover:underline"
                >
                  Apri →
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
