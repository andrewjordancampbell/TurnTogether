import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function ClubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: club } = await supabase
    .from('clubs')
    .select(`
      *,
      current_book:books(*),
      club_members(*, profile:profiles(*))
    `)
    .eq('id', id)
    .single()

  if (!club) notFound()

  const { data: progress } = await supabase
    .from('reading_progress')
    .select('*, profile:profiles(*)')
    .eq('club_id', id)

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{club.name}</h1>
        {club.description && (
          <p className="mt-2 text-gray-600">{club.description}</p>
        )}
        <span className="mt-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs">
          {club.is_public ? 'Public' : 'Private'} &middot; {club.club_members?.length ?? 0} members
        </span>
        <div className="mt-3 flex gap-3">
          <Link href={`/clubs/${id}/discussions`}
            className="rounded bg-black px-3 py-1 text-sm text-white hover:bg-gray-800">
            Discussions
          </Link>
          <Link href={`/clubs/${id}/room`}
            className="rounded border px-3 py-1 text-sm hover:bg-gray-50">
            Reading Room
          </Link>
        </div>
      </div>

      {club.current_book && (
        <div className="mb-8 rounded-lg border p-4">
          <h2 className="mb-4 text-lg font-semibold">Currently Reading</h2>
          <div className="flex gap-4">
            {club.current_book.cover_url && (
              <img src={club.current_book.cover_url} alt={club.current_book.title}
                className="h-40 w-28 rounded object-cover" />
            )}
            <div>
              <h3 className="font-semibold">{club.current_book.title}</h3>
              <p className="text-sm text-gray-600">{club.current_book.author_name}</p>
            </div>
          </div>

          {progress && progress.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-medium">Group Progress</h3>
              {progress.map((p: { id: number; percent_complete: number; profile: { display_name: string } | null }) => (
                <div key={p.id} className="flex items-center gap-2">
                  <span className="w-24 truncate text-sm">{p.profile?.display_name}</span>
                  <div className="flex-1 rounded-full bg-gray-100">
                    <div className="rounded-full bg-black py-1 text-center text-xs text-white"
                      style={{ width: `${Math.max(p.percent_complete, 5)}%` }}>
                      {Math.round(p.percent_complete)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg border p-4">
        <h2 className="mb-4 text-lg font-semibold">Members</h2>
        <div className="space-y-2">
          {club.club_members?.map((member: { id: number; role: string; profile: { display_name: string } }) => (
            <div key={member.id} className="flex items-center justify-between">
              <span className="text-sm">{member.profile?.display_name}</span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{member.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
