import Link from "next/link";
import { Suspense } from "react";
import { SearchBar } from "@/components/SearchBar";
import { HomeRecentNotes } from "@/components/HomeRecentNotes";
import { POPULAR_UNIVERSITIES } from "@/lib/constants";

export const revalidate = 60;

export default function HomePage() {
  return (
    <div>
      <section className="border-b border-gray-light bg-gradient-to-b from-mint-light/50 to-surface shadow-[var(--shadow-soft)]">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-20">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Trova appunti
            <span className="block text-sage">dalla tua università</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-muted">
            Carica PDF, cerca per corso e università, scarica e metti cuore agli
            appunti condivisi dagli studenti.
          </p>
          <div className="mx-auto mt-10 max-w-xl text-left">
            <SearchBar large />
          </div>
          <Link
            href="/cerca"
            className="mt-6 inline-block text-sm font-medium text-sage transition hover:text-sage-dark hover:underline"
          >
            Oppure esplora tutti gli appunti →
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="text-lg font-semibold text-foreground">
          Università popolari
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {POPULAR_UNIVERSITIES.map((uni) => (
            <Link
              key={uni}
              href={`/cerca?universita=${encodeURIComponent(uni)}`}
              className="chip px-4 py-2 text-sm text-foreground"
            >
              {uni}
            </Link>
          ))}
        </div>
      </section>

      <Suspense
        fallback={
          <section className="mx-auto max-w-5xl px-4 pb-16">
            <h2 className="text-lg font-semibold text-foreground">Appunti recenti</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="card h-40 animate-pulse rounded-2xl bg-mint-light/30"
                  aria-hidden
                />
              ))}
            </div>
          </section>
        }
      >
        <HomeRecentNotes />
      </Suspense>
    </div>
  );
}
