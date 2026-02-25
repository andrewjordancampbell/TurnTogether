'use client'

import { useActionState } from 'react'
import { addChapter } from './actions'

export function ChapterForm({ clubId, bookId }: { clubId: number; bookId: number }) {
  const [state, formAction, pending] = useActionState(addChapter, null)

  return (
    <form action={formAction} className="mb-6 rounded-lg border p-4">
      <h2 className="mb-3 font-semibold">Add Chapter</h2>
      <input type="hidden" name="club_id" value={clubId} />
      <input type="hidden" name="book_id" value={bookId} />

      {state?.error && (
        <p className="mb-2 text-sm text-red-600">{state.error}</p>
      )}
      {state?.success && (
        <p className="mb-2 text-sm text-green-600">Chapter added!</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs text-gray-500">Chapter Number</label>
          <input type="number" name="chapter_number" min={1} required
            className="w-full rounded border px-2 py-1 text-sm" />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs text-gray-500">Title</label>
          <input type="text" name="title" required
            className="w-full rounded border px-2 py-1 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Start Page</label>
          <input type="number" name="start_page" min={0}
            className="w-full rounded border px-2 py-1 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-500">End Page</label>
          <input type="number" name="end_page" min={0}
            className="w-full rounded border px-2 py-1 text-sm" />
        </div>
      </div>

      <button type="submit" disabled={pending}
        className="mt-3 rounded bg-black px-4 py-1 text-sm text-white hover:bg-gray-800 disabled:opacity-50">
        {pending ? 'Adding...' : 'Add Chapter'}
      </button>
    </form>
  )
}
