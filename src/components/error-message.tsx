export function ErrorMessage({ error }: { error?: string | null }) {
  if (!error) return null

  return (
    <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
      {error}
    </div>
  )
}
