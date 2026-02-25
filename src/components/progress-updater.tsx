'use client'

import { useActionState } from 'react'
import { updateProgress } from '@/app/clubs/[id]/progress/actions'

interface ProgressUpdaterProps {
  clubId: number
  bookId: number
  currentChapter?: number
  currentPage?: number
  totalPages?: number | null
}

export function ProgressUpdater({ clubId, bookId, currentChapter, currentPage, totalPages }: ProgressUpdaterProps) {
  const [state, formAction, pending] = useActionState(updateProgress, null)

  return (
    <form action={formAction} className="rounded-lg border p-4">
      <h3 className="mb-3 text-sm font-semibold">Update Your Progress</h3>
      <input type="hidden" name="club_id" value={clubId} />
      <input type="hidden" name="book_id" value={bookId} />
      {totalPages != null && totalPages > 0 && <input type="hidden" name="total_pages" value={totalPages} />}

      {state?.error && (
        <p className="mb-2 text-sm text-red-600">{state.error}</p>
      )}
      {state?.success && (
        <p className="mb-2 text-sm text-green-600">Progress saved!</p>
      )}

      <div className="flex gap-3">
        <div>
          <label className="block text-xs text-gray-500">Chapter</label>
          <input type="number" name="current_chapter" min={0}
            defaultValue={currentChapter ?? 0}
            className="w-20 rounded border px-2 py-1 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Page</label>
          <input type="number" name="current_page" min={0}
            defaultValue={currentPage ?? ''}
            className="w-20 rounded border px-2 py-1 text-sm" />
        </div>
        <button type="submit" disabled={pending}
          className="self-end rounded bg-black px-3 py-1 text-sm text-white hover:bg-gray-800 disabled:opacity-50">
          {pending ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  )
}
