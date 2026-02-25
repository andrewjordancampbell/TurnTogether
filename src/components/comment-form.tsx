'use client'

import { useActionState } from 'react'
import { addComment } from '@/app/clubs/[id]/discussions/actions'

export function CommentForm({ discussionId, clubId }: { discussionId: string; clubId: string }) {
  const [state, formAction, pending] = useActionState(addComment, null)

  return (
    <form action={formAction} className="rounded-lg border p-4">
      <input type="hidden" name="discussion_id" value={discussionId} />
      <input type="hidden" name="club_id" value={clubId} />
      {state?.error && (
        <p className="mb-2 text-sm text-red-600">{state.error}</p>
      )}
      <textarea name="content" placeholder="Add a comment..." rows={2} required
        className="mb-2 w-full rounded border px-3 py-2" />
      <button type="submit" disabled={pending}
        className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50">
        {pending ? 'Posting...' : 'Comment'}
      </button>
    </form>
  )
}
