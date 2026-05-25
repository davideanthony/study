export type Profile = {
  id: string;
  username: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  default_university: string;
  is_admin: boolean;
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
  thumbnail_path?: string | null;
  download_count: number;
  like_count: number;
  academic_year: string;
  semester: string;
  faculty: string;
  version_number: number;
  created_at: string;
};

export type NoteWithAuthor = Note & {
  profiles: Pick<Profile, "username" | "full_name" | "avatar_url"> | null;
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
  hidden_at: string | null;
  hidden_by: string | null;
  created_at: string;
  profiles: Pick<Profile, "username" | "full_name"> | null;
};

export type DmConversation = {
  id: string;
  participant_a: string;
  participant_b: string;
  created_at: string;
  updated_at: string;
};

export type DmMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  link: string;
  read_at: string | null;
  created_at: string;
};

export type ContentReport = {
  id: string;
  reporter_id: string;
  note_id: string | null;
  comment_id: string | null;
  reason: string;
  details: string;
  status: "open" | "reviewed" | "dismissed";
  created_at: string;
};
