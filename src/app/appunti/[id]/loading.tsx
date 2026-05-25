export default function AppuntoLoading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse px-4 py-10">
      <div className="flex gap-2">
        <div className="h-7 w-24 rounded-full bg-mint-light/40" />
        <div className="h-7 w-20 rounded-full bg-mint-light/30" />
      </div>
      <div className="mt-6 h-10 max-w-lg rounded-lg bg-mint-light/40" />
      <div className="mt-4 h-4 w-full max-w-2xl rounded bg-gray-light/70" />
      <div className="mt-8 h-12 w-64 rounded-xl bg-mint-light/35" />
      <div className="mt-8 card h-[min(50vh,400px)] rounded-2xl bg-mint-light/20" />
    </div>
  );
}
