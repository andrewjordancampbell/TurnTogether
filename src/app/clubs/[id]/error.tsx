'use client'

import Link from 'next/link'

export default function ClubError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6">
      <h2 className="mb-2 text-xl font-bold">Club Error</h2>
      <p className="mb-4 text-sm text-gray-600">
        {error.message || 'Something went wrong loading this club.'}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
