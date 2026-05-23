import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { uploadNote } from "./actions";
import { ALL_UNIVERSITIES } from "@/lib/constants";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export const metadata = { title: "Carica appunti" };

export default async function CaricaPage({ searchParams }: PageProps) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/carica");
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground">Carica appunti</h1>
      <p className="mt-2 text-muted">
        Condividi un PDF con titolo, corso e università.
      </p>

      {error && (
        <p className="mt-4 rounded-xl border border-sage/20 bg-mint-light/60 px-4 py-3 text-sm text-sage-dark shadow-[var(--shadow-soft)]">
          {error}
        </p>
      )}

      <form action={uploadNote} className="card mt-8 space-y-5 rounded-2xl p-6">
        <Field label="Titolo *" name="title" required />
        <Field label="Corso *" name="course" required placeholder="es. Analisi I" />
        <div>
          <label htmlFor="university" className="block text-sm font-medium text-muted">
            Università *
          </label>
          <input
            id="university"
            name="university"
            required
            list="universities"
            className="input-field mt-1 w-full px-4 py-3 shadow-[var(--shadow-soft)]"
            placeholder="es. Sapienza — Roma"
          />
          <datalist id="universities">
            {ALL_UNIVERSITIES.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-muted">
            Descrizione
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="input-field mt-1 w-full px-4 py-3 shadow-[var(--shadow-soft)]"
            placeholder="Argomenti trattati, anno accademico…"
          />
        </div>
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-muted">
            File PDF *
          </label>
          <input
            id="file"
            name="file"
            type="file"
            accept="application/pdf"
            required
            className="mt-1 w-full text-sm text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-sage file:px-4 file:py-2 file:text-sm file:font-medium file:text-surface file:shadow-[var(--shadow-soft)]"
          />
        </div>
        <button type="submit" className="btn-primary w-full py-3">
          Pubblica appunto
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
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
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
        placeholder={placeholder}
        className="input-field mt-1 w-full px-4 py-3 shadow-[var(--shadow-soft)]"
      />
    </div>
  );
}
