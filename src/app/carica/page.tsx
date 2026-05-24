import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { uploadNote } from "./actions";
import { ACADEMIC_YEARS, ALL_UNIVERSITIES, SEMESTERS } from "@/lib/constants";
import { formatMaxPdfSize } from "@/lib/pdf-validation";
import { getPopularTags } from "@/lib/tags";
import { TagField } from "@/components/TagField";

type PageProps = {
  searchParams: Promise<{
    error?: string;
    duplicate?: string;
    title?: string;
    course?: string;
    university?: string;
  }>;
};

export const metadata = { title: "Carica appunti" };

export default async function CaricaPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/carica");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_university")
    .eq("id", user.id)
    .single();

  const defaultUni = sp.university ?? profile?.default_university ?? "";
  const popularTags = await getPopularTags(supabase);

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground">Carica appunti</h1>
      <p className="mt-2 text-muted">
        Condividi un PDF (max {formatMaxPdfSize()}) con titolo, corso e università.
      </p>

      {sp.error && (
        <p className="mt-4 rounded-xl border border-sage/20 bg-mint-light/60 px-4 py-3 text-sm text-sage-dark">
          {sp.error}
        </p>
      )}
      {sp.duplicate && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p>Attenzione: esiste già un appunto con titolo, corso e università simili.</p>
          <p className="mt-2">
            Se vuoi pubblicarlo comunque, usa il pulsante qui sotto.
          </p>
        </div>
      )}

      <form action={uploadNote} className="card mt-8 space-y-5 rounded-2xl p-6">
        {sp.duplicate && (
          <>
            <input type="hidden" name="force" value="1" />
            <input type="hidden" name="title" value={sp.title ?? ""} />
            <input type="hidden" name="course" value={sp.course ?? ""} />
            <input type="hidden" name="university" value={sp.university ?? defaultUni} />
          </>
        )}
        {!sp.duplicate && (
          <>
        <Field label="Titolo *" name="title" required defaultValue={sp.title} />
        <Field label="Corso *" name="course" required defaultValue={sp.course} />
          </>
        )}
        {!sp.duplicate && (
        <div>
          <label htmlFor="university" className="block text-sm font-medium text-muted">
            Università *
          </label>
          <select
            id="university"
            name="university"
            required
            defaultValue={defaultUni}
            className="input-field mt-1 w-full px-4 py-3"
          >
            <option value="">Seleziona…</option>
            {ALL_UNIVERSITIES.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
        )}
        {!sp.duplicate && <Field label="Facoltà / SSD" name="faculty" />}
        {!sp.duplicate && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="academic_year" className="block text-sm font-medium text-muted">
              Anno accademico
            </label>
            <select
              id="academic_year"
              name="academic_year"
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
        )}
        <TagField popularTags={popularTags} />
        {!sp.duplicate && (
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-muted">
            Descrizione
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="input-field mt-1 w-full px-4 py-3"
            placeholder="Argomenti trattati, anno accademico…"
          />
        </div>
        )}
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-muted">
            File PDF *
          </label>
          <input
            id="file"
            name="file"
            type="file"
            accept="application/pdf"
            required={!sp.duplicate}
            className="mt-1 w-full text-sm text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-sage file:px-4 file:py-2 file:text-sm file:font-medium file:text-surface"
          />
        </div>
        <button type="submit" className="btn-primary w-full py-3">
          {sp.duplicate ? "Pubblica comunque" : "Pubblica appunto"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/profilo" className="font-medium text-sage hover:underline">
          Vai al tuo profilo
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  name,
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
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
