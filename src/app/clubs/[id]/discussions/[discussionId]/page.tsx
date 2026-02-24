import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { addComment } from '../actions'

export default async function DiscussionPage({
  params,
}: {
  params: Promise<{ id: string; discussionId: string }>
}) {
  const { id, discussionId } = await params
  const supabase = await createClient()

  const { data: discussion } = await supabase
    .from('discussions')
    .select('*, author:profiles(*), chapter:chapters(*)')
    .eq('id', discussionId)
    .single()

  if (!discussion) notFound()

  const { data: comments } = await supabase
    .from('comments')
    .select('*, author:profiles(*)')
    .eq('discussion_id', discussionId)
    .order('created_at', { ascending: true })

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{discussion.title}</h1>
        <p className="text-sm text-gray-500">
          {discussion.author?.display_name} &middot; {discussion.chapter?.title ?? 'General'}
        </p>
        {discussion.content && (
          <p className="mt-4">{discussion.content}</p>
        )}
      </div>

      <div className="mb-6 space-y-4">
        {comments?.map((c: { id: number; author: { display_name: string } | null; content: string }) => (
          <div key={c.id} className="rounded-lg bg-gray-50 p-3">
            <p className="text-sm font-medium">{c.author?.display_name}</p>
            <p className="mt-1 text-sm">{c.content}</p>
          </div>
        ))}
      </div>

      <form action={addComment} className="rounded-lg border p-4">
        <input type="hidden" name="discussion_id" value={discussionId} />
        <input type="hidden" name="club_id" value={id} />
        <textarea name="content" placeholder="Add a comment..." rows={2} required
          className="mb-2 w-full rounded border px-3 py-2" />
        <button type="submit"
          className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800">
          Comment
        </button>
      </form>
    </div>
  )
}
