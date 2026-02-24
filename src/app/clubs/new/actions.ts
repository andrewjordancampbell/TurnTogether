'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createClub(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: club, error } = await supabase
    .from('clubs')
    .insert({
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      is_public: formData.get('is_public') === 'true',
      created_by: user.id,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  // Add creator as admin
  await supabase.from('club_members').insert({
    club_id: club.id,
    user_id: user.id,
    role: 'admin',
  })

  redirect(`/clubs/${club.id}`)
}
