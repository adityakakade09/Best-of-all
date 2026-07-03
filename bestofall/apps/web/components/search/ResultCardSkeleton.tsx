export function ResultCardSkeleton() {
  return (
    <div className="glass-panel flex flex-col overflow-hidden rounded-xl3">
      <div className="skeleton aspect-square w-full" />
      <div className="flex flex-col gap-3 p-4">
        <div className="skeleton h-4 w-4/5 rounded-md" />
        <div className="skeleton h-4 w-2/5 rounded-md" />
        <div className="skeleton h-3 w-3/5 rounded-md" />
        <div className="skeleton mt-2 h-10 w-full rounded-full" />
      </div>
    </div>
  );
}
