import { ALL_UNIVERSITIES } from "@/lib/constants";

type UniversitySelectProps = {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
};

/** Select nativo: evita bug di contrasto del datalist su mobile/desktop. */
export function UniversitySelect({
  id = "university",
  name,
  value,
  onChange,
  required,
  placeholder = "Seleziona università…",
  className = "input-field w-full px-3 py-2 text-sm shadow-[var(--shadow-soft)]",
}: UniversitySelectProps) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      required={required}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    >
      <option value="">{placeholder}</option>
      {ALL_UNIVERSITIES.map((u) => (
        <option key={u} value={u}>
          {u}
        </option>
      ))}
    </select>
  );
}
