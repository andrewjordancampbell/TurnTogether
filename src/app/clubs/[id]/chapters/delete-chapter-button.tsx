'use client'

import { useActionState } from 'react'
import { deleteChapter } from './actions'

export function DeleteChapterButton({ chapterId, clubId }: { chapterId: number; clubId: string }) {
  const [state, formAction, pending] = useActionState(deleteChapter, null)

  return (
    <form action={formAction}>
      <input type="hidden" name="chapter_id" value={chapterId} />
      <input type="hidden" name="club_id" value={clubId} />
      {state?.error && (
        <span className="mr-2 text-xs text-red-500">{state.error}</span>
      )}
      <button type="submit" disabled={pending}
        className="text-xs text-red-500 hover:underline disabled:opacity-50">
        {pending ? 'Deleting...' : 'Delete'}
      </button>
    </form>
  )
}
