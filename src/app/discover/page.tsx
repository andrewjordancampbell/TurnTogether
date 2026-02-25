import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { JoinClubButton } from '@/components/join-club-button'

const PAGE_SIZE = 20

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const offset = (page - 1) * PAGE_SIZE

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: clubs, count } = await supabase
    .from('clubs')
    .select('*, current_book:books(*), club_members(count)', { count: 'exact' })
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  let memberClubIds: number[] = []
  if (user) {
    const { data: memberships } = await supabase
      .from('club_members')
      .select('club_id')
      .eq('user_id', user.id)
    memberClubIds = memberships?.map((m: { club_id: number }) => m.club_id) ?? []
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Discover Book Clubs</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        {clubs?.map((club: { id: number; name: string; description: string | null; current_book: { title: string } | null; club_members: { count: number }[] }) => (
          <div key={club.id} className="rounded-lg border p-4">
            <Link href={`/clubs/${club.id}`} className="hover:underline">
              <h2 className="font-semibold">{club.name}</h2>
            </Link>
            {club.description && (
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">{club.description}</p>
            )}
            {club.current_book && (
              <p className="mt-2 text-xs text-gray-400">
                Reading: {club.current_book.title}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-400">
              {club.club_members?.[0]?.count ?? 0} members
            </p>
            <div className="mt-3">
              {memberClubIds.includes(club.id) ? (
                <Link href={`/clubs/${club.id}`}
                  className="rounded border px-3 py-1 text-sm hover:bg-gray-50">
                  View Club
                </Link>
              ) : user ? (
                <JoinClubButton clubId={club.id} />
              ) : (
                <Link href="/login" className="text-sm underline">
                  Log in to join
                </Link>
              )}
            </div>
          </div>
        ))}
        {(!clubs || clubs.length === 0) && (
          <p className="col-span-2 text-center text-gray-400">
            No public clubs yet. <Link href="/clubs/new" className="underline">Start one!</Link>
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link href={`/discover?page=${page - 1}`}
              className="rounded border px-3 py-1 text-sm hover:bg-gray-50">
              Previous
            </Link>
          )}
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`/discover?page=${page + 1}`}
              className="rounded border px-3 py-1 text-sm hover:bg-gray-50">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
