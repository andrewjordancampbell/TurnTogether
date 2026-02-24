import { createClub } from './actions'

export default function NewClubPage() {
  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="mb-6 text-2xl font-bold">Start a Book Club</h1>

      <form action={createClub} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">Club Name</label>
          <input id="name" name="name" type="text" required
            className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium">Description</label>
          <textarea id="description" name="description" rows={3}
            className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div className="flex items-center gap-2">
          <input id="is_public" name="is_public" type="checkbox" value="true" />
          <label htmlFor="is_public" className="text-sm">Make this club public (anyone can join)</label>
        </div>
        <button type="submit"
          className="w-full rounded-md bg-black py-2 text-white hover:bg-gray-800">
          Create Club
        </button>
      </form>
    </div>
  )
}
