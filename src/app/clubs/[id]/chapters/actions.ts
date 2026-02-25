'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { chapterSchema, deleteChapterSchema } from '@/lib/validations'

type ActionState = { error: string; success?: never } | { success: true; error?: never } | null

export async function addChapter(_prevState: ActionState, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const result = chapterSchema.safeParse({
    club_id: Number(formData.get('club_id')),
    book_id: Number(formData.get('book_id')),
    title: formData.get('title'),
    chapter_number: Number(formData.get('chapter_number')),
    start_page: formData.get('start_page') ? Number(formData.get('start_page')) : undefined,
    end_page: formData.get('end_page') ? Number(formData.get('end_page')) : undefined,
  })

  if (!result.success) return { error: result.error.issues[0].message }

  // Verify admin
  const { data: membership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', result.data.club_id)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') {
    return { error: 'Only club admins can manage chapters' }
  }

  const { error } = await supabase.from('chapters').insert({
    club_id: result.data.club_id,
    book_id: result.data.book_id,
    title: result.data.title,
    chapter_number: result.data.chapter_number,
    start_page: result.data.start_page ?? null,
    end_page: result.data.end_page ?? null,
  })

  if (error) return { error: error.message }
  revalidatePath(`/clubs/${result.data.club_id}/chapters`)
  return { success: true as const }
}

export async function deleteChapter(_prevState: ActionState, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const result = deleteChapterSchema.safeParse({
    chapter_id: Number(formData.get('chapter_id')),
    club_id: Number(formData.get('club_id')),
  })

  if (!result.success) return { error: result.error.issues[0].message }

  // Verify admin
  const { data: membership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', result.data.club_id)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') {
    return { error: 'Only club admins can delete chapters' }
  }

  const { error } = await supabase
    .from('chapters')
    .delete()
    .eq('id', result.data.chapter_id)

  if (error) return { error: error.message }
  revalidatePath(`/clubs/${result.data.club_id}/chapters`)
  return { success: true as const }
}
