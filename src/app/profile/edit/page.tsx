import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ProfileEditForm } from './profile-edit-form'

export default async function EditProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="mx-auto max-w-lg p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <Link href="/profile" className="text-sm text-gray-500 hover:underline">Cancel</Link>
      </div>
      <ProfileEditForm
        displayName={profile?.display_name ?? ''}
        bio={profile?.bio ?? ''}
      />
    </div>
  )
}
