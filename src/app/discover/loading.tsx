export default function DiscoverLoading() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 h-8 w-52 animate-pulse rounded bg-gray-200" />
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-4 w-full animate-pulse rounded bg-gray-100" />
            <div className="mt-2 h-3 w-24 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  )
}
