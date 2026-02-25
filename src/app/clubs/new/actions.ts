'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClubSchema } from '@/lib/validations'

type ActionState = { error: string } | null

export async function createClub(_prevState: ActionState, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const result = createClubSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    is_public: formData.get('is_public') === 'true',
  })

  if (!result.success) return { error: result.error.issues[0].message }

  const { data: club, error } = await supabase
    .from('clubs')
    .insert({
      name: result.data.name,
      description: result.data.description ?? null,
      is_public: result.data.is_public,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  const { error: memberError } = await supabase.from('club_members').insert({
    club_id: club.id,
    user_id: user.id,
    role: 'admin',
  })

  if (memberError) {
    await supabase.from('clubs').delete().eq('id', club.id)
    return { error: 'Failed to set up club admin. Please try again.' }
  }

  redirect(`/clubs/${club.id}`)
}
