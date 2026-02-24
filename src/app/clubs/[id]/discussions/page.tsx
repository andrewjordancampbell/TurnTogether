import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { createDiscussion } from './actions'

export default async function DiscussionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: discussions } = await supabase
    .from('discussions')
    .select('*, author:profiles(*), chapter:chapters(*), comments(count)')
    .eq('club_id', id)
    .order('created_at', { ascending: false })

  const { data: club } = await supabase
    .from('clubs')
    .select('*, current_book:books(*)')
    .eq('id', id)
    .single()

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Discussions</h1>
        <Link href={`/clubs/${id}`} className="text-sm text-gray-500 hover:underline">Back to club</Link>
      </div>

      <form action={createDiscussion} className="mb-8 rounded-lg border p-4">
        <h2 className="mb-3 font-semibold">Start a Discussion</h2>
        <input type="hidden" name="club_id" value={id} />
        {club?.current_book && <input type="hidden" name="book_id" value={club.current_book.id} />}
        <input name="title" placeholder="Discussion title" required
          className="mb-2 w-full rounded border px-3 py-2" />
        <textarea name="content" placeholder="What's on your mind?" rows={3}
          className="mb-2 w-full rounded border px-3 py-2" />
        <button type="submit"
          className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800">
          Post
        </button>
      </form>

      <div className="space-y-3">
        {discussions?.map((d: { id: number; title: string; author: { display_name: string } | null; chapter: { title: string } | null; comments: { count: number }[] }) => (
          <Link key={d.id} href={`/clubs/${id}/discussions/${d.id}`}
            className="block rounded-lg border p-4 hover:bg-gray-50">
            <h3 className="font-semibold">{d.title}</h3>
            <p className="text-sm text-gray-600">
              {d.author?.display_name} &middot; {d.chapter?.title ?? 'General'}
              {' \u00b7 '}{d.comments?.[0]?.count ?? 0} comments
            </p>
          </Link>
        ))}
        {(!discussions || discussions.length === 0) && (
          <p className="text-center text-gray-400">No discussions yet. Start one above!</p>
        )}
      </div>
    </div>
  )
}
