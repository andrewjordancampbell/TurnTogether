'use client'

import { updateProgress } from '@/app/clubs/[id]/progress/actions'

interface ProgressUpdaterProps {
  clubId: number
  bookId: number
  currentChapter?: number
  currentPage?: number
  totalPages?: number
}

export function ProgressUpdater({ clubId, bookId, currentChapter, currentPage, totalPages }: ProgressUpdaterProps) {
  return (
    <form action={updateProgress} className="rounded-lg border p-4">
      <h3 className="mb-3 text-sm font-semibold">Update Your Progress</h3>
      <input type="hidden" name="club_id" value={clubId} />
      <input type="hidden" name="book_id" value={bookId} />
      {totalPages && <input type="hidden" name="total_pages" value={totalPages} />}

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
        <button type="submit"
          className="self-end rounded bg-black px-3 py-1 text-sm text-white hover:bg-gray-800">
          Save
        </button>
      </div>
    </form>
  )
}
