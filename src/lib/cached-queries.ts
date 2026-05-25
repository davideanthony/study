import { unstable_cache } from "next/cache";
import { NOTE_LIST_COLUMNS, asNotesWithAuthor } from "@/lib/note-columns";
import { createPublicClient } from "@/lib/supabase/public";
import type { NoteWithAuthor } from "@/types/database";

const RECENT_NOTES_TAG = "recent-notes";

/** Appunti recenti per visitatori anonimi (ISR 60s). */
export const getCachedRecentNotes = unstable_cache(
  async (): Promise<NoteWithAuthor[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("notes")
      .select(NOTE_LIST_COLUMNS)
      .order("created_at", { ascending: false })
      .limit(6);

    if (error) {
      console.error("[getCachedRecentNotes]", error.message);
      return [];
    }
    return asNotesWithAuthor(data);
  },
  [RECENT_NOTES_TAG],
  { revalidate: 60, tags: [RECENT_NOTES_TAG] },
);
