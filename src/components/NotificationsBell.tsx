import { createClient } from "@/lib/supabase/server";
import { NotificationsBellClient } from "@/components/NotificationsBellClient";

export async function NotificationsBell() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);

  return (
    <NotificationsBellClient userId={user.id} initialUnread={count ?? 0} />
  );
}
