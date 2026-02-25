'use client'

import { useActionState } from 'react'
import { createDiscussion } from '@/app/clubs/[id]/discussions/actions'

export function DiscussionForm({ clubId, bookId }: { clubId: string; bookId?: number | null }) {
  const [state, formAction, pending] = useActionState(createDiscussion, null)

  return (
    <form action={formAction} className="mb-8 rounded-lg border p-4">
      <h2 className="mb-3 font-semibold">Start a Discussion</h2>
      <input type="hidden" name="club_id" value={clubId} />
      {bookId && <input type="hidden" name="book_id" value={bookId} />}
      {state?.error && (
        <p className="mb-2 text-sm text-red-600">{state.error}</p>
      )}
      <input name="title" placeholder="Discussion title" required
        className="mb-2 w-full rounded border px-3 py-2" />
      <textarea name="content" placeholder="What's on your mind?" rows={3}
        className="mb-2 w-full rounded border px-3 py-2" />
      <button type="submit" disabled={pending}
        className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50">
        {pending ? 'Posting...' : 'Post'}
      </button>
    </form>
  )
}
