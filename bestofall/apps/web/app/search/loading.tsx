export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-8">
      <div className="skeleton mx-auto mb-6 h-14 max-w-2xl rounded-full" />
      <div className="mb-6 flex justify-center gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton aspect-[3/4] rounded-xl3" />
        ))}
      </div>
    </div>
  );
}
