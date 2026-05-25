export default function CercaLoading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-4 py-10">
      <div className="h-8 w-48 rounded-lg bg-mint-light/40" />
      <div className="mt-6 h-24 rounded-2xl bg-mint-light/25" />
      <div className="mt-8 h-4 w-32 rounded bg-gray-light/80" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card h-40 rounded-2xl bg-mint-light/30" aria-hidden />
        ))}
      </div>
    </div>
  );
}
