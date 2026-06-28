export function SkeletonBlock() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          className="h-8 animate-pulse rounded-md bg-muted"
          key={`skeleton-${index}`}
        />
      ))}
    </div>
  );
}
