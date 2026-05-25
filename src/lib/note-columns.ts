import type { NoteWithAuthor } from "@/types/database";

/** Colonne per liste/card — esclude pdf_text e altri campi pesanti. */
export const NOTE_LIST_COLUMNS =
  "id, user_id, title, course, university, description, academic_year, semester, faculty, file_path, file_name, download_count, like_count, created_at, version_number, profiles(username, full_name, avatar_url)";

export function asNotesWithAuthor(data: unknown): NoteWithAuthor[] {
  return (data ?? []) as NoteWithAuthor[];
}

export function asNoteWithAuthor(data: unknown): NoteWithAuthor {
  return data as NoteWithAuthor;
}
