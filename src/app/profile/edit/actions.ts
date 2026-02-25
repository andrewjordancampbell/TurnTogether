'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { updateProfileSchema } from '@/lib/validations'

type ActionState = { error: string; success?: never } | { success: true; error?: never } | null

export async function updateProfile(_prevState: ActionState, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const result = updateProfileSchema.safeParse({
    display_name: formData.get('display_name'),
    bio: formData.get('bio') || undefined,
  })

  if (!result.success) return { error: result.error.issues[0].message }

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: result.data.display_name,
      bio: result.data.bio ?? null,
    })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/profile')
  redirect('/profile')
}
