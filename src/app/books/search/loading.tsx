export default function BookSearchLoading() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 h-8 w-40 animate-pulse rounded bg-gray-200" />
      <div className="flex gap-2">
        <div className="h-10 flex-1 animate-pulse rounded bg-gray-100" />
        <div className="h-10 w-24 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  )
}
