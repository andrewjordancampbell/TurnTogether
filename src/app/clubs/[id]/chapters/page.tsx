import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChapterForm } from './chapter-form'
import { DeleteChapterButton } from './delete-chapter-button'

export default async function ChaptersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: club }, { data: chapters }, { data: membership }] = await Promise.all([
    supabase
      .from('clubs')
      .select('*, current_book:books(*)')
      .eq('id', Number(id))
      .single(),
    supabase
      .from('chapters')
      .select('*')
      .eq('club_id', Number(id))
      .order('chapter_number', { ascending: true }),
    supabase
      .from('club_members')
      .select('role')
      .eq('club_id', Number(id))
      .eq('user_id', user.id)
      .single(),
  ])

  if (!club) notFound()

  const isAdmin = membership?.role === 'admin'

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Chapters</h1>
        <Link href={`/clubs/${id}`} className="text-sm text-gray-500 hover:underline">Back to club</Link>
      </div>

      {!club.current_book && (
        <p className="mb-4 text-sm text-gray-500">Set a book for the club first to manage chapters.</p>
      )}

      {isAdmin && club.current_book && (
        <ChapterForm clubId={Number(id)} bookId={club.current_book.id} />
      )}

      <div className="space-y-2">
        {chapters?.map((ch: { id: number; title: string; chapter_number: number; start_page: number | null; end_page: number | null }) => (
          <div key={ch.id} className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <span className="text-sm font-medium">Ch. {ch.chapter_number}: {ch.title}</span>
              {(ch.start_page || ch.end_page) && (
                <span className="ml-2 text-xs text-gray-400">
                  pp. {ch.start_page ?? '?'}-{ch.end_page ?? '?'}
                </span>
              )}
            </div>
            {isAdmin && (
              <DeleteChapterButton chapterId={ch.id} clubId={id} />
            )}
          </div>
        ))}
        {(!chapters || chapters.length === 0) && (
          <p className="text-center text-gray-400">No chapters defined yet.</p>
        )}
      </div>
    </div>
  )
}
