import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateNoteForm } from "./actions";
import { ACADEMIC_YEARS, ALL_UNIVERSITIES, SEMESTERS } from "@/lib/constants";
import { formatMaxPdfSize } from "@/lib/pdf-validation";
import { getNoteTags, getPopularTags } from "@/lib/tags";
import { TagField } from "@/components/TagField";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; duplicate?: string }>;
};

export const metadata = { title: "Modifica appunto" };

export default async function ModificaAppuntoPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { error, duplicate } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/auth/login?next=/appunti/${id}/modifica`);

  const { data: note } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!note) redirect("/profilo");

  const existingTags = await getNoteTags(supabase, id);
  const popularTags = await getPopularTags(supabase);

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <Link href={`/appunti/${id}`} className="text-sm font-medium text-sage hover:underline">
        ← Torna all&apos;appunto
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-foreground">Modifica appunto</h1>

      {error && (
        <p className="mt-4 rounded-xl border border-sage/20 bg-mint-light/60 px-4 py-3 text-sm text-sage-dark">
          {decodeURIComponent(error)}
        </p>
      )}
      {duplicate && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Esiste già un appunto simile. Puoi comunque salvare aggiungendo{" "}
          <code className="text-xs">force=1</code> nel form (campo nascosto sotto).
        </p>
      )}

      <form action={updateNoteForm} className="card mt-8 space-y-5 rounded-2xl p-6">
        <input type="hidden" name="note_id" value={id} />
        {duplicate && <input type="hidden" name="force" value="1" />}
        <Field label="Titolo *" name="title" defaultValue={note.title} required />
        <Field label="Corso *" name="course" defaultValue={note.course} required />
        <div>
          <label htmlFor="university" className="block text-sm font-medium text-muted">
            Università *
          </label>
          <select
            id="university"
            name="university"
            required
            defaultValue={note.university}
            className="input-field mt-1 w-full px-4 py-3"
          >
            {note.university &&
              !ALL_UNIVERSITIES.some((u) => u === note.university) && (
              <option value={note.university}>{note.university}</option>
            )}
            {ALL_UNIVERSITIES.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="faculty" className="block text-sm font-medium text-muted">
            Facoltà / SSD
          </label>
          <input
            id="faculty"
            name="faculty"
            defaultValue={note.faculty}
            className="input-field mt-1 w-full px-4 py-3"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="academic_year" className="block text-sm font-medium text-muted">
              Anno accademico
            </label>
            <select
              id="academic_year"
              name="academic_year"
              defaultValue={note.academic_year}
              className="input-field mt-1 w-full px-4 py-3"
            >
              <option value="">—</option>
              {ACADEMIC_YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="semester" className="block text-sm font-medium text-muted">
              Semestre
            </label>
            <select
              id="semester"
              name="semester"
              defaultValue={note.semester}
              className="input-field mt-1 w-full px-4 py-3"
            >
              <option value="">—</option>
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        <TagField defaultValue={existingTags.join(", ")} popularTags={popularTags} />
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-muted">
            Descrizione
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={note.description}
            className="input-field mt-1 w-full px-4 py-3"
          />
        </div>
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-muted">
            Nuova versione PDF (opzionale, max {formatMaxPdfSize()})
          </label>
          <input
            id="file"
            name="file"
            type="file"
            accept="application/pdf"
            className="mt-1 w-full text-sm text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-sage file:px-4 file:py-2 file:text-sm file:font-medium file:text-surface"
          />
        </div>
        <button type="submit" className="btn-primary w-full py-3">
          Salva modifiche
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-muted">
        {label}
      </label>
      <input
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="input-field mt-1 w-full px-4 py-3"
      />
    </div>
  );
}
