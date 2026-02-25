import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { CopyInviteLink } from './copy-invite-link'

export default async function ClubSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: club } = await supabase
    .from('clubs')
    .select('*')
    .eq('id', Number(id))
    .single()

  if (!club) notFound()

  // Verify admin
  const { data: membership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', Number(id))
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const inviteUrl = club.invite_code ? `${siteUrl}/invite/${club.invite_code}` : null

  return (
    <div className="mx-auto max-w-lg p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Club Settings</h1>
        <Link href={`/clubs/${id}`} className="text-sm text-gray-500 hover:underline">Back to club</Link>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border p-4">
          <h2 className="mb-2 font-semibold">Club Info</h2>
          <p className="text-sm"><strong>Name:</strong> {club.name}</p>
          <p className="text-sm"><strong>Type:</strong> {club.is_public ? 'Public' : 'Private'}</p>
        </div>

        {inviteUrl && (
          <div className="rounded-lg border p-4">
            <h2 className="mb-2 font-semibold">Invite Link</h2>
            <p className="mb-3 text-sm text-gray-600">Share this link to invite people to your club.</p>
            <CopyInviteLink url={inviteUrl} />
          </div>
        )}
      </div>
    </div>
  )
}
