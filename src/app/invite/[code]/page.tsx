import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { JoinClubButton } from '@/components/join-club-button'
import Link from 'next/link'

export default async function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: club } = await supabase
    .from('clubs')
    .select('*, club_members(count)')
    .eq('invite_code', code)
    .single()

  if (!club) notFound()

  let isMember = false
  if (user) {
    const { data: membership } = await supabase
      .from('club_members')
      .select('id')
      .eq('club_id', club.id)
      .eq('user_id', user.id)
      .single()
    isMember = !!membership
  }

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border p-6 text-center">
        <h1 className="text-xl font-bold">You&apos;re invited to join</h1>
        <h2 className="mt-2 text-2xl font-bold">{club.name}</h2>
        {club.description && (
          <p className="mt-2 text-sm text-gray-600">{club.description}</p>
        )}
        <p className="mt-2 text-xs text-gray-400">
          {club.club_members?.[0]?.count ?? 0} members
        </p>

        <div className="mt-6">
          {isMember ? (
            <Link href={`/clubs/${club.id}`}
              className="inline-block rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800">
              Go to Club
            </Link>
          ) : user ? (
            <JoinClubButton clubId={club.id} />
          ) : (
            <Link href={`/login?next=/invite/${code}`}
              className="inline-block rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800">
              Log in to join
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
