export default function Loading() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-28 animate-pulse rounded-3xl bg-white" />
      ))}
      <div className="h-72 animate-pulse rounded-3xl bg-white md:col-span-4" />
    </div>
  );
}
