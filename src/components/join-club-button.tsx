'use client'

import { useActionState } from 'react'
import { joinClub } from '@/app/clubs/[id]/actions'

export function JoinClubButton({ clubId }: { clubId: number }) {
  const [state, formAction, pending] = useActionState(joinClub, null)

  if (state?.success) {
    return <span className="rounded bg-green-100 px-3 py-1 text-sm text-green-800">Joined!</span>
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="club_id" value={clubId} />
      {state?.error && (
        <p className="mb-1 text-xs text-red-600">{state.error}</p>
      )}
      <button type="submit" disabled={pending}
        className="rounded bg-coral px-3 py-1 text-sm text-white hover:bg-rose disabled:opacity-50">
        {pending ? 'Joining...' : 'Join Club'}
      </button>
    </form>
  )
}
