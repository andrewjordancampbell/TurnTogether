import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DiscoverPage() {
  const supabase = await createClient()

  const { data: clubs } = await supabase
    .from('clubs')
    .select('*, current_book:books(*), club_members(count)')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Discover Book Clubs</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        {clubs?.map((club: { id: number; name: string; description: string | null; current_book: { title: string } | null; club_members: { count: number }[] }) => (
          <Link key={club.id} href={`/clubs/${club.id}`}
            className="rounded-lg border p-4 hover:bg-gray-50">
            <h2 className="font-semibold">{club.name}</h2>
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
          </Link>
        ))}
        {(!clubs || clubs.length === 0) && (
          <p className="col-span-2 text-center text-gray-400">
            No public clubs yet. <Link href="/clubs/new" className="underline">Start one!</Link>
          </p>
        )}
      </div>
    </div>
  )
}
