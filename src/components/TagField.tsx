"use client";

import { useMemo, useState } from "react";
import { parseTagInput } from "@/lib/tags";

type TagFieldProps = {
  name?: string;
  defaultValue?: string;
  popularTags: string[];
  required?: boolean;
};

export function TagField({
  name = "tags",
  defaultValue = "",
  popularTags,
  required = true,
}: TagFieldProps) {
  const [value, setValue] = useState(defaultValue);

  const currentTags = useMemo(() => new Set(parseTagInput(value)), [value]);

  function addTag(tag: string) {
    const normalized = tag.trim().toLowerCase().replace(/\s+/g, "-");
    if (!normalized || currentTags.has(normalized)) return;
    const next = value.trim()
      ? `${value.trim().replace(/,\s*$/, "")}, ${normalized}`
      : normalized;
    setValue(next);
  }

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-muted">
        Tag {required && <span className="text-sage">*</span>}
      </label>
      <input
        id={name}
        name={name}
        required={required}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="input-field mt-1 w-full px-4 py-3"
        placeholder="es. analisi-1, esame (minimo 1, max 8)"
        autoComplete="off"
      />
      <p className="mt-1 text-xs text-muted">
        Obbligatorio almeno 1 tag. Clicca un suggerimento o scrivi separati da virgola.
        I tag entrano anche nella ricerca full-text.
      </p>
      {popularTags.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-muted">Popolari</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {popularTags.map((tag) => {
              const active = currentTags.has(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                    active
                      ? "bg-sage text-surface"
                      : "bg-mint-light/70 text-sage-dark hover:bg-mint-light"
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
