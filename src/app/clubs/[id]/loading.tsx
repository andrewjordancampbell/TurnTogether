export default function ClubLoading() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <div className="h-9 w-64 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-4 w-96 animate-pulse rounded bg-gray-100" />
        <div className="mt-2 h-6 w-32 animate-pulse rounded-full bg-gray-100" />
      </div>
      <div className="mb-8 rounded-lg border p-4">
        <div className="h-5 w-36 animate-pulse rounded bg-gray-200" />
        <div className="mt-4 flex gap-4">
          <div className="h-40 w-28 animate-pulse rounded bg-gray-200" />
          <div>
            <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-4 w-32 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      </div>
      <div className="rounded-lg border p-4">
        <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
        <div className="mt-4 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
              <div className="h-5 w-16 animate-pulse rounded-full bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
