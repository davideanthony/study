import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <p className="text-6xl font-bold text-sage/40">404</p>
      <h1 className="mt-4 text-2xl font-bold text-foreground">Pagina non trovata</h1>
      <p className="mt-3 text-sm text-muted">
        Il link potrebbe essere errato o il contenuto non esiste più.
      </p>
      <Link href="/" className="btn-primary mt-8 inline-block px-6 py-2.5 text-sm">
        Torna alla home
      </Link>
    </div>
  );
}
