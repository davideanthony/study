"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ALL_UNIVERSITIES } from "@/lib/constants";

type SearchBarProps = {
  defaultQuery?: string;
  defaultUniversity?: string;
  defaultCourse?: string;
  large?: boolean;
};

export function SearchBar({
  defaultQuery = "",
  defaultUniversity = "",
  defaultCourse = "",
  large = false,
}: SearchBarProps) {
  const router = useRouter();
  const [q, setQ] = useState(defaultQuery);
  const [university, setUniversity] = useState(defaultUniversity);
  const [course, setCourse] = useState(defaultCourse);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (university.trim()) params.set("universita", university.trim());
    if (course.trim()) params.set("corso", course.trim());
    router.push(`/cerca?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      <div className={`flex gap-2 ${large ? "flex-col sm:flex-row" : "flex-col"}`}>
        <input
          type="search"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cerca per titolo o descrizione…"
          className={`input-field flex-1 px-4 ${
            large ? "py-3.5 text-base shadow-[var(--shadow-soft)]" : "py-2.5 text-sm"
          }`}
        />
        <button
          type="submit"
          className={`btn-primary shrink-0 px-5 ${
            large ? "py-3.5 text-base" : "py-2.5 text-sm"
          }`}
        >
          Cerca
        </button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          type="text"
          value={university}
          onChange={(e) => setUniversity(e.target.value)}
          placeholder="Università"
          list="universities-search"
          className="input-field px-3 py-2 text-sm shadow-[var(--shadow-soft)]"
        />
        <datalist id="universities-search">
          {ALL_UNIVERSITIES.map((u) => (
            <option key={u} value={u} />
          ))}
        </datalist>
        <input
          type="text"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          placeholder="Corso"
          className="input-field px-3 py-2 text-sm shadow-[var(--shadow-soft)]"
        />
      </div>
    </form>
  );
}
