import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { SetBookClient } from './set-book-client'

export default async function SetBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Verify admin
  const { data: membership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', Number(id))
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') notFound()

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Set Current Book</h1>
        <Link href={`/clubs/${id}`} className="text-sm text-gray-500 hover:underline">Back to club</Link>
      </div>
      <p className="mb-4 text-sm text-gray-600">Search for a book and select it to set as the club&apos;s current read.</p>
      <SetBookClient clubId={Number(id)} />
    </div>
  )
}
