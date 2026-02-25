import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Database } from '@/lib/supabase/database.types'

type ClubRow = Database['public']['Tables']['clubs']['Row']
type BookRow = Database['public']['Tables']['books']['Row']

interface ClubWithBook extends ClubRow {
  current_book: BookRow | null
  club_members: { count: number }[]
}

interface MembershipWithClub {
  club: ClubWithBook | null
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get user's clubs with current books and progress
  const { data: memberships } = await supabase
    .from('club_members')
    .select(`
      club:clubs(
        *,
        current_book:books(*),
        club_members(count)
      )
    `)
    .eq('user_id', user.id)

  const clubs = (memberships as unknown as MembershipWithClub[] | null)
    ?.map((m) => m.club)
    .filter(Boolean) as ClubWithBook[] ?? []

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Book Clubs</h1>
        <Link href="/clubs/new"
          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800">
          Start a Club
        </Link>
      </div>

      {clubs.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-gray-500">You haven&apos;t joined any book clubs yet.</p>
          <div className="mt-4 flex justify-center gap-4">
            <Link href="/clubs/new" className="text-sm underline">Start a club</Link>
            <Link href="/discover" className="text-sm underline">Discover clubs</Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {clubs.map((club) => (
            <Link key={club.id} href={`/clubs/${club.id}`}
              className="block rounded-lg border p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold">{club.name}</h2>
                  {club.current_book && (
                    <p className="text-sm text-gray-600">
                      Reading: {club.current_book.title}
                    </p>
                  )}
                </div>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                  {club.is_public ? 'Public' : 'Private'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
