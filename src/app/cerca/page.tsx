import { Suspense } from "react";
import { SearchBar } from "@/components/SearchBar";
import { CercaResults } from "@/components/CercaResults";
import { parseSort } from "@/lib/search-params";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    universita?: string;
    corso?: string;
    anno?: string;
    semestre?: string;
    facolta?: string;
    tag?: string;
    sort?: string;
    page?: string;
  }>;
};

export const metadata = { title: "Cerca appunti" };

export default async function CercaPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground">Cerca appunti</h1>
      <p className="mt-1 text-sm text-muted">
        La ricerca include titolo, descrizione, tag e testo estratto dai PDF.
      </p>
      <div className="mt-6">
        <SearchBar
          defaultQuery={sp.q ?? ""}
          defaultUniversity={sp.universita ?? ""}
          defaultCourse={sp.corso ?? ""}
          defaultYear={sp.anno ?? ""}
          defaultSemester={sp.semestre ?? ""}
          defaultFaculty={sp.facolta ?? ""}
          defaultTag={sp.tag ?? ""}
          defaultSort={parseSort(sp.sort)}
        />
      </div>

      <Suspense
        key={JSON.stringify(sp)}
        fallback={
          <div className="mt-8 space-y-4">
            <div className="h-4 w-48 animate-pulse rounded bg-mint-light/40" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="card h-40 animate-pulse rounded-2xl bg-mint-light/30"
                  aria-hidden
                />
              ))}
            </div>
          </div>
        }
      >
        <CercaResults searchParams={sp} />
      </Suspense>
    </div>
  );
}
