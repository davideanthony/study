"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ACADEMIC_YEARS, SEMESTERS } from "@/lib/constants";
import { buildCercaUrl, type NoteSort } from "@/lib/search-params";
import { UniversitySelect } from "@/components/UniversitySelect";

type SearchBarProps = {
  defaultQuery?: string;
  defaultUniversity?: string;
  defaultCourse?: string;
  defaultYear?: string;
  defaultSemester?: string;
  defaultFaculty?: string;
  defaultTag?: string;
  defaultSort?: NoteSort;
  large?: boolean;
};

export function SearchBar({
  defaultQuery = "",
  defaultUniversity = "",
  defaultCourse = "",
  defaultYear = "",
  defaultSemester = "",
  defaultFaculty = "",
  defaultTag = "",
  defaultSort = "recent",
  large = false,
}: SearchBarProps) {
  const router = useRouter();
  const [q, setQ] = useState(defaultQuery);
  const [university, setUniversity] = useState(defaultUniversity);
  const [course, setCourse] = useState(defaultCourse);
  const [anno, setAnno] = useState(defaultYear);
  const [semestre, setSemestre] = useState(defaultSemester);
  const [facolta, setFacolta] = useState(defaultFaculty);
  const [tagFilter, setTagFilter] = useState(defaultTag);
  const [sort, setSort] = useState<NoteSort>(defaultSort);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    router.push(
      buildCercaUrl({
        q,
        universita: university,
        corso: course,
        anno,
        semestre,
        facolta,
        tag: tagFilter,
        sort,
        page: "1",
      }),
    );
  }

  const inputPad = large ? "py-3.5 text-base" : "py-2.5 text-sm";

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      <div className={`flex gap-2 ${large ? "flex-col sm:flex-row" : "flex-col"}`}>
        <input
          type="search"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cerca titolo, tag, descrizione o testo nel PDF…"
          className={`input-field flex-1 px-4 ${inputPad} shadow-[var(--shadow-soft)]`}
        />
        <button
          type="submit"
          className={`btn-primary shrink-0 px-5 ${large ? "py-3.5 text-base" : "py-2.5 text-sm"}`}
        >
          Cerca
        </button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <UniversitySelect value={university} onChange={setUniversity} />
        <input
          type="text"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          placeholder="Corso"
          className="input-field px-3 py-2 text-sm shadow-[var(--shadow-soft)]"
        />
        <input
          type="text"
          value={facolta}
          onChange={(e) => setFacolta(e.target.value)}
          placeholder="Facoltà / SSD (opzionale)"
          className="input-field px-3 py-2 text-sm shadow-[var(--shadow-soft)]"
        />
        <input
          type="text"
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          placeholder="Tag (es. analisi-1)"
          className="input-field px-3 py-2 text-sm shadow-[var(--shadow-soft)]"
        />
        <select
          value={anno}
          onChange={(e) => setAnno(e.target.value)}
          className="input-field px-3 py-2 text-sm shadow-[var(--shadow-soft)]"
        >
          <option value="">Anno accademico</option>
          {ACADEMIC_YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select
          value={semestre}
          onChange={(e) => setSemestre(e.target.value)}
          className="input-field px-3 py-2 text-sm shadow-[var(--shadow-soft)]"
        >
          <option value="">Semestre</option>
          {SEMESTERS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as NoteSort)}
          className="input-field px-3 py-2 text-sm shadow-[var(--shadow-soft)]"
          aria-label="Ordina risultati"
        >
          <option value="recent">Più recenti</option>
          <option value="downloads">Più scaricati</option>
          <option value="likes">Più cuori</option>
        </select>
      </div>
    </form>
  );
}
