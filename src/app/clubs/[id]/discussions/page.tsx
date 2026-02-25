import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { DiscussionForm } from '@/components/discussion-form'
import { timeAgo } from '@/lib/utils/time'

const PAGE_SIZE = 20

export default async function DiscussionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { id } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const offset = (page - 1) * PAGE_SIZE

  const supabase = await createClient()

  const [{ data: discussions, count }, { data: club }] = await Promise.all([
    supabase
      .from('discussions')
      .select('*, author:profiles!discussions_author_id_fkey(*), chapter:chapters!discussions_chapter_id_fkey(*), comments(count)', { count: 'exact' })
      .eq('club_id', Number(id))
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1),
    supabase
      .from('clubs')
      .select('*, current_book:books(*)')
      .eq('id', Number(id))
      .single(),
  ])

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Discussions</h1>
        <Link href={`/clubs/${id}`} className="text-sm text-gray-500 hover:underline">Back to club</Link>
      </div>

      <DiscussionForm clubId={id} bookId={club?.current_book?.id} />

      <div className="space-y-3">
        {discussions?.map((d: { id: number; title: string; created_at: string; author: { display_name: string } | null; chapter: { title: string } | null; comments: { count: number }[] }) => (
          <Link key={d.id} href={`/clubs/${id}/discussions/${d.id}`}
            className="block rounded-lg border p-4 hover:bg-gray-50">
            <h3 className="font-semibold">{d.title}</h3>
            <p className="text-sm text-gray-600">
              {d.author?.display_name} &middot; {d.chapter?.title ?? 'General'}
              {' \u00b7 '}{d.comments?.[0]?.count ?? 0} comments
              {d.created_at && <> &middot; {timeAgo(d.created_at)}</>}
            </p>
          </Link>
        ))}
        {(!discussions || discussions.length === 0) && (
          <p className="text-center text-gray-400">No discussions yet. Start one above!</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link href={`/clubs/${id}/discussions?page=${page - 1}`}
              className="rounded border px-3 py-1 text-sm hover:bg-gray-50">
              Previous
            </Link>
          )}
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`/clubs/${id}/discussions?page=${page + 1}`}
              className="rounded border px-3 py-1 text-sm hover:bg-gray-50">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
