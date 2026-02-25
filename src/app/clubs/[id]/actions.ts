'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { joinClubSchema } from '@/lib/validations'

type ActionState = { error: string; success?: never } | { success: true; error?: never } | null

export async function joinClub(_prevState: ActionState, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be logged in to join a club' }

  const result = joinClubSchema.safeParse({
    club_id: Number(formData.get('club_id')),
  })
  if (!result.success) return { error: result.error.issues[0].message }

  const clubId = result.data.club_id

  const { data: existing } = await supabase
    .from('club_members')
    .select('id')
    .eq('club_id', clubId)
    .eq('user_id', user.id)
    .single()

  if (existing) return { error: 'You are already a member of this club' }

  const { error } = await supabase.from('club_members').insert({
    club_id: clubId,
    user_id: user.id,
    role: 'member',
  })

  if (error) return { error: error.message }

  revalidatePath(`/clubs/${clubId}`)
  return { success: true as const }
}
