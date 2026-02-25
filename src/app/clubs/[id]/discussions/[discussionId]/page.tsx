import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CommentForm } from '@/components/comment-form'
import { timeAgo } from '@/lib/utils/time'

const COMMENTS_PER_PAGE = 20

export default async function DiscussionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; discussionId: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { id, discussionId } = await params
  const { page } = await searchParams
  const currentPage = Math.max(1, Number(page) || 1)
  const offset = (currentPage - 1) * COMMENTS_PER_PAGE
  const supabase = await createClient()

  const [{ data: discussion }, { data: comments }, { count }] = await Promise.all([
    supabase
      .from('discussions')
      .select('*, author:profiles!discussions_author_id_fkey(*), chapter:chapters!discussions_chapter_id_fkey(*)')
      .eq('id', Number(discussionId))
      .single(),
    supabase
      .from('comments')
      .select('*, author:profiles!comments_author_id_fkey(*)')
      .eq('discussion_id', Number(discussionId))
      .order('created_at', { ascending: true })
      .range(offset, offset + COMMENTS_PER_PAGE - 1),
    supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('discussion_id', Number(discussionId)),
  ])

  if (!discussion) notFound()

  const totalPages = Math.ceil((count ?? 0) / COMMENTS_PER_PAGE)

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <Link href={`/clubs/${id}/discussions`} className="text-sm text-gray-500 hover:underline">
          &larr; Back to discussions
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{discussion.title}</h1>
        <p className="text-sm text-gray-500">
          {discussion.author?.display_name} &middot; {discussion.chapter?.title ?? 'General'}
          {discussion.created_at && <> &middot; {timeAgo(discussion.created_at)}</>}
        </p>
        {discussion.content && (
          <p className="mt-4">{discussion.content}</p>
        )}
      </div>

      <div className="mb-6 space-y-4">
        {comments?.map((c: { id: number; author: { display_name: string } | null; content: string; created_at: string }) => (
          <div key={c.id} className="rounded-lg bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{c.author?.display_name}</p>
              {c.created_at && (
                <span className="text-xs text-gray-400">{timeAgo(c.created_at)}</span>
              )}
            </div>
            <p className="mt-1 text-sm">{c.content}</p>
          </div>
        ))}
        {(!comments || comments.length === 0) && currentPage === 1 && (
          <p className="text-center text-sm text-gray-400">No comments yet. Be the first!</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mb-6 flex items-center justify-center gap-2">
          {currentPage > 1 && (
            <Link
              href={`/clubs/${id}/discussions/${discussionId}?page=${currentPage - 1}`}
              className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link
              href={`/clubs/${id}/discussions/${discussionId}?page=${currentPage + 1}`}
              className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
            >
              Next
            </Link>
          )}
        </div>
      )}

      <CommentForm discussionId={discussionId} clubId={id} />
    </div>
  )
}
