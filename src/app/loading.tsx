export default function RootLoading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-4 py-16">
      <div className="mx-auto h-10 max-w-md rounded-xl bg-mint-light/40" />
      <div className="mx-auto mt-4 h-4 max-w-sm rounded bg-gray-light/80" />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card h-36 rounded-2xl bg-mint-light/25" aria-hidden />
        ))}
      </div>
    </div>
  );
}
