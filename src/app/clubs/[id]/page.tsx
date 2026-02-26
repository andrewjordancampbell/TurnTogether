import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { JoinClubButton } from '@/components/join-club-button'
import { ProgressUpdater } from '@/components/progress-updater'
import { CopyInviteLink } from '@/components/copy-invite-link'

export default async function ClubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: club } = await supabase
    .from('clubs')
    .select(`
      *,
      current_book:books(*),
      club_members(*, profile:profiles(*))
    `)
    .eq('id', Number(id))
    .single()

  const progress = club?.current_book_id
    ? (await supabase
        .from('reading_progress')
        .select('*, profile:profiles(*)')
        .eq('club_id', Number(id))
        .eq('book_id', club.current_book_id)).data
    : null

  // Task 1: "Also Reading This" count
  let alsoReadingCount = 0
  if (club?.current_book_id) {
    const { count } = await supabase
      .from('clubs')
      .select('*', { count: 'exact', head: true })
      .eq('current_book_id', club.current_book_id)
      .neq('id', Number(id))
    alsoReadingCount = count ?? 0
  }

  if (!club) notFound()

  const isMember = club.club_members?.some(
    (m: { user_id: string }) => m.user_id === user?.id
  )
  const isAdmin = club.club_members?.some(
    (m: { user_id: string; role: string }) => m.user_id === user?.id && m.role === 'admin'
  )

  const userProgress = progress?.find(
    (p: { user_id: string }) => p.user_id === user?.id
  )

  // Task 2: Sort progress by percent_complete descending
  const sortedProgress = progress
    ? [...progress].sort((a: { percent_complete: number }, b: { percent_complete: number }) =>
        b.percent_complete - a.percent_complete
      )
    : null

  const book = club.current_book
  const memberCount = club.club_members?.length ?? 0

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Club Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{club.name}</h1>
        {club.description && (
          <p className="mt-2 text-peach/80">{club.description}</p>
        )}
        <span className="mt-2 inline-block rounded-full bg-purple/20 px-3 py-1 text-xs text-peach">
          {club.is_public ? 'Public' : 'Private'} &middot; {memberCount} {memberCount === 1 ? 'member' : 'members'}
        </span>

        {/* Navigation buttons */}
        <div className="mt-3 flex flex-wrap gap-3">
          {isMember ? (
            <>
              <Link href={`/clubs/${id}/discussions`}
                className="rounded bg-coral px-3 py-1 text-sm text-white hover:bg-rose">
                Discussions
              </Link>
              <Link href={`/clubs/${id}/room`}
                className="rounded border border-purple/40 px-3 py-1 text-sm text-peach hover:bg-purple/20">
                Reading Room
              </Link>
              <Link href={`/clubs/${id}/chapters`}
                className="rounded border border-purple/40 px-3 py-1 text-sm text-peach hover:bg-purple/20">
                Chapters
              </Link>
              {isAdmin && (
                <Link href={`/clubs/${id}/set-book`}
                  className="rounded border border-purple/40 px-3 py-1 text-sm text-peach hover:bg-purple/20">
                  Set Current Book
                </Link>
              )}
              {isAdmin && (
                <Link href={`/clubs/${id}/settings`}
                  className="rounded border border-purple/40 px-3 py-1 text-sm text-peach hover:bg-purple/20">
                  Settings
                </Link>
              )}
            </>
          ) : user ? (
            <JoinClubButton clubId={club.id} />
          ) : (
            <Link href="/login" className="rounded bg-coral px-3 py-1 text-sm text-white hover:bg-rose">
              Log in to join
            </Link>
          )}
        </div>
      </div>

      {/* Currently Reading Section */}
      {book && (
        <div className="mb-8 rounded-xl border border-purple/30 bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold text-navy">Currently Reading</h2>
          <div className="flex gap-4">
            {book.cover_url && (
              <img src={book.cover_url} alt={book.title}
                className="h-44 w-30 rounded-lg object-cover shadow-md" />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-navy">{book.title}</h3>
              <p className="text-sm text-purple">{book.author_name}</p>

              {/* Task 1: Book metadata */}
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-purple/70">
                {book.page_count && book.page_count > 0 && (
                  <span>{book.page_count} pages</span>
                )}
                {book.first_publish_year && (
                  <span>Published {book.first_publish_year}</span>
                )}
              </div>

              {/* Task 1: Also Reading This */}
              <div className="mt-2">
                {alsoReadingCount > 0 ? (
                  <span className="inline-block rounded-full bg-rose/10 px-3 py-1 text-xs text-rose">
                    {alsoReadingCount} other {alsoReadingCount === 1 ? 'club is' : 'clubs are'} also reading this
                  </span>
                ) : (
                  <span className="inline-block rounded-full bg-purple/10 px-3 py-1 text-xs text-purple">
                    Only your club is reading this
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Group Progress */}
          {sortedProgress && sortedProgress.length > 0 && (
            <div className="mt-5 space-y-3">
              <h3 className="text-sm font-semibold text-navy">Group Progress</h3>
              {sortedProgress.map((p: {
                id: number
                percent_complete: number
                current_page: number | null
                current_chapter: number
                profile: { display_name: string } | null
              }) => (
                <div key={p.id} className="flex items-center gap-3">
                  {/* Task 2: Avatar circle */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple text-xs font-bold text-white">
                    {p.profile?.display_name?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                  <span className="w-24 truncate text-sm text-navy">{p.profile?.display_name}</span>
                  <div className="flex-1">
                    <div className="rounded-full bg-navy/10">
                      <div className="rounded-full bg-peach py-1 text-center text-xs font-medium text-navy"
                        style={{ width: `${Math.max(p.percent_complete, 8)}%` }}>
                        {Math.round(p.percent_complete)}%
                      </div>
                    </div>
                    {/* Task 2: Page X of Y */}
                    <div className="mt-0.5 text-xs text-purple/60">
                      {p.current_page && book.page_count
                        ? `Page ${p.current_page} of ${book.page_count}`
                        : p.current_page
                          ? `Page ${p.current_page}`
                          : p.current_chapter > 0
                            ? `Chapter ${p.current_chapter}`
                            : 'Not started'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Task 2: Low-member invite nudge */}
          {isMember && memberCount <= 1 && (
            <div className="mt-4 rounded-lg bg-peach/10 p-3 text-center">
              <p className="text-sm text-navy">Invite friends to see everyone&apos;s progress!</p>
              {club.invite_code && (
                <CopyInviteLink clubId={club.id} inviteCode={club.invite_code} />
              )}
            </div>
          )}

          {/* Progress Updater */}
          {isMember && (
            <div className="mt-4">
              <ProgressUpdater
                clubId={club.id}
                bookId={book.id}
                currentChapter={userProgress?.current_chapter}
                currentPage={userProgress?.current_page ?? undefined}
                totalPages={book.page_count ?? undefined}
              />
            </div>
          )}
        </div>
      )}

      {/* Members Section */}
      <div className="rounded-xl border border-purple/30 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold text-navy">Members</h2>
        <div className="space-y-3">
          {club.club_members?.map((member: {
            id: number
            user_id: string
            role: string
            profile: { display_name: string; avatar_url: string | null } | null
          }) => (
            <div key={member.id} className="flex items-center gap-3">
              {/* Avatar circle */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                {member.profile?.display_name?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1">
                {/* Task 4: Member name as profile link */}
                <Link
                  href={`/profile/${member.user_id}`}
                  className="text-sm font-medium text-purple hover:text-rose hover:underline"
                >
                  {member.profile?.display_name}
                </Link>
              </div>
              {/* Task 4: Admin badge */}
              {member.role === 'admin' ? (
                <span className="rounded-full bg-coral px-2.5 py-0.5 text-xs font-semibold text-white">
                  Admin
                </span>
              ) : (
                <span className="rounded-full bg-purple/10 px-2.5 py-0.5 text-xs text-purple">
                  Member
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
