import Link from "next/link";
import { signIn } from "../actions";

type PageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export const metadata = { title: "Accedi" };

export default async function LoginPage({ searchParams }: PageProps) {
  const { error, next } = await searchParams;

  return (
    <AuthLayout
      title="Accedi"
      subtitle="Bentornato su Stufy"
      error={error}
      alternate={{
        text: "Non hai un account?",
        href: "/auth/signup",
        link: "Registrati",
      }}
    >
      <form action={signIn} className="space-y-4">
        {next && <input type="hidden" name="next" value={next} />}
        <AuthField label="Email" name="email" type="email" required />
        <AuthField label="Password" name="password" type="password" required />
        <button type="submit" className="btn-primary w-full py-3">
          Accedi
        </button>
      </form>
    </AuthLayout>
  );
}

function AuthLayout({
  title,
  subtitle,
  error,
  alternate,
  children,
}: {
  title: string;
  subtitle: string;
  error?: string;
  alternate: { text: string; href: string; link: string };
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="mt-1 text-muted">{subtitle}</p>
      {error && (
        <p className="mt-4 rounded-xl border border-sage/20 bg-mint-light/60 px-4 py-3 text-sm text-sage-dark shadow-[var(--shadow-soft)]">
          {decodeURIComponent(error)}
        </p>
      )}
      <div className="card mt-8 rounded-2xl p-6">{children}</div>
      <p className="mt-6 text-center text-sm text-muted">
        {alternate.text}{" "}
        <Link href={alternate.href} className="font-medium text-sage hover:underline">
          {alternate.link}
        </Link>
      </p>
    </div>
  );
}

function AuthField({
  label,
  name,
  type,
  required,
}: {
  label: string;
  name: string;
  type: string;
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
        type={type}
        required={required}
        className="input-field mt-1 w-full px-4 py-3 shadow-[var(--shadow-soft)]"
      />
    </div>
  );
}
