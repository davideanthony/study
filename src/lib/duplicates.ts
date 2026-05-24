import type { SupabaseClient } from "@supabase/supabase-js";

export type DuplicateNote = {
  id: string;
  title: string;
  course: string;
  university: string;
};

export async function findDuplicateNotes(
  supabase: SupabaseClient,
  input: {
    title: string;
    course: string;
    university: string;
    excludeId?: string;
  },
): Promise<DuplicateNote[]> {
  let query = supabase
    .from("notes")
    .select("id, title, course, university")
    .ilike("title", input.title.trim())
    .ilike("course", input.course.trim())
    .ilike("university", input.university.trim())
    .limit(5);

  if (input.excludeId) {
    query = query.neq("id", input.excludeId);
  }

  const { data } = await query;
  return data ?? [];
}
