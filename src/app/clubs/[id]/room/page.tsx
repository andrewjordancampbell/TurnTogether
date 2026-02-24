import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReadingRoom } from '@/components/reading-room'

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-xl font-bold">Reading Room</h1>
      <ReadingRoom
        clubId={id}
        userId={user.id}
        displayName={profile?.display_name ?? 'Reader'}
      />
    </div>
  )
}
