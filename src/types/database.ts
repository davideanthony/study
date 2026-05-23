export type Profile = {
  id: string;
  username: string;
  full_name: string;
  created_at: string;
};

export type Note = {
  id: string;
  user_id: string;
  title: string;
  course: string;
  university: string;
  description: string;
  file_path: string;
  file_name: string;
  download_count: number;
  created_at: string;
};

export type NoteWithAuthor = Note & {
  profiles: Pick<Profile, "username" | "full_name"> | null;
};

export type NoteStats = {
  likeCount: number;
  userLiked: boolean;
};

export type NoteComment = {
  id: string;
  note_id: string;
  user_id: string;
  body: string;
  created_at: string;
  profiles: Pick<Profile, "username" | "full_name"> | null;
};
