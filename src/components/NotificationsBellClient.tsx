"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type NotificationsBellClientProps = {
  userId: string;
  initialUnread: number;
};

export function NotificationsBellClient({
  userId,
  initialUnread,
}: NotificationsBellClientProps) {
  const [unread, setUnread] = useState(initialUnread);

  useEffect(() => {
    setUnread(initialUnread);
  }, [initialUnread]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          setUnread((n) => n + 1);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as { read_at: string | null };
          const old = payload.old as { read_at: string | null };
          if (!old?.read_at && row.read_at) {
            setUnread((n) => Math.max(0, n - 1));
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <Link
      href="/notifiche"
      className="relative rounded-full p-2 text-muted transition hover:bg-mint-light/50 hover:text-sage"
      aria-label={`Notifiche${unread > 0 ? `, ${unread} non lette` : ""}`}
    >
      <span aria-hidden>🔔</span>
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e25555] px-1 text-[10px] font-bold text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
