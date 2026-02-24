import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: memberships } = await supabase
    .from('club_members')
    .select('club:clubs(name)')
    .eq('user_id', user.id)

  const { data: progress } = await supabase
    .from('reading_progress')
    .select('*, book:books(*)')
    .eq('user_id', user.id)

  const booksCompleted = progress?.filter((p: { percent_complete: number }) => p.percent_complete >= 100).length ?? 0
  const booksInProgress = progress?.filter((p: { percent_complete: number }) => p.percent_complete < 100).length ?? 0

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-2 text-2xl font-bold">{profile?.display_name}</h1>
      {profile?.bio && <p className="mb-6 text-gray-600">{profile.bio}</p>}

      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold">{booksCompleted}</p>
          <p className="text-xs text-gray-500">Books Completed</p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold">{booksInProgress}</p>
          <p className="text-xs text-gray-500">In Progress</p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold">{memberships?.length ?? 0}</p>
          <p className="text-xs text-gray-500">Clubs</p>
        </div>
      </div>

      {progress && progress.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Reading History</h2>
          <div className="space-y-2">
            {progress.map((p: { id: number; book: { title: string } | null; percent_complete: number }) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                <span className="font-medium text-sm">{p.book?.title}</span>
                <span className="text-xs text-gray-400">{Math.round(p.percent_complete)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
