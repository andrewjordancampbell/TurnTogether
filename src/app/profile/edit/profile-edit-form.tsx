'use client'

import { useActionState } from 'react'
import { updateProfile } from './actions'

export function ProfileEditForm({ displayName, bio }: { displayName: string; bio: string }) {
  const [state, formAction, pending] = useActionState(updateProfile, null)

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}
      <div>
        <label htmlFor="display_name" className="block text-sm font-medium">Display Name</label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          required
          defaultValue={displayName}
          className="mt-1 w-full rounded-md border px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="bio" className="block text-sm font-medium">Bio</label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          defaultValue={bio}
          className="mt-1 w-full rounded-md border px-3 py-2"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-black py-2 text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {pending ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  )
}
